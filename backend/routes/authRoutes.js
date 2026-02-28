const express = require("express");
const router = express.Router();

// Importujemy funkcje z kontrolera, który przed chwilą zaktualizowaliśmy
const {
  login,
  logout,
  checkAuth,
  refresh,
} = require("../controllers/authController");

// ==========================================
// 🔐 TRASY AUTORYZACJI (ENDPOINTY API)
// ==========================================

// 1. Logowanie - generuje tokeny (Access i Refresh) i ustawia je w ciastkach
router.post("/login", login);

// 2. Wylogowanie - usuwa ciastka z przeglądarki
router.post("/logout", logout);

// 3. Odświeżenie sesji - używa refresh_token (ważnego 14 dni) do wygenerowania nowego auth_token (na kolejne 15 min)
router.post("/refresh", refresh);

// 4. Sprawdzenie sesji - frontend wywołuje to za każdym razem po odświeżeniu strony (F5),
// żeby sprawdzić, czy admin dalej jest zalogowany
router.get("/me", checkAuth);

module.exports = router;
