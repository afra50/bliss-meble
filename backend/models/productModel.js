const pool = require("../config/db");

const Product = {
  // Pobieranie listy z filtrowaniem
  findAll: async ({
    subcategorySlug,
    categorySlug,
    isBestseller,
    colorHex,
    isAdmin = false,
  }) => {
    // KLUCZOWE: Dodajemy podzapytania do SELECT
    let query = `
      SELECT DISTINCT p.*, 
             pi.url as main_image, s.name as subcategory_name, c.name as category_name,
             (SELECT COUNT(*) FROM reviews WHERE product_id = p.id AND is_approved = 1) AS reviews_count,
             (SELECT IFNULL(ROUND(AVG(rating), 1), 0) FROM reviews WHERE product_id = p.id AND is_approved = 1) AS average_rating
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_main = 1
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      LEFT JOIN product_attributes pa ON p.id = pa.product_id
      LEFT JOIN attribute_values av ON pa.attribute_value_id = av.id
      WHERE p.is_deleted = 0
    `;
    const params = [];

    if (!isAdmin) query += " AND p.is_available = 1"; // Tu musi być spacja przed AND!
    if (subcategorySlug) {
      query += " AND s.slug = ?";
      params.push(subcategorySlug);
    }
    if (categorySlug) {
      query += " AND c.slug = ?";
      params.push(categorySlug);
    }
    if (colorHex) {
      query += " AND av.color_hex = ?";
      params.push(colorHex);
    }
    if (isBestseller) {
      query += " AND p.is_bestseller = 1";
    }

    query += " ORDER BY p.created_at DESC";
    if (isBestseller) query += " LIMIT 3";

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  // Tutaj jest SELECT *, więc automatycznie pobierze nowe kolumny
  findBySlug: async (slug) => {
    // Tu też musimy policzyć opinie dla konkretnego produktu
    const [productRows] = await pool.execute(
      `
      SELECT p.*,
             (SELECT COUNT(*) FROM reviews WHERE product_id = p.id AND is_approved = 1) AS reviews_count,
             (SELECT IFNULL(ROUND(AVG(rating), 1), 0) FROM reviews WHERE product_id = p.id AND is_approved = 1) AS average_rating
      FROM products p 
      WHERE p.slug = ? AND p.is_deleted = 0 AND p.is_available = 1
    `,
      [slug],
    );

    if (productRows.length === 0) return null;
    const product = productRows[0];

    const [images] = await pool.execute(
      "SELECT id, url, is_main, attribute_value_id FROM product_images WHERE product_id = ?",
      [product.id],
    );

    const [attributes] = await pool.execute(
      `
      SELECT av.id as value_id, av.value, av.image_url, ag.name as group_name, pa.price_modifier
      FROM product_attributes pa
      JOIN attribute_values av ON pa.attribute_value_id = av.id
      JOIN attribute_groups ag ON av.group_id = ag.id
      WHERE pa.product_id = ?
    `,
      [product.id],
    );

    return { ...product, images, attributes };
  },

  // Tutaj również jest SELECT *, nic nie trzeba zmieniać
  findById: async (id) => {
    const [productRows] = await pool.execute(
      "SELECT * FROM products WHERE id = ? AND is_deleted = 0",
      [id],
    );

    if (productRows.length === 0) return null;
    const product = productRows[0];

    const [images] = await pool.execute(
      "SELECT id, url, is_main, attribute_value_id FROM product_images WHERE product_id = ?",
      [product.id],
    );

    const [attributes] = await pool.execute(
      `SELECT av.id as value_id, av.value, av.image_url, ag.name as group_name, pa.price_modifier
       FROM product_attributes pa
       JOIN attribute_values av ON pa.attribute_value_id = av.id
       JOIN attribute_groups ag ON av.group_id = ag.id
       WHERE pa.product_id = ?`,
      [product.id],
    );

    return { ...product, images, attributes };
  },

  findAllAdmin: async () => {
    // ZMIANA: Dodano p.promotional_price oraz p.lowest_price_30_days dla widoku tabeli w adminie
    const query = `
      SELECT p.id, p.name, p.short_description, p.price_brut, 
             p.promotional_price, p.lowest_price_30_days, 
             p.is_available, p.created_at, pi.url as main_image, s.name as subcategory_name 
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_main = 1
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      WHERE p.is_deleted = 0
      ORDER BY p.created_at DESC
    `;
    const [rows] = await pool.execute(query);
    return rows;
  },

  // Tutaj jest SELECT p.*, więc też automatycznie uwzględni nowe kolumny
  search: async (keyword) => {
    const words = keyword.trim().split(/\s+/);
    const conditions = words.map(() => `p.name LIKE ?`).join(" AND ");

    const query = `
      SELECT p.*, pi.url as main_image,
             (SELECT COUNT(*) FROM reviews WHERE product_id = p.id AND is_approved = 1) AS reviews_count,
             (SELECT IFNULL(ROUND(AVG(rating), 1), 0) FROM reviews WHERE product_id = p.id AND is_approved = 1) AS average_rating
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_main = 1
      WHERE (${conditions}) AND p.is_deleted = 0 AND p.is_available = 1
    `;
    const params = words.map((word) => `%${word}%`);
    const [rows] = await pool.execute(query, params);
    return rows;
  },

  countBestsellers: async () => {
    const [rows] = await pool.execute(
      "SELECT COUNT(*) as total FROM products WHERE is_bestseller = 1 AND is_deleted = 0 AND is_available = 1",
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
    // ZMIANA: Wyciągnięto promotional_price i lowest_price_30_days
    const {
      subcategory_id,
      name,
      short_description,
      slug,
      description,
      price_brut,
      promotional_price,
      lowest_price_30_days,
      is_bestseller,
      is_available,
    } = data;

    // ZMIANA: Zaktualizowano polecenie INSERT INTO
    const [result] = await connection.execute(
      "INSERT INTO products (subcategory_id, name, short_description, slug, description, price_brut, promotional_price, lowest_price_30_days, is_bestseller, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        subcategory_id,
        name,
        short_description,
        slug,
        description,
        price_brut,
        promotional_price,
        lowest_price_30_days,
        is_bestseller,
        is_available,
      ],
    );
    return result.insertId;
  },

  update: async (connection, id, data) => {
    const [current] = await connection.execute(
      "SELECT * FROM products WHERE id = ?",
      [id],
    );
    const p = current[0];

    // ZMIANA: Zabezpieczono nowymi polami (używamy tego co przyszło z frontu, lub zostawiamy to co było w bazie)
    const finalData = {
      subcategory_id: data.subcategory_id ?? p.subcategory_id,
      name: data.name ?? p.name,
      short_description: data.short_description ?? p.short_description,
      description: data.description ?? p.description,
      price_brut: data.price_brut ?? p.price_brut,
      promotional_price:
        data.promotional_price !== undefined
          ? data.promotional_price
          : p.promotional_price,
      lowest_price_30_days:
        data.lowest_price_30_days !== undefined
          ? data.lowest_price_30_days
          : p.lowest_price_30_days,
      is_bestseller: data.is_bestseller ?? p.is_bestseller,
      is_available: data.is_available ?? p.is_available,
    };

    // ZMIANA: Zaktualizowano zapytanie UPDATE
    await connection.execute(
      `UPDATE products SET subcategory_id = ?, name = ?, short_description = ?, description = ?, price_brut = ?, promotional_price = ?, lowest_price_30_days = ?, is_bestseller = ?, is_available = ? 
      WHERE id = ?`,
      [
        finalData.subcategory_id,
        finalData.name,
        finalData.short_description,
        finalData.description,
        finalData.price_brut,
        finalData.promotional_price,
        finalData.lowest_price_30_days,
        finalData.is_bestseller,
        finalData.is_available,
        id,
      ],
    );
  },

  addImage: async (
    connection,
    productId,
    url,
    isMain,
    attributeValueId = null,
  ) => {
    await connection.execute(
      "INSERT INTO product_images (product_id, url, is_main, attribute_value_id) VALUES (?, ?, ?, ?)",
      [productId, url, isMain, attributeValueId],
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
