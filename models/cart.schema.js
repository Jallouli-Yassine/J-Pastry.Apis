const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, required: true, min: 1 },
        unit: { type: String, required: true } // Unit of the product
    }],
    packs: [{
        pack: { type: mongoose.Schema.Types.ObjectId, ref: 'Pack' },
        quantity: { type: Number, required: true, min: 1 }
    }],
    totalPrice: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Cart', CartSchema);

// Function to calculate total price
const calculateTotalPrice = async (cart) => {
    let totalPrice = 0;

    // Calculate the total price for products
    for (const item of cart.products) {
        const product = await mongoose.model('Product').findById(item.product);
        totalPrice += product.pricePerUnit * item.quantity;
    }

    // Calculate the total price for packs
    for (const item of cart.packs) {
        const pack = await mongoose.model('Pack').findById(item.pack).populate('products');
        const packTotalPrice = pack.products.reduce((acc, prod) => acc + prod.pricePerUnit, 0);
        totalPrice += packTotalPrice * item.quantity;
    }

    return totalPrice;
};
