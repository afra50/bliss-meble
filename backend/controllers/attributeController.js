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

    // TODO w przyszłości: Można tu dodać usuwanie pliku fizycznie z dysku,
    // żeby nie zaśmiecać serwera usuniętymi tkaninami

    await Attribute.deleteValue(id);

    res.json({
      success: true,
      message: "Wartość atrybutu została pomyślnie usunięta.",
    });
  } catch (error) {
    logError("deleteValue", error);
    next(error);
  }
};
