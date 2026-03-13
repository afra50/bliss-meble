const express = require("express");
const router = express.Router();
const settingController = require("../controllers/settingController");
const { auth, adminOnly } = require("../middleware/authMiddleware");

// Obie trasy są chronione - tylko dla admina
router.get(
	"/shipping-costs",
	auth,
	adminOnly,
	settingController.getShippingCosts,
);
router.put(
	"/shipping-costs",
	auth,
	adminOnly,
	settingController.updateShippingCosts,
);

module.exports = router;
