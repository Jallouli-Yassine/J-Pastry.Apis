const AppError = require("../middleware/errorHandler");
const Cart = require("../models/cart.schema");
const Product = require("../models/product.schema");
const Pack = require("../models/pack.schema");


exports.addItemToCart = async (req, res, next) => {
    try {
        const { userId, itemId, itemType } = req.params;
        let item;

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
        //andi ya pack ya product bch nhotouh fl cart
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = await Cart.create({ user: userId, products: [], packs: [], totalPrice: 0 });
        }

        if (itemType === 'product') {
            const productIndex = cart.products.findIndex(p => p.product.toString() === itemId);
            if (productIndex > -1) {
                cart.products[productIndex].quantity += quantity;
            } else {
                cart.products.push({ product: itemId, quantity });
            }
        } else {
            const packIndex = cart.packs.findIndex(p => p.pack.toString() === itemId);
            if (packIndex > -1) {
                cart.packs[packIndex].quantity += quantity;
            } else {
                cart.packs.push({ pack: itemId, quantity });
            }
        }

        cart.totalPrice = calculateTotalPrice(cart);
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
