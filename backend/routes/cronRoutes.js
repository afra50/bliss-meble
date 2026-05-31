const express = require("express");
const router = express.Router();
const cronController = require("../controllers/cronController");

// Metoda POST, żeby przeglądarka z ciekawości tego nie odpaliła
router.post("/db-cleanup", cronController.runCleanup);

module.exports = router;
