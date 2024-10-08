const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    //idhaken l id mta sender howa bidou l aabd l mlogini nhot msgto right else left
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const ChatSchema = new mongoose.Schema({
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    messages: [MessageSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', ChatSchema);
