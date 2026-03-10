const Attribute = require("../models/attributeModel");
const { z } = require("zod");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs").promises;

const logError = (method, error) => {
  console.error(`--- BŁĄD W ATTR:${method} ---`);
  console.error(error);
  console.error("--------------------------");
};

// --- SCHEMATY ZOD ---
const createValueSchema = z.object({
  group_id: z.coerce
    .number({ invalid_type_error: "ID grupy musi być liczbą." })
    .positive("ID grupy jest nieprawidłowe."),
  value: z
    .string()
    .min(1, "Wartość atrybutu jest wymagana (nie może być pusta)."),
  // Form Data przesyła puste pola jako puste stringi lub string "null"
  color_hex: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === "null" || val === "" ? null : val)),
});

const deleteValueSchema = z.object({
  id: z.coerce.number().positive("ID usuwanego atrybutu musi być liczbą."),
});

exports.getAttributes = async (req, res, next) => {
  try {
    const attributes = await Attribute.findAllGroupsWithValues();
    res.json(attributes);
  } catch (error) {
    logError("getAttributes", error);
    next(error);
  }
};

exports.createValue = async (req, res, next) => {
  try {
    const parsedData = createValueSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res
        .status(400)
        .json({ error: parsedData.error.errors[0].message });
    }

    const { group_id, value, color_hex } = parsedData.data;
    let imageUrl = null;

    // OBSŁUGA ZDJĘCIA (jeśli zostało przesłane)
    if (req.file) {
      // Generujemy unikalną nazwę (np. attr-1701234567.webp)
      const filename = `attr-${Date.now()}-${Math.round(Math.random() * 1000)}.webp`;
      const uploadDir = path.join(__dirname, "../uploads/attributes");

      // Tworzymy folder 'uploads/attributes' jeśli nie istnieje
      await fs.mkdir(uploadDir, { recursive: true });

      const filepath = path.join(uploadDir, filename);

      // Skalujemy i optymalizujemy próbkę tkaniny (miniaturka)
      await sharp(req.file.buffer)
        .resize({ width: 250, height: 250, fit: "cover" }) // Kwadratowe proporcje są najlepsze dla tkanin
        .webp({ quality: 80 })
        .toFile(filepath);

      imageUrl = filename; // Zapisujemy do bazy tylko nazwę pliku
    }

    // Przekazujemy imageUrl do modelu
    const id = await Attribute.createValue(
      group_id,
      value,
      color_hex || null,
      imageUrl,
    );

    res
      .status(201)
      .json({ id, group_id, value, color_hex, image_url: imageUrl });
  } catch (error) {
    logError("createValue", error);
    next(error);
  }
};

exports.deleteValue = async (req, res, next) => {
  try {
    const parsedParams = deleteValueSchema.safeParse(req.params);

    if (!parsedParams.success) {
      return res
        .status(400)
        .json({ error: parsedParams.error.errors[0].message });
    }

    const { id } = parsedParams.data;

    // 1. Zanim usuniemy atrybut z bazy, musimy pobrać informację, czy miał zdjęcie
    const attribute = await Attribute.getValueById(id);

    if (!attribute) {
      return res.status(404).json({ error: "Atrybut nie istnieje." });
    }

    // 2. Usuwamy fizyczny plik zdjęcia z folderu uploads/attributes/
    if (attribute.image_url) {
      const fullPath = path.join(
        __dirname,
        "../uploads/attributes",
        attribute.image_url,
      );

      try {
        // Sprawdzamy czy plik fizycznie istnieje na dysku (fs.access rzuci błędem jeśli nie ma)
        await fs.access(fullPath);
        // Jeśli jest - usuwamy
        await fs.unlink(fullPath);
      } catch (fileError) {
        // Jeśli pliku nie ma na dysku, to po prostu go ignorujemy i idziemy dalej
        console.log("Plik nie istnieje na dysku, pomijam usuwanie:", fullPath);
      }
    }

    // 3. Usuwamy rekord z bazy danych
    await Attribute.deleteValue(id);

    res.json({
      success: true,
      message:
        "Wartość atrybutu oraz powiązane zdjęcie zostały pomyślnie usunięte.",
    });
  } catch (error) {
    logError("deleteValue", error);
    next(error);
  }
};
