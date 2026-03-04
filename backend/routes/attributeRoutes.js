const express = require("express");
const router = express.Router();
const attributeController = require("../controllers/attributeController");
const { auth, adminOnly } = require("../middleware/authMiddleware");

// Pobieranie jest publiczne (potrzebne na karcie produktu)
router.get("/", attributeController.getAttributes);

// Operacje admina (wymagają tokenu i roli admin)
router.post("/values", auth, adminOnly, attributeController.createValue);
router.delete("/values/:id", auth, adminOnly, attributeController.deleteValue);

module.exports = router;
