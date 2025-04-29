const jwt = require('jsonwebtoken');
const User = require('../models/userModel');  // Adjust path as needed

const isAuthenticated = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ success: false, error: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET); // Verify the token using your secret key
        req.user = decoded;  // Attach user data to the request object
        next();  // Proceed to the next middleware or route handler
    } catch (error) {
        return res.status(401).json({ success: false, error: "Invalid or expired token" });
    }
};

module.exports = { isAuthenticated };
