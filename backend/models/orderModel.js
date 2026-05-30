// models/orderModel.js
const pool = require("../config/db");

class Order {
  // 1. Zapisuje całe zamówienie w ramach jednej transakcji
  static async create(connection, orderData, items, customer) {
    try {
      // 1. Dodajemy główne zamówienie (tabela: orders)
      const [orderResult] = await connection.execute(
        `INSERT INTO orders (order_token, status, total_brut, p24_session_id, payment_method, wants_invoice) 
         VALUES (?, 'waiting_payment', ?, ?, ?, ?)`,
        [
          orderData.order_token,
          orderData.total_brut,
          orderData.p24_session_id, // Nasz unikalny identyfikator sesji dla P24
          orderData.payment_method,
          orderData.wants_invoice,
        ],
      );

      const orderId = orderResult.insertId;

      // 2. Dodajemy pozycje zamówienia (tabela: order_items)
      for (const item of items) {
        // Łapiemy cechy "luzem", które wysyła Twój CartContext i tłumaczymy je na ładne polskie etykiety
        const options = {};

        if (item.size) options["Rozmiar"] = item.size;
        if (item.fabric) options["Tkanina"] = item.fabric;
        if (item.side) options["Strona"] = item.side;
        if (item.headrest) options["Zagłówek"] = item.headrest;
        // Jeśli w przyszłości dodasz np. kolor do koszyka, dopisz to tutaj:
        // if (item.color) options["Kolor"] = item.color;

        // Jeśli są jakieś opcje, zamieniamy na JSON. Jeśli nie - null.
        const optionsJson =
          Object.keys(options).length > 0 ? JSON.stringify(options) : null;

        await connection.execute(
          `INSERT INTO order_items (order_id, product_id, quantity, price_brut_snapshot, selected_options) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            orderId,
            item.id,
            item.quantity,
            item.price, // Cena u klienta
            optionsJson,
          ],
        );
      }

      // 3. Dodajemy dane do wysyłki (tabela: shipping_details)
      await connection.execute(
        `INSERT INTO shipping_details 
         (order_id, recipient_first_name, recipient_last_name, street, apartment, postal_code, city, recipient_email, recipient_phone, company_name, nip, paczkomat_code, notes, method, cost) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          customer.firstName,
          customer.lastName,
          customer.street,
          customer.apartment || null,
          customer.postalCode,
          customer.city,
          customer.email,
          customer.phone,
          customer.companyName || null,
          customer.nip || null,
          customer.paczkomatCode || null,
          customer.notes || null,
          orderData.delivery_method,
          orderData.shipping_cost,
        ],
      );

      return orderId;
    } catch (error) {
      throw error; // Rzucamy błąd wyżej, żeby kontroler mógł zrobić rollback
    }
  }

  // Helper: Aktualizacja statusu na opłacone (przyda nam się później do webhooka z Przelewy24)
  static async updateStatus(p24SessionId, status) {
    const [result] = await pool.execute(
      `UPDATE orders SET status = ? WHERE p24_session_id = ?`,
      [status, p24SessionId],
    );
    return result.affectedRows > 0;
  }

  static async getByToken(token) {
    // Pobieramy zamówienie i dane wysyłki na podstawie unikalnego order_token
    const [rows] = await pool.execute(
      `SELECT o.*, s.recipient_first_name, s.recipient_last_name, s.street, s.apartment, s.city, s.postal_code, s.method as delivery_method, s.cost as shipping_cost, s.company_name, s.nip, s.paczkomat_code
       FROM orders o
       LEFT JOIN shipping_details s ON o.id = s.order_id
       WHERE o.order_token = ?`,
      [token],
    );

    if (rows.length === 0) return null;
    const order = rows[0];

    // Pobieramy przedmioty z tego zamówienia
    const [items] = await pool.execute(
      `SELECT oi.*, p.name, pi.url as image
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_main = 1
       WHERE oi.order_id = ?`,
      [order.id],
    );

    return { ...order, items };
  }

  // --- NOWOŚĆ: METODY POTRZEBNE DO WYSYŁKI MAILI AUTOMATYCZNYCH ---

  // Pobieranie zamówienia po ID (używane przy zmianie statusu przez Admina)
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT o.*, s.recipient_first_name, s.recipient_last_name, s.recipient_email 
       FROM orders o 
       LEFT JOIN shipping_details s ON o.id = s.order_id 
       WHERE o.id = ?`,
      [id],
    );
    if (rows.length === 0) return null;
    return rows[0];
  }

  // Pobieranie zamówienia po sesji P24 (używane przy webhooku płatności)
  static async getBySessionId(sessionId) {
    const [rows] = await pool.execute(
      `SELECT o.*, s.recipient_first_name, s.recipient_last_name, s.recipient_email 
       FROM orders o 
       LEFT JOIN shipping_details s ON o.id = s.order_id 
       WHERE o.p24_session_id = ?`,
      [sessionId],
    );
    if (rows.length === 0) return null;
    return rows[0];
  }
  // -----------------------------------------------------------------

  // Zwraca WSZYSTKIE zamówienia wraz z tablicą ich produktów dla panelu Admina
  static async getAllAdmin() {
    // Pobieramy główne dane zamówień wraz ze szczegółami dostawy
    const [orders] = await pool.execute(`
      SELECT o.*, 
             s.recipient_first_name, s.recipient_last_name, s.recipient_email, s.recipient_phone,
             s.street, s.apartment, s.city, s.postal_code, s.method as delivery_method, 
             s.cost as shipping_cost, s.company_name, s.nip, s.paczkomat_code, s.notes
      FROM orders o
      LEFT JOIN shipping_details s ON o.id = s.order_id
      ORDER BY o.created_at DESC
    `);

    // Aby zminimalizować ilość zapytań do bazy, pobieramy od razu WSZYSTKIE produkty dla tych zamówień
    const [allProducts] = await pool.execute(`
      SELECT oi.*, p.name, pi.url as image
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_main = 1
    `);

    // Grupujemy i przypinamy produkty do odpowiednich zamówień
    return orders.map((order) => ({
      ...order,
      items: allProducts.filter((item) => item.order_id === order.id),
    }));
  }

  // Służy do ręcznej zmiany statusu zamówienia przez Admina
  static async updateOrderStatusAdmin(orderId, newStatus) {
    await pool.execute(`UPDATE orders SET status = ? WHERE id = ?`, [
      newStatus,
      orderId,
    ]);
  }
}

module.exports = Order;
