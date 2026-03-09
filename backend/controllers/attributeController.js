const Attribute = require("../models/attributeModel");
const { z } = require("zod");

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
  // NOWOŚĆ: Opcjonalny kod HEX
  color_hex: z.string().nullable().optional(),
});

const deleteValueSchema = z.object({
  id: z.coerce.number().positive("ID usuwanego atrybutu musi być liczbą."),
});

exports.getAttributes = async (req, res, next) => {
  try {
    // Tutaj nie ma czego walidować, bo to prosty GET
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

    // NOWOŚĆ: Wyciągamy też color_hex
    const { group_id, value, color_hex } = parsedData.data;

    // Przekazujemy color_hex do modelu
    const id = await Attribute.createValue(group_id, value, color_hex || null);
    res.status(201).json({ id, group_id, value, color_hex });
  } catch (error) {
    logError("createValue", error);
    next(error);
  }
};

exports.deleteValue = async (req, res, next) => {
  try {
    // Walidujemy parametry z URL (req.params)
    const parsedParams = deleteValueSchema.safeParse(req.params);

    if (!parsedParams.success) {
      return res
        .status(400)
        .json({ error: parsedParams.error.errors[0].message });
    }

    const { id } = parsedParams.data;

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
