var express = require('express');
var router = express.Router();
const productController = require("../controller/productController");
const multer = require('../middleware/multer-config');

/* Appel apis. */
router
    .route('/')
    .get(productController.getAllProducts);

router.post('/:idCateg', multer.single('image'),productController.addProduct)

router
    .route('/:id')
    .get(productController.getOneProduct)
    .put(productController.updateProduct)
    .delete(productController.deletedProduct);

module.exports = router;

