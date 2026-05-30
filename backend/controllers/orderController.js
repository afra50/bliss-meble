const Order = require("../models/orderModel");
const pool = require("../config/db");
const { z } = require("zod");
const { v4: uuidv4 } = require("uuid");
const p24 = require("../services/p24");
const emailService = require("../services/emailService");

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

// Schemat walidacji zmiany statusu przez Admina
const updateStatusSchema = z.object({
  status: z.enum([
    "waiting_payment",
    "paid",
    "packed",
    "shipped",
    "cancelled",
    "in_delivery",
    "ready_for_pickup",
    "completed",
  ]),
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

    // NOWOŚĆ: WYSYŁKA MAILA Z PODZIĘKOWANIEM W TLE
    // Puszczamy maila, ale nie czekamy na odpowiedź (brak await przed tym wywołaniem),
    // aby strona podsumowania u klienta załadowała się natychmiastowo.
    emailService
      .sendOrderConfirmation(
        {
          id: orderId,
          payment_method: paymentMethod,
          delivery_method: deliveryMethod,
          total_brut: totalAmount,
          order_token: orderToken,
          shipping_cost: shippingCost,
        },
        items,
        customer,
      )
      .catch((err) => console.error("Błąd wysyłki maila potwierdzenia:", err));

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

    // NOWOŚĆ: POWIADOMIENIE, ŻE SYSTEM ZAKSIĘGOWAŁ WPŁATĘ AUTOMATYCZNIE
    try {
      // Wyciągamy zamówienie po session_id (Twoja metoda updateStatus mogłaby zwracać token lub wywołujemy model)
      // Musisz dopisać w orderModel zapytanie, które pobierze zamówienie na podstawie p24_session_id
      const [rows] = await pool.execute(
        `SELECT o.*, s.recipient_first_name, s.recipient_email 
         FROM orders o LEFT JOIN shipping_details s ON o.id = s.order_id 
         WHERE o.p24_session_id = ?`,
        [p24_session_id],
      );
      if (rows.length > 0) {
        const fullOrderData = rows[0];
        // Wysyłamy, że status to "paid"
        emailService
          .sendOrderStatusUpdate(fullOrderData)
          .catch((e) => console.error("Błąd maila p24Notify", e));
      }
    } catch (mailErr) {
      console.error("Problem przy pobieraniu danych do maila po P24", mailErr);
    }

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

exports.getAdminAllOrders = async (req, res) => {
  try {
    const orders = await Order.getAllAdmin();
    res.json(orders);
  } catch (error) {
    console.error("Błąd pobierania zamówień (Admin):", error);
    res.status(500).json({ error: "Błąd serwera." });
  }
};

exports.updateOrderStatusAdmin = async (req, res) => {
  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Nieprawidłowy lub nieobsługiwany status zamówienia." });
  }

  try {
    const { id } = req.params;
    const { status } = parsed.data;

    await Order.updateOrderStatusAdmin(id, status);

    // NOWOŚĆ: POWIADAMIAMY KLIENTA O RĘCZNEJ ZMIANIE STATUSU PRZEZ ADMINA
    try {
      const order = await Order.findById(id); // <--- Sprawdź czy posiadasz taką metodę w orderModel!
      if (order) {
        // Ponieważ updateOrderStatusAdmin zmienił już to w bazie, wyciągniemy aktualny stan
        order.status = status;

        // Wysyłka maila informacyjnego o statusie
        emailService
          .sendOrderStatusUpdate(order)
          .catch((e) => console.error("Błąd wysyłki statusu admin:", e));

        // Zależność: Prośba o recenzję PO ZAKOŃCZENIU
        if (status === "completed") {
          emailService
            .sendReviewRequest(order)
            .catch((e) => console.error("Błąd wysyłki zapytania o opinie:", e));
        }
      }
    } catch (mailErr) {
      console.error("Błąd pobrania zamówienia dla maila (Admin):", mailErr);
    }

    res.json({ success: true, message: "Status zaktualizowany" });
  } catch (error) {
    console.error("Błąd aktualizacji statusu (Admin):", error);
    res.status(500).json({ error: "Błąd serwera." });
  }
};
