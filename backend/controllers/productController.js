const Product = require("../models/productModel");
const pool = require("../config/db");
const sharp = require("sharp");
const slugify = require("slugify");
const path = require("path");
const fs = require("fs");

const logError = (method, error) => {
  console.error(`--- BŁĄD W ${method} ---`);
  console.error(error);
  console.error("--------------------------");
};

exports.getProducts = async (req, res, next) => {
  try {
    const { subcategory, category } = req.query;
    const products = await Product.findAll({
      subcategorySlug: subcategory,
      categorySlug: category,
      isAdmin: false,
    });
    res.json(products);
  } catch (error) {
    logError("getProducts", error);
    next(error);
  }
};

exports.getAdminProducts = async (req, res, next) => {
  try {
    const products = await Product.findAllAdmin();
    res.json(products);
  } catch (error) {
    logError("getAdminProducts", error);
    next(error);
  }
};

exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findBySlug(req.params.slug);
    if (!product)
      return res.status(404).json({ error: "Produkt nie istnieje" });
    res.json(product);
  } catch (error) {
    logError("getProductBySlug", error);
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Produkt nie istnieje" });
    }
    res.json(product);
  } catch (error) {
    logError("getProductById", error);
    next(error);
  }
};

exports.getBestsellers = async (req, res, next) => {
  try {
    const products = await Product.findAll({ isBestseller: true });
    res.json(products);
  } catch (error) {
    logError("getBestsellers", error);
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  const {
    name,
    short_description,
    subcategory_id,
    description,
    price_brut,
    is_bestseller,
    attributes,
  } = req.body;
  const files = req.files;

  if (!name || !short_description || !description || !price_brut) {
    return res
      .status(400)
      .json({ error: "Nazwa, opis krótki, opis długi i cena są wymagane." });
  }

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    if (is_bestseller === "true") {
      const count = await Product.countBestsellers();
      if (count >= 3) {
        connection.release();
        return res
          .status(400)
          .json({ error: "Osiągnięto limit 3 bestsellerów." });
      }
    }

    const slug = `${slugify(name, { lower: true })}-${Date.now()}`;
    const productId = await Product.create(connection, {
      subcategory_id,
      name,
      short_description,
      slug,
      description,
      price_brut,
      is_bestseller: is_bestseller === "true" ? 1 : 0,
    });

    if (files && files.length > 0) {
      const productFolder = path.join(
        __dirname,
        "../uploads/products",
        productId.toString(),
      );
      if (!fs.existsSync(productFolder))
        fs.mkdirSync(productFolder, { recursive: true });

      for (let i = 0; i < files.length; i++) {
        const fileName = `bliss-${Date.now()}-${i}.webp`;
        const relativePath = `${productId}/${fileName}`;

        await sharp(files[i].buffer)
          .resize(1200)
          .toFormat("webp")
          .toFile(path.join(productFolder, fileName));
        await Product.addImage(
          connection,
          productId,
          relativePath,
          i === 0 ? 1 : 0,
        );
      }
    }

    if (attributes && attributes !== "undefined") {
      const parsedAttrs = JSON.parse(attributes);
      for (const attr of parsedAttrs) {
        await Product.addAttribute(connection, productId, attr.id, attr.price);
      }
    }

    await connection.commit();
    res.status(201).json({ success: true, productId });
  } catch (error) {
    if (connection) await connection.rollback();
    logError("createProduct", error);
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

exports.updateProduct = async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    short_description,
    subcategory_id,
    description,
    price_brut,
    is_bestseller,
    is_available,
    attributes,
  } = req.body;
  const files = req.files;

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // 1. Rzutowanie wartości (zabezpieczenie przed undefined)
    const bestsellerVal =
      is_bestseller === "true" || is_bestseller == 1 ? 1 : 0;
    const availableVal = is_available === "true" || is_available == 1 ? 1 : 0;

    // 2. Walidacja bestsellerów
    if (bestsellerVal === 1) {
      const count = await Product.countBestsellers();
      const current = await Product.getBestsellerStatus(connection, id);
      if (count >= 3 && current.is_bestseller === 0) {
        connection.release();
        return res
          .status(400)
          .json({ error: "Osiągnięto limit 3 bestsellerów." });
      }
    }

    // 3. Wywołanie modelu z zabezpieczonymi danymi
    // Używamy operatora || null, aby zamienić undefined na null (akceptowalne przez SQL)
    await Product.update(connection, id, {
      subcategory_id: subcategory_id || null,
      name: name || null,
      short_description: short_description || null,
      description: description || null,
      price_brut: price_brut || null,
      is_bestseller: bestsellerVal,
      is_available: availableVal,
    });

    // 4. Obsługa nowych zdjęć
    if (files && files.length > 0) {
      const productFolder = path.join(
        __dirname,
        "../uploads/products",
        id.toString(),
      );
      if (!fs.existsSync(productFolder))
        fs.mkdirSync(productFolder, { recursive: true });

      for (const file of files) {
        const fileName = `bliss-upd-${Date.now()}-${Math.round(Math.random() * 100)}.webp`;
        const relativePath = `${id}/${fileName}`;

        await sharp(file.buffer)
          .resize(1200)
          .toFormat("webp")
          .toFile(path.join(productFolder, fileName));
        await Product.addImage(connection, id, relativePath, 0);
      }
    }

    // 5. Atrybuty
    if (attributes && attributes !== "undefined") {
      await Product.clearAttributes(connection, id);
      const parsedAttrs = JSON.parse(attributes);
      for (const attr of parsedAttrs) {
        await Product.addAttribute(connection, id, attr.id, attr.price);
      }
    }

    await connection.commit();
    res.json({ success: true, message: "Produkt zaktualizowany" });
  } catch (error) {
    if (connection) await connection.rollback();
    logError("updateProduct", error);
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    await Product.softDelete(req.params.id);
    res.json({ success: true, message: "Produkt został usunięty" });
  } catch (error) {
    logError("deleteProduct", error);
    next(error);
  }
};

exports.deleteImage = async (req, res, next) => {
  try {
    const image = await Product.getImageById(req.params.imageId);
    if (image) {
      const fullPath = path.join(__dirname, "../uploads/products", image.url);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      await Product.deleteImageRecord(req.params.imageId);
    }
    res.json({ success: true });
  } catch (error) {
    logError("deleteImage", error);
    next(error);
  }
};

exports.searchProducts = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const products = await Product.search(q);
    res.json(products);
  } catch (error) {
    logError("searchProducts", error);
    next(error);
  }
};
