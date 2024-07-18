const mongoose = require('mongoose');

const PackSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    discount: {type: Number, default: 0},
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, required: true, min: 1 },
    }],
    initTotalPrice: {type: Number, default: 0},
    price: { type: Number, default: 0},
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pack', PackSchema);
