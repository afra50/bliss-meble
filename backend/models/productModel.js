const pool = require("../config/db");

const Product = {
  // Pobieranie listy z filtrowaniem
  findAll: async ({
    subcategorySlug,
    categorySlug,
    isBestseller,
    isAdmin = false,
  }) => {
    let query = `
      SELECT p.id, p.name, p.short_description, p.slug, p.price_brut, p.is_bestseller, p.is_available, p.created_at,
             pi.url as main_image, s.name as subcategory_name, c.name as category_name 
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_main = 1
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE p.is_deleted = 0
    `; // Dodano p.created_at
    const params = [];

    if (!isAdmin) query += " AND p.is_available = 1";
    if (subcategorySlug) {
      query += " AND s.slug = ?";
      params.push(subcategorySlug);
    }
    if (categorySlug) {
      query += " AND c.slug = ?";
      params.push(categorySlug);
    }
    if (isBestseller) query += " AND p.is_bestseller = 1 LIMIT 3";

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  findBySlug: async (slug) => {
    const [productRows] = await pool.execute(
      "SELECT * FROM products WHERE slug = ? AND is_deleted = 0 AND is_available = 1",
      [slug],
    );

    if (productRows.length === 0) return null;
    const product = productRows[0];

    const [images] = await pool.execute(
      "SELECT id, url, is_main FROM product_images WHERE product_id = ?",
      [product.id],
    );

    const [attributes] = await pool.execute(
      `
      SELECT av.id as value_id, av.value, ag.name as group_name, pa.price_modifier
      FROM product_attributes pa
      JOIN attribute_values av ON pa.attribute_value_id = av.id
      JOIN attribute_groups ag ON av.group_id = ag.id
      WHERE pa.product_id = ?
    `,
      [product.id],
    );

    return { ...product, images, attributes };
  },

  findById: async (id) => {
    // 1. Pobieramy dane podstawowe produktu
    const [productRows] = await pool.execute(
      "SELECT * FROM products WHERE id = ? AND is_deleted = 0",
      [id],
    );

    if (productRows.length === 0) return null;
    const product = productRows[0];

    // 2. Pobieramy wszystkie zdjęcia
    const [images] = await pool.execute(
      "SELECT id, url, is_main FROM product_images WHERE product_id = ?",
      [product.id],
    );

    // 3. Pobieramy atrybuty (tkaniny/rozmiary) wraz z dopłatami
    const [attributes] = await pool.execute(
      `SELECT av.id as value_id, av.value, ag.name as group_name, pa.price_modifier
       FROM product_attributes pa
       JOIN attribute_values av ON pa.attribute_value_id = av.id
       JOIN attribute_groups ag ON av.group_id = ag.id
       WHERE pa.product_id = ?`,
      [product.id],
    );

    return { ...product, images, attributes };
  },

  findAllAdmin: async () => {
    const query = `
      SELECT p.id, p.name, p.short_description, p.price_brut, p.is_available, p.created_at, pi.url as main_image, s.name as subcategory_name 
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_main = 1
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      WHERE p.is_deleted = 0
      ORDER BY p.created_at DESC
    `; // Dodano p.created_at
    const [rows] = await pool.execute(query);
    return rows;
  },

  search: async (keyword) => {
    // 1. Rozbijamy frazę na słowa i usuwamy puste znaki
    const words = keyword.trim().split(/\s+/);

    // 2. Budujemy dynamiczną część zapytania: p.name LIKE ? AND p.name LIKE ? ...
    const conditions = words.map(() => `p.name LIKE ?`).join(" AND ");

    const query = `
      SELECT p.*, pi.url as main_image FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_main = 1
      WHERE (${conditions}) AND p.is_deleted = 0 AND p.is_available = 1
    `;

    // 3. Przygotowujemy parametry (każde słowo owijamy w %)
    const params = words.map((word) => `%${word}%`);

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  countBestsellers: async () => {
    const [rows] = await pool.execute(
      "SELECT COUNT(*) as total FROM products WHERE is_bestseller = 1 AND is_deleted = 0 AND is_available = 1", // Dodano AND is_available = 1
    );
    return rows[0].total;
  },

  softDelete: async (id) => {
    await pool.execute("UPDATE products SET is_deleted = 1 WHERE id = ?", [id]);
  },

  getImageById: async (imageId) => {
    const [rows] = await pool.execute(
      "SELECT * FROM product_images WHERE id = ?",
      [imageId],
    );
    return rows[0];
  },

  deleteImageRecord: async (imageId) => {
    await pool.execute("DELETE FROM product_images WHERE id = ?", [imageId]);
  },

  // --- METODY DO TRANSAKCJI ---

  create: async (connection, data) => {
    const {
      subcategory_id,
      name,
      short_description,
      slug,
      description,
      price_brut,
      is_bestseller,
      is_available, // DODAJ TO
    } = data;

    const [result] = await connection.execute(
      // DODAJ is_available DO INSERT I VALUES
      "INSERT INTO products (subcategory_id, name, short_description, slug, description, price_brut, is_bestseller, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        subcategory_id,
        name,
        short_description,
        slug,
        description,
        price_brut,
        is_bestseller,
        is_available, // DODAJ TO
      ],
    );
    return result.insertId;
  },

  // models/productModel.js
  update: async (connection, id, data) => {
    // Pobieramy aktualny stan produktu z bazy
    const [current] = await connection.execute(
      "SELECT * FROM products WHERE id = ?",
      [id],
    );
    const p = current[0];

    // Jeśli nowa wartość jest undefined, używamy starej z bazy
    const finalData = {
      subcategory_id: data.subcategory_id ?? p.subcategory_id,
      name: data.name ?? p.name,
      short_description: data.short_description ?? p.short_description,
      description: data.description ?? p.description,
      price_brut: data.price_brut ?? p.price_brut,
      is_bestseller: data.is_bestseller ?? p.is_bestseller,
      is_available: data.is_available ?? p.is_available,
    };

    await connection.execute(
      `UPDATE products SET subcategory_id = ?, name = ?, short_description = ?, description = ?, price_brut = ?, is_bestseller = ?, is_available = ? 
     WHERE id = ?`,
      [
        finalData.subcategory_id,
        finalData.name,
        finalData.short_description,
        finalData.description,
        finalData.price_brut,
        finalData.is_bestseller,
        finalData.is_available,
        id,
      ],
    );
  },

  addImage: async (connection, productId, url, isMain) => {
    await connection.execute(
      "INSERT INTO product_images (product_id, url, is_main) VALUES (?, ?, ?)",
      [productId, url, isMain],
    );
  },

  clearAttributes: async (connection, productId) => {
    await connection.execute(
      "DELETE FROM product_attributes WHERE product_id = ?",
      [productId],
    );
  },

  addAttribute: async (connection, productId, attrId, price) => {
    await connection.execute(
      "INSERT INTO product_attributes (product_id, attribute_value_id, price_modifier) VALUES (?, ?, ?)",
      [productId, attrId, price],
    );
  },

  getBestsellerStatus: async (connection, id) => {
    const [rows] = await connection.execute(
      "SELECT is_bestseller FROM products WHERE id = ?",
      [id],
    );
    return rows[0];
  },
};

module.exports = Product;
