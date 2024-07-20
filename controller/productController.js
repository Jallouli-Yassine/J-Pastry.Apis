const Product = require('./../models/product.schema')
const Category = require('./../models/Pcategorie.schema')
const AppError = require('./../middleware/errorHandler');
const {updateAllCarts} = require('../controller/utilityController'); // Adjust the path as necessary

let e = new AppError('_', 0);
// Add product route handler
exports.addProduct = async (req, res, next) => {
    try {
        const { name, description, pricePerUnit, unit,stock, imageUrl } = req.body;
        const category=req.params.idCateg;
        //console.log(category)
        // Validate if category exists
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            e.message = 'Error getting category';
            e.statusCode = 404;
            return next(e);
        }

        const savedProduct = await Product.create({
            name:name,
            description:description,
            pricePerUnit:pricePerUnit,
            unit:unit,
            category:categoryExists,
            stock:stock,
            imageUrl:imageUrl
        });

        res.status(201).json({
            status: 'success',
            data: {
                product: savedProduct
            }
        });
    } catch (err) {
        e.message = 'Error adding product';
        e.statusCode = 500;
        return next(e);
    }
}

exports.getAllProducts = async (req, res, next) => {
    try {
        const allProducts = await Product.find();
        res.status(200).send(allProducts);
    } catch (err) {
        e.message = 'Error getting all products';
        e.statusCode = 500;
        return next(e);
    }

};

exports.getOneProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');
        if (!product) {
            return next(new AppError('No product found with that id', 404));
        }

        res.status(200).json({ product });
    } catch (err) {
        const e = new AppError('Error getting this product', 500);
        return next(e);
    }
};

exports.deletedProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return next(new AppError('no product found with that id', 404));

        res.status(200).send("product deleted successfully");
    } catch (err) {
        e.message = 'Error deleting this product';
        e.statusCode = 500;
        return next(e);
    }
}

exports.updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!product) {
            return next(new AppError('No product found with that ID', 404));
        }

        // Update all carts after product update
        await updateAllCarts();

        res.status(200).json({
            status: 'success',
            data: {
                product,
            },
        });
    } catch (err) {
        console.error('Error updating product:', err);
        const e = new AppError('Error updating product', 500);
        return next(e);
    }
};
