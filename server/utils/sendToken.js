// utils/sendToken.js
const jwt = require("jsonwebtoken");

const sendToken = (user, statusCode, res) => {
    const accessToken = jwt.sign(
        { id: user._id },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIREIN }
    );
    const refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_TOKEN,
        { expiresIn: process.env.JWT_REFRESH_EXPIREIN }
    );

    res.cookie("refreshToken", refreshToken, {
        maxAge: 86400 * 7000,
        httpOnly: true,
    });

    res.status(statusCode).json({
        success: true,
        token: accessToken,
        user: {
            _id: user._id,
            username: user.username,
            email: user.email
        }
    });
};

module.exports = sendToken;
