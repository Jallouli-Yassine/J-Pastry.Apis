var express = require('express');
var router = express.Router();
const categController = require("../controller/categoryController");

/* Appel apis. */
router
    .route('/')
    .get(categController.getAllCategory)
    .post(categController.addCategory)

router
    .route('/:id')
    .get(categController.getOneCategory)
    .put(categController.updateCateg)
    .delete(categController.deletedCategory);

module.exports = router;

