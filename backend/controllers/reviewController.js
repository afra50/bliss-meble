const Review = require("../models/reviewModel");
const { z } = require("zod");

const logError = (method, error) => {
  console.error(`--- BŁĄD W REVIEW:${method} ---`);
  console.error(error);
  console.error("--------------------------");
};

// Walidacja ID
const idSchema = z.object({
  id: z.coerce.number().positive("Nieprawidłowe ID opinii."),
});

exports.getAdminReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findAllAdmin();
    res.json(reviews);
  } catch (error) {
    logError("getAdminReviews", error);
    next(error);
  }
};

exports.approveReview = async (req, res, next) => {
  try {
    const parsed = idSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const success = await Review.approve(parsed.data.id);
    if (!success) {
      return res.status(404).json({ error: "Opinia nie została znaleziona." });
    }

    res.json({ success: true, message: "Opinia została zatwierdzona." });
  } catch (error) {
    logError("approveReview", error);
    next(error);
  }
};

exports.rejectReview = async (req, res, next) => {
  try {
    const parsed = idSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const success = await Review.delete(parsed.data.id);
    if (!success) {
      return res.status(404).json({ error: "Opinia nie została znaleziona." });
    }

    res.json({
      success: true,
      message: "Opinia została odrzucona i usunięta.",
    });
  } catch (error) {
    logError("rejectReview", error);
    next(error);
  }
};

exports.getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Upewniamy się, że to liczba
    const parsedId = parseInt(productId, 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: "Nieprawidłowe ID produktu." });
    }

    const reviews = await Review.findByProductId(parsedId);

    // Zwracamy pustą tablicę, jeśli nie ma recenzji (nie rzucamy błędem 404!)
    res.json(reviews);
  } catch (error) {
    logError("getProductReviews", error);
    next(error);
  }
};
