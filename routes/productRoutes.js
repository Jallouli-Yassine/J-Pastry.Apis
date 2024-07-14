var express = require('express');
var router = express.Router();
const productController = require("../controller/productController");

/* Appel apis. */
router
    .route('/')
    .get(productController.getAllProducts);

router.post('/:idCateg',productController.addProduct)

router
    .route('/:id')
    .get(productController.getOneProduct)
    .put(productController.updateProduct)
    .delete(productController.deletedProduct);

module.exports = router;

