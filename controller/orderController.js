const AppError = require("../middleware/errorHandler");
const Cart = require("../models/cart.schema");
const Order = require("../models/order.schema");


exports.placeOrder = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Find the user's cart
        const cart = await Cart.findOne({ user: userId }).populate('products.product packs.pack');
        console.log(cart);
        if (!cart || (cart.products.length === 0 && cart.packs.length === 0)) {
            return next(new AppError('No items in cart to place an order', 400));
        }

        // Create a new order based on the cart
        const order = await Order.create({
            user: userId,
            products: cart.products,
            packs: cart.packs,
            totalPrice: cart.totalPrice
        });

        // Clear the cart after placing the order
        cart.products = [];
        cart.packs = [];
        cart.totalPrice = 0;
        await cart.save();

        res.status(201).json({
            status: 'success',
            data: {
                order
            }
        });
    } catch (err) {
        console.error('Error placing order:', err);
        const e = new AppError('Error placing order', 500);
        return next(e);
    }
};


// Update order status
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { orderId, status } = req.params;

        const validStatuses = ['pending', 'confirmed', 'cancelled', 'delivered'];
        if (!validStatuses.includes(status)) {
            return next(new AppError('Invalid order status', 400));
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return next(new AppError('No order found with that ID', 404));
        }

        order.orderStatus = status;
        order.updatedAt = Date.now();
        await order.save();

        res.status(200).json({
            status: 'success',
            data: {
                order
            }
        });
    } catch (err) {
        console.error('Error updating order status:', err);
        const e = new AppError('Error updating order status', 500);
        return next(e);
    }
};

// Get orders by status
exports.getOrdersByStatus = async (req, res, next) => {
    try {
        const { status } = req.params;

        const validStatuses = ['pending', 'confirmed', 'cancelled', 'delivered'];
        if (!validStatuses.includes(status)) {
            return next(new AppError('Invalid order status', 400));
        }

        const orders = await Order.find({ orderStatus: status }).populate('user products.product packs.pack');

        res.status(200).json({
            status: 'success',
            results: orders.length,
            data: {
                orders
            }
        });
    } catch (err) {
        console.error('Error fetching orders by status:', err);
        const e = new AppError('Error fetching orders by status', 500);
        return next(e);
    }
};
