const Product = require("../models/productModel");
const pool = require("../config/db");
const sharp = require("sharp");
const slugify = require("slugify");
const path = require("path");
const fs = require("fs");
const { z } = require("zod");

// Schemat walidacji dla produktu
const productSchema = z
  .object({
    name: z
      .string()
      .min(2, "Nazwa musi mieć co najmniej 2 znaki.")
      .max(150, "Nazwa jest za długa."),
    short_description: z.string().min(1, "Krótki opis jest wymagany."),
    description: z.string().min(1, "Pełny opis jest wymagany."),

    price_brut: z.coerce
      .number({ invalid_type_error: "Cena musi być poprawną liczbą." })
      .min(0, "Cena nie może być ujemna."),

    // NOWE POLA: Zamieniamy puste stringi z formularza na czysty null
    promotional_price: z
      .any()
      .transform((val) =>
        val === "" || val === "null" || val == null ? null : Number(val),
      ),
    lowest_price_30_days: z
      .any()
      .transform((val) =>
        val === "" || val === "null" || val == null ? null : Number(val),
      ),

    subcategory_id: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : null)),
    is_available: z
      .any()
      .transform((val) =>
        val === "true" || val === "1" || val === 1 || val === true ? 1 : 0,
      ),
    is_bestseller: z
      .any()
      .transform((val) =>
        val === "true" || val === "1" || val === 1 || val === true ? 1 : 0,
      ),

    attributes: z.string().optional(),
    imageAttributes: z.string().optional(),
    newImageAttributes: z.string().optional(),
    existingImages: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // MAGICZNA WALIDACJA OMNIBUS:
    // Jeśli podano cenę promocyjną (i jest większa od zera)...
    if (data.promotional_price !== null && data.promotional_price > 0) {
      // 1. Wymagaj podania najniższej ceny z 30 dni!
      if (
        data.lowest_price_30_days === null ||
        isNaN(data.lowest_price_30_days)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Dyrektywa Omnibus: Musisz podać najniższą cenę z 30 dni przed obniżką!",
          path: ["lowest_price_30_days"], // Zaznaczy to pole w przypadku błędu
        });
      }

      // 2. Cena promocyjna nie może być wyższa lub równa normalnej cenie!
      if (data.promotional_price >= data.price_brut) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Cena promocyjna musi być niższa niż cena regularna!",
          path: ["promotional_price"],
        });
      }
    }
  });

const logError = (method, error) => {
  console.error(`--- BŁĄD W ${method} ---`);
  console.error(error);
  console.error("--------------------------");
};

