const express = require("express");
const router = express.Router();
const settingController = require("../controllers/settingController");
const { auth, adminOnly } = require("../middleware/authMiddleware");

// ZMIANA: Pobieranie kosztów musi być PUBLICZNE (usunięto auth i adminOnly)
router.get("/shipping-costs", settingController.getShippingCosts);

// ZMIANA: Aktualizacja kosztów pozostaje CHRONIONA - tylko dla admina
router.put(
  "/shipping-costs",
  auth,
  adminOnly,
  settingController.updateShippingCosts,
);

module.exports = router;
