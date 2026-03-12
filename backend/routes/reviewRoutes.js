const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { auth, adminOnly } = require("../middleware/authMiddleware");

router.get("/product/:productId", reviewController.getProductReviews);

// Wszystkie trasy opinii w panelu wymagają logowania jako admin
router.get("/admin/all", auth, adminOnly, reviewController.getAdminReviews);

// PATCH jest idealny do częściowej aktualizacji (zmiana statusu is_approved)
router.patch("/:id/approve", auth, adminOnly, reviewController.approveReview);

// DELETE do odrzucenia/usunięcia opinii
router.delete("/:id", auth, adminOnly, reviewController.rejectReview);

module.exports = router;
