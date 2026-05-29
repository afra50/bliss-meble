const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.post("/", orderController.createOrder);

// Czysty webhook
router.post("/p24/notify", orderController.p24Notify);

router.get("/token/:token", orderController.getOrderByToken);

// Endpointy dla ADMINA
router.get("/admin/all", orderController.getAdminAllOrders);
router.patch("/admin/:id/status", orderController.updateOrderStatusAdmin);

module.exports = router;
