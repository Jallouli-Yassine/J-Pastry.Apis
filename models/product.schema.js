const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    pricePerUnit: { type: Number, required: true },  // Price per unit (e.g., per kg, per piece)
    unit: { type: String, required: true, enum: ['kg', 'piece', 'liter', 'pack'] }, // Unit of measurement
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    quantity: { type: Number, required: false },
    imageUrl: { type: String, required: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
