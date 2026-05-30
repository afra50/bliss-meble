const pool = require("../config/db");

const Review = {
  // Pobieranie wszystkich opinii dla admina (z dołączoną nazwą produktu)
  findAllAdmin: async () => {
    const query = `
      SELECT r.*, p.name as product_name, pi.url as main_image
      FROM reviews r
      LEFT JOIN products p ON r.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_main = 1
      ORDER BY r.created_at DESC
    `;
    const [rows] = await pool.execute(query);
    return rows;
  },

  // Zatwierdzenie opinii (zmienia is_approved na 1)
  approve: async (id) => {
    const [result] = await pool.execute(
      "UPDATE reviews SET is_approved = 1 WHERE id = ?",
      [id],
    );
    return result.affectedRows > 0;
  },

  // Odrzucenie (całkowite usunięcie z bazy)
  delete: async (id) => {
    const [result] = await pool.execute("DELETE FROM reviews WHERE id = ?", [
      id,
    ]);
    return result.affectedRows > 0;
  },

  findByProductId: async (productId) => {
    const query = `
      SELECT id, author_name as author, rating, comment as content, created_at as date, is_verified 
      FROM reviews 
      WHERE product_id = ? AND is_approved = 1
      ORDER BY created_at DESC
    `;
    const [rows] = await pool.execute(query, [productId]);
    return rows;
  },

  // --- SYSTEM LINKÓW ZBIORCZYCH ---

  // 1. Generuje wpisy w tabeli dla całego zamówienia z JEDNYM tokenem
  createTokensForOrder: async (orderId, items, token, expiresAt) => {
    // items to tablica produktów. Używamy Set, by uniknąć duplikatów jeśli ktoś kupił np. 2 sztuki tego samego mebla
    const uniqueProductIds = [
      ...new Set(items.map((item) => item.product_id || item.id)),
    ];

    for (const pid of uniqueProductIds) {
      await pool.execute(
        "INSERT INTO review_tokens (order_id, product_id, token, expires_at) VALUES (?, ?, ?, ?)",
        [orderId, pid, token, expiresAt],
      );
    }
  },

  // 2. Pobieranie produktów do oceny po tokenie (Tylko nieocenione!)
  getProductsByToken: async (token) => {
    const query = `
      SELECT rt.product_id, p.name, pi.url as image
      FROM review_tokens rt
      JOIN products p ON rt.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_main = 1
      WHERE rt.token = ? AND rt.is_used = 0 AND rt.expires_at > NOW()
    `;
    const [rows] = await pool.execute(query, [token]);
    return rows;
  },

  // 3. Weryfikacja tokena DLA KONKRETNEGO PRODUKTU
  verifyTokenForProduct: async (token, productId) => {
    const query = `
      SELECT id, is_used, expires_at 
      FROM review_tokens 
      WHERE token = ? AND product_id = ?
    `;
    const [rows] = await pool.execute(query, [token, productId]);
    return rows.length > 0 ? rows[0] : null;
  },

  // 4. Zapis nowej opinii do bazy
  addReview: async (productId, authorName, rating, comment) => {
    const query = `
      INSERT INTO reviews (product_id, author_name, rating, comment, is_approved, is_verified)
      VALUES (?, ?, ?, ?, 0, 1)
    `;
    const [result] = await pool.execute(query, [
      productId,
      authorName,
      rating,
      comment || null,
    ]);
    return result.insertId;
  },

  // 5. Spalenie tokena (ale tylko dla tego konkretnego produktu!)
  markTokenAsUsed: async (tokenId) => {
    await pool.execute("UPDATE review_tokens SET is_used = 1 WHERE id = ?", [
      tokenId,
    ]);
  },
};

module.exports = Review;
