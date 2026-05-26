const jwt = require("jsonwebtoken");

const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET
    );

    req.user = decoded;
  } catch (error) {
    req.user = null;
  }

  next();
};

module.exports = optionalAuthMiddleware;