exports.getProducts = async (req, res, next) => {
  try {
    // Wyciągamy 'color' z query params (?color=#FFFFFF)
    const { subcategory, category, color } = req.query;

    const products = await Product.findAll({
      subcategorySlug: subcategory,
      categorySlug: category,
      colorHex: color, // <--- PRZEKAZUJEMY DO MODELU
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
  // 1. BEZPIECZNE PARSOWANIE ZOD (Nie przerywa działania aplikacji w razie błędu)
  const parsedData = productSchema.safeParse(req.body);

  if (!parsedData.success) {
    // ZMIANA: Bezpieczne wyciąganie błędu (używamy .issues zamiast .errors)
    const errorMessage =
      parsedData.error.issues?.[0]?.message || "Nieprawidłowe dane formularza.";
    return res.status(400).json({ error: errorMessage });
  }

  // Wyciągamy czyste i gotowe do bazy dane z parsedData.data!
  const {
    name,
    short_description,
    subcategory_id,
    description,
    price_brut,
    promotional_price, // <--- DODANE
    lowest_price_30_days, // <--- DODANE
    is_bestseller,
    is_available,
    attributes,
    imageAttributes,
  } = parsedData.data;

  const files = req.files;

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // AUTOMATYCZNE ZEROWANIE: niedostępny produkt nie może być bestsellerem
    const finalBestseller = is_available === 0 ? 0 : is_bestseller;

    // 2. WALIDACJA LIMITU BESTSELLERÓW
    if (finalBestseller === 1) {
      const count = await Product.countBestsellers();
      if (count >= 3) {
        connection.release();
        return res.status(400).json({
          error: "Osiągnięto limit 3 bestsellerów dla widocznych produktów.",
        });
      }
    }

    const slug = `${slugify(name, { lower: true })}-${Date.now()}`;

    // 3. PRZEKAZANIE DO MODELU
    const productId = await Product.create(connection, {
      subcategory_id,
      name,
      short_description,
      slug,
      description,
      price_brut,
      promotional_price, // <--- DODANE
      lowest_price_30_days, // <--- DODANE
      is_bestseller: finalBestseller,
      is_available,
    });

    // ... I TUTAJ LECI DALEJ TWÓJ KOD OBSŁUGUJĄCY ZDJĘCIA ...
    if (files && files.length > 0) {
      const productFolder = path.join(
        __dirname,
        "../uploads/products",
        productId.toString(),
      );
      if (!fs.existsSync(productFolder))
        fs.mkdirSync(productFolder, { recursive: true });

      // NOWOŚĆ: Dekodowanie powiązań zdjęć z kolorami
      let parsedImageAttributes = [];
      if (req.body.imageAttributes) {
        try {
          parsedImageAttributes = JSON.parse(req.body.imageAttributes);
        } catch (e) {
          console.log("Błąd parsowania imageAttributes", e);
        }
      }

      for (let i = 0; i < files.length; i++) {
        const fileName = `bliss-${Date.now()}-${i}.webp`;
        const relativePath = `${productId}/${fileName}`;

        // NOWOŚĆ: Wyciągamy kolor ORAZ flagę miniatury
        const imgData = parsedImageAttributes[i] || {};
        const attrValueId = imgData.attribute_value_id
          ? Number(imgData.attribute_value_id)
          : null;
        const isMain = imgData.is_main ? 1 : 0;

        await sharp(files[i].buffer)
          .resize(1200)
          .toFormat("webp")
          .toFile(path.join(productFolder, fileName));

        // ZMIANA: Przekazujemy isMain zamiast sztywnego i === 0
        await Product.addImage(
          connection,
          productId,
          relativePath,
          isMain,
          attrValueId,
        );
      }
    }

    // 5. Atrybuty
    if (attributes && attributes !== "undefined") {
      const parsedAttrs = JSON.parse(attributes);
      for (const attr of parsedAttrs) {
        // ZMIANA: Zabezpieczenie przed pustym stringiem
        const finalPrice = attr.price ? parseFloat(attr.price) : 0;
        await Product.addAttribute(connection, productId, attr.id, finalPrice);
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

  // 1. BEZPIECZNE PARSOWANIE ZOD (tak samo jak w create)
  const parsedData = productSchema.safeParse(req.body);

  if (!parsedData.success) {
    // ZMIANA: Bezpieczne wyciąganie błędu
    const errorMessage =
      parsedData.error.issues?.[0]?.message || "Nieprawidłowe dane formularza.";
    return res.status(400).json({ error: errorMessage });
  }

  // Wyciągamy zwalidowane, czyste dane z parsedData.data!
  const {
    name,
    short_description,
    subcategory_id,
    description,
    price_brut,
    promotional_price, // <--- DODANE
    lowest_price_30_days, // <--- DODANE
    is_bestseller,
    is_available,
    attributes,
    newImageAttributes,
    existingImages,
  } = parsedData.data;

  const files = req.files;

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // AUTOMATYCZNE WYŁĄCZENIE: Jeśli produkt jest niedostępny, nie może być bestsellerem
    // (Zod już zamienił "true" na 1, więc operujemy czysto na liczbach)
    const finalBestseller = is_available === 0 ? 0 : is_bestseller;

    // 2. Walidacja bestsellerów
    if (finalBestseller === 1) {
      const count = await Product.countBestsellers();
      const current = await Product.getBestsellerStatus(connection, id);

      // Jeśli produkt nie był bestsellerem, a teraz ma nim zostać, sprawdź limit
      if (count >= 3 && current.is_bestseller === 0) {
        connection.release();
        return res.status(400).json({
          error: "Osiągnięto limit 3 bestsellerów dla widocznych produktów.",
        });
      }
    }

    // 3. Wywołanie modelu (przekazujemy zwalidowane dane)
    await Product.update(connection, id, {
      subcategory_id: subcategory_id || null,
      name: name || null,
      short_description: short_description || null,
      description: description || null,
      price_brut: price_brut || null,
      promotional_price:
        promotional_price !== undefined ? promotional_price : null, // <--- DODANE (zabezpieczenie na null)
      lowest_price_30_days:
        lowest_price_30_days !== undefined ? lowest_price_30_days : null, // <--- DODANE
      is_bestseller: finalBestseller,
      is_available: is_available,
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

      let parsedNewImageAttributes = [];
      if (newImageAttributes) {
        try {
          parsedNewImageAttributes = JSON.parse(newImageAttributes);
        } catch (e) {
          console.log("Błąd parsowania", e);
        }
      }

      for (let i = 0; i < files.length; i++) {
        const fileName = `bliss-upd-${Date.now()}-${Math.round(Math.random() * 100)}.webp`;
        const relativePath = `${id}/${fileName}`;

        const imgData = parsedNewImageAttributes[i] || {};
        const attrValueId = imgData.attribute_value_id
          ? Number(imgData.attribute_value_id)
          : null;
        const isMain = imgData.is_main ? 1 : 0;

        await sharp(files[i].buffer)
          .resize(1200)
          .toFormat("webp")
          .toFile(path.join(productFolder, fileName));

        await Product.addImage(
          connection,
          id,
          relativePath,
          isMain,
          attrValueId,
        );
      }
    }

    // 5. Atrybuty
    if (attributes && attributes !== "undefined") {
      await Product.clearAttributes(connection, id);
      const parsedAttrs = JSON.parse(attributes);
      for (const attr of parsedAttrs) {
        // ZMIANA: Zabezpieczenie przed pustym stringiem
        const finalPrice = attr.price ? parseFloat(attr.price) : 0;
        await Product.addAttribute(connection, id, attr.id, finalPrice);
      }
    }

    // 6. Aktualizacja kolorów na JUŻ ISTNIEJĄCYCH zdjęciach
    if (existingImages) {
      const existingImagesArr = JSON.parse(existingImages);
      for (const img of existingImagesArr) {
        // ZMIANA: Aktualizujemy też kolumnę is_main!
        await connection.execute(
          "UPDATE product_images SET attribute_value_id = ?, is_main = ? WHERE id = ?",
          [img.attribute_value_id || null, img.is_main ? 1 : 0, img.id],
        );
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
    // 1. Próba pobrania danych o zdjęciu
    const image = await Product.getImageById(req.params.imageId);

    // 2. Jeśli zdjęcie nie istnieje, zwróć 404 i zakończ funkcję
    if (!image) {
      return res.status(404).json({ error: "Zdjęcie nie istnieje." });
    }

    // 3. Jeśli istnieje, wykonaj operacje usuwania
    const fullPath = path.join(__dirname, "../uploads/products", image.url);

    // Usuwanie pliku fizycznego
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // Usuwanie wpisu z bazy danych
    await Product.deleteImageRecord(req.params.imageId);

    // 4. Sukces wysyłamy TYLKO po faktycznym usunięciu
    res.json({ success: true, message: "Zdjęcie zostało usunięte." });
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
