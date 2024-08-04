const Chat = require('../models/chat.schema');
const AppError = require('../middleware/errorHandler');

exports.getChatByOrderId = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const chat = await Chat.findOne({ order: orderId }).populate('users').populate('messages.sender');

        if (!chat) {
            return next(new AppError('No chat found for this order', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                chat
            }
        });
    } catch (err) {
        console.error('Error fetching chat:', err);
        const e = new AppError('Error fetching chat', 500);
        return next(e);
    }
};

exports.sendMessage = async (req, res, next) => {
    try {
        const { chatId } = req.params;
        const { senderId, content } = req.body;

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return next(new AppError('No chat found with that ID', 404));
        }

        chat.messages.push({ sender: senderId, content });
        await chat.save();

        res.status(200).json({
            status: 'success',
            data: {
                chat
            }
        });
    } catch (err) {
        console.error('Error sending message:', err);
        const e = new AppError('Error sending message', 500);
        return next(e);
    }
};
