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
};

module.exports = Review;
