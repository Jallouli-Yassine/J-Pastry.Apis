const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, required: true, min: 1 },
    }],
    packs: [{
        pack: { type: mongoose.Schema.Types.ObjectId, ref: 'Pack' },
        quantity: { type: Number, required: true, min: 1 }
    }],
    totalPrice: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

// Static method to calculate total price
CartSchema.statics.calculateTotalPrice = async function(cart) {
    let totalPrice = 0;

    // Calculate the total price for products
    for (const item of cart.products) {
        const product = await mongoose.model('Product').findById(item.product);
        totalPrice += product.pricePerUnit * item.quantity;
    }

    // Calculate the total price for packs
    for (const item of cart.packs) {
        const pack = await mongoose.model('Pack').findById(item.pack).populate('products.product');
        totalPrice+=pack.price;
    }

    return totalPrice;
};

module.exports = mongoose.model('Cart', CartSchema);
