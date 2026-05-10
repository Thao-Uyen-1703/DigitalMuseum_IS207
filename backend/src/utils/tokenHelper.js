const jwt = require('jsonwebtoken');

const tokenHelper = {
    generateAccessToken: (user) => {
        return jwt.sign({
            id: user.UserID,
            name: user.FullName,
            email: user.Email,
            role: user.Role
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
    )}
}

module.exports = tokenHelper;