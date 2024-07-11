const mongoose = require('mongoose');

const PackSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    }],
    price: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pack', PackSchema);
