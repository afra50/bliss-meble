const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.post("/", orderController.createOrder);

// Czysty webhook
router.post("/p24/notify", orderController.p24Notify);

router.get("/token/:token", orderController.getOrderByToken);

module.exports = router;
