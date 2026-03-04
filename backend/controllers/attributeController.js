const Attribute = require("../models/attributeModel");

const logError = (method, error) => {
  console.error(`--- BŁĄD W ATTR:${method} ---`);
  console.error(error);
  console.error("--------------------------");
};

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
    const { group_id, value } = req.body;
    if (!group_id || !value)
      return res.status(400).json({ error: "ID grupy i wartość są wymagane." });
    const id = await Attribute.createValue(group_id, value);
    res.status(201).json({ id, group_id, value });
  } catch (error) {
    logError("createValue", error);
    next(error);
  }
};

exports.deleteValue = async (req, res, next) => {
  try {
    // Pobieramy ID wartości z parametrów URL
    const { id } = req.params;

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
