const AppError = require("../middleware/errorHandler");
const Cart = require("../models/cart.schema");
const Product = require("../models/product.schema");
const Pack = require("../models/pack.schema");




exports.addItemToCart = async (req, res, next) => {
    try {
        const { userId, itemId, itemType } = req.params;
        let item;

        // Find the item based on the itemType
        if (itemType === 'product') {
            item = await Product.findById(itemId);
        } else if (itemType === 'pack') {
            item = await Pack.findById(itemId);
        } else {
            return next(new AppError('Invalid item type', 400));
        }

        if (!item) {
            return next(new AppError('No item found with that ID', 404));
        }

        // Find or create a cart for the user
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = await Cart.create({ user: userId, products: [], packs: [], totalPrice: 0 });
        }

        // Add item to cart
        if (itemType === 'product') {
            const productIndex = cart.products.findIndex(p => p.product.toString() === itemId);
            if (productIndex > -1) {
                cart.products[productIndex].quantity += 1;
            } else {
                cart.products.push({ product: itemId, quantity: 1 });
            }
        } else if (itemType === 'pack') {
            const packIndex = cart.packs.findIndex(p => p.pack.toString() === itemId);
            if (packIndex > -1) {
                cart.packs[packIndex].quantity += 1;
            } else {
                cart.packs.push({ pack: itemId, quantity: 1 });
            }
        }

        // Recalculate the total price
        cart.totalPrice = await Cart.calculateTotalPrice(cart);
        await cart.save();

        res.status(200).json({
            status: 'success',
            data: {
                cart
            }
        });
    } catch (err) {
        console.error('Error adding item to cart:', err);
        const e = new AppError('Error adding item to cart', 500);
        return next(e);
    }
};


exports.getUserCart = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Find the cart for the user and populate products and packs
        const cart = await Cart.findOne({ user: userId })
            .populate({
                path: 'products.product',
            })
            .populate({
                path: 'packs.pack',
                model: 'Pack',
                populate: {
                    path: 'products.product',
                    model: 'Product'
                }
            });

        if (!cart) {
            return next(new AppError('No cart found for that user', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                cart
            }
        });
    } catch (err) {
        console.error('Error fetching user cart:', err);
        const e = new AppError('Error fetching user cart', 500);
        return next(e);
    }
};
