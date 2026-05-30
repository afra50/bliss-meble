const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { auth, adminOnly } = require("../middleware/authMiddleware");

// Trasy publiczne dla klientów
router.get("/product/:productId", reviewController.getProductReviews);
router.get("/session/:token", reviewController.getReviewSession); // <-- NOWA TRASA
router.post("/submit", reviewController.submitReview);

// Wszystkie trasy opinii w panelu wymagają logowania jako admin
router.get("/admin/all", auth, adminOnly, reviewController.getAdminReviews);
router.patch("/:id/approve", auth, adminOnly, reviewController.approveReview);
router.delete("/:id", auth, adminOnly, reviewController.rejectReview);

module.exports = router;
