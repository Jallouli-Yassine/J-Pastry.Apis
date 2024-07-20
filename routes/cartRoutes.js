var express = require('express');
var router = express.Router();
const cartController = require("../controller/cartController");
/* Appel apis. */


router.post('/addToCart/:userId/:itemId/:itemType', cartController.addItemToCart);



module.exports = router;
