import jwt from "jsonwebtoken";

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const jwtSecret = process.env.JWT_SECRET;

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, jwtSecret, (error, user) => {
    req.user = error ? null : user;
    next();
  });
};

export default optionalAuth;
