const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.UserID,
      email: user.Email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "3d",
    }
  );
};

module.exports = generateToken;