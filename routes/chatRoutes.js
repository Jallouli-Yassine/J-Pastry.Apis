const express = require('express');
const router = express.Router();
const chatController = require('../controller/chatController');

router.get('/order/:orderId', chatController.getChatByOrderId);
router.post('/:chatId/message/:senderId', chatController.sendMessage);

module.exports = router;
