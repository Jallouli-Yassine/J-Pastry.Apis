const Product = require('./../models/product.schema')
const Pack = require('./../models/pack.schema')
const AppError = require('./../middleware/errorHandler');
let e = new AppError('_', 0);
// Add product route handler

const getTotalPrice = async (idPack) => {
    try {
        const pack = await Pack.findById(idPack).populate('products.product');

        if (!pack) {
            throw new Error('No pack found with that ID');
        }

        // Calculate the initial total price based on pricePerUnit and quantity
        const initTotalPrice = pack.products.reduce((acc, p) => {
            return acc + (p.product.pricePerUnit * p.quantity);
        }, 0);

        const afterDiscount = initTotalPrice * (1 - (pack.discount || 0) / 100);

        console.log(initTotalPrice, afterDiscount);

        return {
            initTotalPrice,
            afterDiscount
        };
    } catch (err) {
        console.error('Error calculating total price:', err);
        throw new Error('Error calculating total price');
    }
};

const updatePrice = async (pack) => {
    try {
        const { afterDiscount,initTotalPrice } = await getTotalPrice(pack._id);
        pack.initTotalPrice= initTotalPrice;
        pack.price = afterDiscount;
        await pack.save();
    } catch (err) {
        console.error('Error updating total price:', err);
        throw new Error('Error updating total price');
    }
};

exports.addPack = async (req, res, next) => {
    try {
        const { name, description } = req.body;

        const newPack = await Pack.create({
            name:name,
            description:description,
        });

        res.status(201).json({
            status: 'success',
            data: {
                pack: newPack
            }
        });
    } catch (err) {
        console.error('Error creating pack:', err);
        return next(new AppError('Error creating pack', 500));
    }
};

exports.addNewProductToPack = async (req, res, next) => {
    try {
        const { idProduct, idPack,quantity } = req.params;


        const pack = await Pack.findById(idPack);
        if (!pack) {
            return next(new AppError('No pack found with that id', 404));
        }

        const product = await Product.findById(idProduct);
        if (!product) {
            return next(new AppError('No product found with that id', 404));
        }
        const productIndex = pack.products.findIndex(p => p.product.equals(idProduct));
        if (productIndex > -1) {
            return next(new AppError('Product already in pack', 400));
        }


        pack.products.push({ product: idProduct, quantity: quantity });
        await pack.save();

        await updatePrice(pack);

        res.status(201).json({
            status: 'success',
            data: {
                pack: pack
            }
        });
    } catch (err) {
        console.error('Error creating pack:', err);
        const e = new AppError('Error creating pack', 500);
        return next(e);
    }
};

exports.removeProductFromPack = async (req, res, next) => {
    try {
        const { idProduct, idPack } = req.params;


        const pack = await Pack.findById(idPack);
        if (!pack) {
            return next(new AppError('No pack found with that id', 404));
        }

        const product = await Product.findById(idProduct);
        if (!product) {
            return next(new AppError('No product found with that id', 404));
        }
        const productIndex = pack.products.findIndex(p => p.product.equals(idProduct));
        if (productIndex === -1) {
            return next(new AppError('Product didn\'t exist in this pack', 404));
        }

        pack.products.splice(productIndex, 1);
        await pack.save();



        await updatePrice(pack);


        res.status(201).json({
            status: 'success',
            data: {
                pack: pack
            }
        });
    } catch (err) {
        console.error('Error creating pack:', err);
        const e = new AppError('Error creating pack', 500);
        return next(e);
    }
};

exports.getAllPacks = async (req, res, next) => {
    try {
        const allPacks = await Pack.find();
        res.status(200).send(allPacks);
    } catch (err) {
        e.message = 'Error getting all packs';
        e.statusCode = 500;
        return next(e);
    }

};

exports.getOnePack = async (req, res, next) => {
    try {
        const pack = await Pack.findById(req.params.id).populate('products');
        if (!pack) {
            return next(new AppError('No pack found with that id', 404));
        }

        res.status(200).json({ pack });
    } catch (err) {
        const e = new AppError('Error getting this product', 500);
        return next(e);
    }
};

exports.deletedPack = async (req, res, next) => {
    try {
        const pack = await Pack.findByIdAndDelete(req.params.id);
        if (!pack) return next(new AppError('no pack found with that id', 404));

        res.status(200).send("pack deleted successfully");
    } catch (err) {
        e.message = 'Error deleting this pack';
        e.statusCode = 500;
        return next(e);
    }
}

exports.updateDiscountForPack = async (req, res, next) => {
    try {
        const packUpdated = await Pack.findByIdAndUpdate(
            req.params.id,
            { discount: req.body.discount },
            { new: true, runValidators: true }
        );

        if (!packUpdated) {
            return next(new AppError('No pack found with that ID', 404));
        }

        await updatePrice(packUpdated);

        res.status(200).json({
            status: 'success',
            data: {
                pack: packUpdated
            }
        });
    } catch (err) {
        console.error('Error updating discount for pack:', err);
        return next(new AppError('Error updating discount for pack', 500));
    }
};

exports.updatePack = async (req, res, next) => {
    try {

        const packUpdated = await Pack.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!packUpdated) return next(new AppError('no pack found with that id', 404));

        res.status(200).send(packUpdated);

    } catch (err) {
        res.status(500).send(err);
    }


};
