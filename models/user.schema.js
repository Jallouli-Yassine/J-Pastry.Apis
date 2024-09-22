const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { reset } = require('nodemon');

const userSchema = new mongoose.Schema({
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
    },
    activeChats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
    name: {
        type: String,
        required: [true, 'A user must have a name'],
        trim: true,
        maxlength: [30, 'A user name must have a less or equal than 40 characters'],
        minlength: [5, 'A user name must have a more or equal than 10 characters'],
        //validate: [validator.isAlpha, 'username must only contain characters'],
    },
    photo: {
        type: String,
        default: 'default.jpg',
    },

    gender: {
        type: String,
        required: [true, 'A user must have a gender'],
        enum: ['male', 'female']
    },
    email: {
        type: String,
        required: [true, 'A user must have a email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'please enter a valid email'],
    },
    password: {
        type: String,
        required: [true, 'A user must have a password'],
        minlength: 8,
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'A user must have a password'],
        minlength: 8,
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: `this password ({VALUE}) didnt match the first one`,
        },
    },
    role: {
        type: String,
        required: [true, 'A user must have a role'],
        enum: {
            values: ['user', 'agent', 'admin'],
            message: 'Role is either user, agent or admin',
        },
    },
    etat: {
        type: Boolean,
        default: false,
    },
    TryLogin: {
        type: Number,
        default: 0,
    },
    blocked: {
        type: Boolean,
        default: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    blockedExpires: Date,
});

userSchema.pre('save', async function (next) {
    // Hash password if it has been modified or is new
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined; // Remove passwordConfirm after hashing
    next();
});

userSchema.methods.correctPassword = async function (
    simplePassword,
    cryptedPassword
) {
    return await bcrypt.compare(simplePassword, cryptedPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimetamp) {
    if (this.passwordChangedAt) {
        const changeTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        console.log(changeTimestamp, JWTTimetamp);
        return JWTTimetamp < changeTimestamp;
    }
    return false;
};


const User = mongoose.model('User', userSchema);
module.exports = User;

