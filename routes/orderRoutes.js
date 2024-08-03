const express = require('express');
const router = express.Router();
const orderController = require("../controller/orderController");

router.post('/placeOrder/:userId', orderController.placeOrder);
router.put('/updateOrderStatus/:orderId/:status', orderController.updateOrderStatus);
router.get('/ordersByStatus/:status', orderController.getOrdersByStatus);

module.exports = router;
