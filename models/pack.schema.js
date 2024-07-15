const mongoose = require('mongoose');

const PackSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    discount: {type: Number, default: 0},
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: false
    }],
    initTotalPrice: {type: Number, default: 0},
    price: { type: Number, default: 0},
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pack', PackSchema);
