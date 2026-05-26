const jwt = require('jsonwebtoken');

const tokenHelper = {
    generateAccessToken: (user) => {
        return jwt.sign({
            id: user.UserID
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: "15m",
        }
    )},

    generateRefreshToken: (user) => {
        return jwt.sign({
            id: user.UserID
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: "7d",
        }
    )},

    verifyRefreshToken: (token) => {
        try {
            return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        } catch (err) {
            return null;
        }
    }
}

module.exports = tokenHelper;