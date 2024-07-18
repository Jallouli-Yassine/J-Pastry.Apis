var express = require('express');
var router = express.Router();
const packController = require("../controller/packController");
/* Appel apis. */
router
    .route('/')
    .get(packController.getAllPacks)
    .post(packController.addPack)

router.post('/addProduct/:idPack/:idProduct/:quantity', packController.addNewProductToPack);
router.post('/removeProduct/:idPack/:idProduct', packController.removeProductFromPack);

router
    .route('/:id')
    .get(packController.getOnePack)
    .put(packController.updatePack)
    .delete(packController.deletedPack);

router.put('/discount/:id', packController.updateDiscountForPack);

module.exports = router;

