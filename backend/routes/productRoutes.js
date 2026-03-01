const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { auth, adminOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Teraz to zadziała, bo w middleware wyeksportowaliśmy obiekt { imageOnly }
const productPhotos = upload.imageOnly.array("images", 10);

// === 1. TRASY SPECYFICZNE (NA SAMĄ GÓRĘ) ===
router.get("/search", productController.searchProducts); // Wyszukiwarka
router.get("/bestsellers", productController.getBestsellers); // Top 3
router.get("/admin/all", auth, adminOnly, productController.getAdminProducts);
router.get("/admin/:id", auth, adminOnly, productController.getProductById);

// === 2. TRASY BEZPARAMETROWE POST / GET (ŚRODEK) ===
router.post(
  "/",
  auth,
  adminOnly,
  productPhotos,
  productController.createProduct,
); // Dodawanie
router.get("/", productController.getProducts); // Lista publiczna

// === 3. TRASY Z KONKRETNYMI PRZEDROSTKAMI (NAD :id) ===
// Bardzo ważne: /image/:imageId musi być nad /:id
router.delete(
  "/image/:imageId",
  auth,
  adminOnly,
  productController.deleteImage,
);

// === 4. TRASY Z PARAMETRAMI DYNAMICZNYMI (:id, :slug) ===
router.put(
  "/:id",
  auth,
  adminOnly,
  productPhotos,
  productController.updateProduct,
); // Edycja
router.delete("/:id", auth, adminOnly, productController.deleteProduct); // Soft delete

// Karta produktu po slugu - absolutnie na samym dole
router.get("/single/:slug", productController.getProductBySlug);

module.exports = router;
