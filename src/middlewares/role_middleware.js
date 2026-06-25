const authMiddleware = require("./auth_middleware");

const roleMiddleware = (req, res, next) => {
  const { role } = req.user;
  if (role === "artist") {
    next();
  } else {
    return res.status(403).json({ message: "Forbidden access" });
  }
};

module.exports = roleMiddleware;
