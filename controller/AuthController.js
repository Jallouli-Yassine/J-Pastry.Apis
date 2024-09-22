const { promisify } = require('util');
const User = require('./../models/user.schema');
const crypto = require('crypto');
//const Email = require('./../utils/email');
const AppError = require('./../middleware/errorHandler');
const jwt = require('jsonwebtoken');
const e = new AppError('_', 0);

const signToken = (id) => {
    return jwt.sign({ id:id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        //secure: true,
        httpOnly: true,
    };

    res.cookie('jwt', token, cookieOptions);
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

const blockUser = async (idUser, hoursBanned) => {
    await User.findOneAndUpdate(
        { _id: idUser },
        {
            blocked: true,
            blockedExpires: Date.now() + hoursBanned * (3600 * 1000),
        }
    );
};

exports.signupUser = async (req, res, next) => {
    try {
        //const newUser = await User.create(req.body);

        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
            role: req.body.role,
            gender: req.body.gender,
        });
/*
        const url = `http://127.0.0.1:3000/api/v1/users/me`;
        await new Email(newUser, url).sendWelcome();
 */
        res.status(201).json({
            status: 'success',
            data: {
                user: newUser,
            },
        });

    } catch (error) {
        e.message = 'Error signup users : ' + error.message;
        e.statusCode = 400;
        return next(e);
    }
};

exports.login = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        if (!email || !password) {
            return next(new AppError('Please provide email and password', 400));
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return next(new AppError('Incorrect email', 401));
        }

        if (user.blocked) {
            if (Date.now() > user.blockedExpires) {
                // wfe lblocage
                user.TryLogin = 0;
                user.blocked = false;
                user.blockedExpires = undefined;
                createSendToken(user, 201, res);
            } else {
                //mazel mawfech wakt l block
                const remainingTimeInMinutes = Math.ceil(
                    (user.blockedExpires - Date.now()) / (1000 * 60)
                );
                return next(
                    new AppError(
                        `You still need to wait ${remainingTimeInMinutes}Minute to retry login`,
                        401
                    )
                );
            }
        } else {
            // mahouch metblouki
            const validPassword = await user.correctPassword(password, user.password);

            if (!validPassword) {
                if (user.TryLogin < 10) {
                    user.TryLogin = (user.TryLogin + 1) * 1;
                    await user.save({ validateBeforeSave: false });
                    if (user.TryLogin === 10) {
                        await blockUser(user.id, 0.034);
                        return next(
                            new AppError('BLOCKED! You can try again after 1 hour', 401)
                        );
                    }
                }
                return next(new AppError('Incorrect password', 401));
            }

            user.TryLogin = 0;
            await user.save({ validateBeforeSave: false }); // Await the user.save() operation
            createSendToken(user, 201, res);
        }
    } catch (error) {
        next(new AppError(error.message, 400));
    }
};

exports.protect = async (req, res, next) => {
    try {
        //1 Check if there is a token in the request headers
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) return next(new AppError('You are not logged in!', 401));

        //2 Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        /*
        { id: '64afd21dd28a9c57901f44e0', iat: 1689253695, exp: 1697029695 }
        */
        //console.log(decoded);

        //3 Check if the user still exists
        const curentUser = await User.findById(decoded.id);
        if (!curentUser)
            return next(
                new AppError('The user belonging to this token no longer exist!', 401)
            );

        //4 Check if the user changed the password after the JWT was issued
        if (curentUser.changedPasswordAfter(decoded.iat))
            return next(
                new AppError(
                    'The user recently changed his password! Please log in again',
                    401
                )
            );

        req.user = curentUser;
        next();
    } catch (error) {
        next(error);
    }
};

