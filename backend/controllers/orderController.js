const Order = require("../models/orderModel");
const pool = require("../config/db");
const { z } = require("zod");
const { v4: uuidv4 } = require("uuid");
const p24 = require("../services/p24");

// Walidacja Zod
const checkoutSchema = z.object({
  items: z.array(z.any()).min(1, "Koszyk jest pusty"),
  customer: z.object({
    firstName: z.string().min(2, "Imię jest wymagane"),
    lastName: z.string().min(2, "Nazwisko jest wymagane"),
    street: z.string().min(2, "Ulica jest wymagana"),
    apartment: z.string().optional(),
    postalCode: z.string().min(5, "Kod pocztowy jest wymagany"),
    city: z.string().min(2, "Miasto jest wymagane"),
    phone: z.string().min(5, "Telefon jest wymagany"),
    email: z.string().email("Niepoprawny e-mail"),
    companyName: z.string().optional(),
    nip: z.string().optional(),
    notes: z.string().optional(),
    paczkomatCode: z.string().optional(),
    wantsInvoice: z.boolean().optional().default(false),
  }),
  deliveryMethod: z.string(),
  paymentMethod: z.string(),
  shippingCost: z.number(),
  totalAmount: z.number().min(0.01),
});

exports.createOrder = async (req, res, next) => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const {
    items,
    customer,
    deliveryMethod,
    paymentMethod,
    shippingCost,
    totalAmount,
  } = parsed.data;

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const orderToken = uuidv4();
    const p24SessionId = uuidv4();

    const orderData = {
      order_token: orderToken,
      total_brut: totalAmount,
      p24_session_id: p24SessionId,
      payment_method: paymentMethod,
      wants_invoice: customer.wantsInvoice ? 1 : 0,
      delivery_method: deliveryMethod,
      shipping_cost: shippingCost,
    };

    const orderId = await Order.create(connection, orderData, items, customer);
    await connection.commit();

    let paymentUrl = null;

    if (paymentMethod === "online") {
      const frontendReturnUrl = `${process.env.PUBLIC_FRONTEND_URL}/zamowienie/podsumowanie/${orderToken}`;
      const frontendCancelUrl = `${process.env.PUBLIC_FRONTEND_URL}/platnosc-anulowana`;

      const p24Result = await p24.registerTransaction({
        sessionId: p24SessionId,
        amountPln: totalAmount,
        email: customer.email,
        description: `Zamowienie nr ${orderId} - Bliss Meble`,
        returnUrl: frontendReturnUrl,
        cancelUrl: frontendCancelUrl,
      });

      paymentUrl = p24Result.redirectUrl;
    }

    res.status(201).json({ success: true, orderToken, paymentUrl });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Błąd tworzenia zamówienia:", error);
    res
      .status(500)
      .json({ error: "Błąd serwera podczas składania zamówienia." });
  } finally {
    if (connection) connection.release();
  }
};

exports.p24Notify = async (req, res) => {
  try {
    const { p24_session_id, p24_order_id, p24_amount } = req.body;

    if (!p24_session_id || !p24_order_id || !p24_amount) {
      return res.status(400).send("Missing parameters");
    }

    await p24.verifyTransaction({
      sessionId: p24_session_id,
      orderId: p24_order_id,
      amountPln: p24_amount / 100,
    });

    await Order.updateStatus(p24_session_id, "paid");
    res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Błąd webhooka:", error);
    res.status(400).send("Verification failed");
  }
};

exports.getOrderByToken = async (req, res, next) => {
  try {
    const { token } = req.params;
    const order = await Order.getByToken(token);
    if (!order) {
      return res
        .status(404)
        .json({ error: "Nie znaleziono takiego zamówienia." });
    }
    res.json(order);
  } catch (error) {
    console.error("Błąd pobierania zamówienia po tokenie:", error);
    res.status(500).json({ error: "Błąd serwera." });
  }
};
