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

// ZOD: Schemat dla nowej opinii (wymagamy teraz też ID produktu)
const submitReviewSchema = z.object({
  token: z.string().min(10, "Nieprawidłowy token."),
  product_id: z.coerce.number().positive("Nieprawidłowe ID produktu."),
  rating: z.number().int().min(1).max(5, "Ocena musi być od 1 do 5 gwiazdek."),
  author_name: z.string().min(2, "Podaj prawidłowe imię."),
  comment: z.string().optional(),
});

// --- NOWE ENDPOINTY DLA SYSTEMU OPINII ---

// 1. Zwraca listę produktów, które klient może jeszcze ocenić z danego linku
exports.getReviewSession = async (req, res, next) => {
  try {
    const { token } = req.params;
    const products = await Review.getProductsByToken(token);

    if (products.length === 0) {
      return res
        .status(404)
        .json({
          error: "Link wygasł lub wszystkie produkty zostały już ocenione.",
        });
    }

    res.json(products);
  } catch (error) {
    logError("getReviewSession", error);
    next(error);
  }
};

// 2. Dodawanie opinii dla konkretnego produktu z listy
exports.submitReview = async (req, res, next) => {
  try {
    const parsed = submitReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { token, product_id, rating, author_name, comment } = parsed.data;

    // Sprawdzamy czy dany token pasuje do TEGO konkretnego produktu
    const tokenData = await Review.verifyTokenForProduct(token, product_id);

    if (!tokenData) {
      return res.status(404).json({ error: "Nieprawidłowe żądanie oceny." });
    }
    if (tokenData.is_used) {
      return res
        .status(400)
        .json({ error: "Ta opinia została już wystawiona!" });
    }
    if (new Date(tokenData.expires_at) < new Date()) {
      return res
        .status(400)
        .json({ error: "Link do wystawienia opinii wygasł." });
    }

    // Dodanie opinii
    await Review.addReview(product_id, author_name, rating, comment);

    // Spalenie tokena (tylko dla tej jednej sztuki mebla)
    await Review.markTokenAsUsed(tokenData.id);

    res.status(201).json({
      success: true,
      message: "Dziękujemy! Twoja opinia została pomyślnie dodana.",
    });
  } catch (error) {
    logError("submitReview", error);
    next(error);
  }
};

// --- STARE ENDPOINTY ADMINA I PRODUKTÓW ---

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
      return res.status(400).json({ error: parsed.error.issues[0].message });
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
      return res.status(400).json({ error: parsed.error.issues[0].message });
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

    const parsedId = parseInt(productId, 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: "Nieprawidłowe ID produktu." });
    }

    const reviews = await Review.findByProductId(parsedId);
    res.json(reviews);
  } catch (error) {
    logError("getProductReviews", error);
    next(error);
  }
};
