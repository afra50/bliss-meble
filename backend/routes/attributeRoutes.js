const express = require("express");
const router = express.Router();
const attributeController = require("../controllers/attributeController");
const { auth, adminOnly } = require("../middleware/authMiddleware");

// NOWOŚĆ: Importujemy middleware z Multerem (upewnij się, że nazwa folderu to "middleware" czy "middlewares")
const { imageOnly } = require("../middleware/uploadMiddleware");

// Pobieranie jest publiczne (potrzebne na karcie produktu)
router.get("/", attributeController.getAttributes);

// Operacje admina (wymagają tokenu i roli admin)
// ZMIANA: Dodano imageOnly.single("image") po autoryzacji
router.post(
  "/values",
  auth,
  adminOnly,
  imageOnly.single("image"),
  attributeController.createValue,
);

router.delete("/values/:id", auth, adminOnly, attributeController.deleteValue);

module.exports = router;
