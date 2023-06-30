import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const jwtSecret = process.env.JWT_SECRET;

  if (!token) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Unauthorized" });
  }

  jwt.verify(token, jwtSecret, (error, user) => {
    if (error) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: error.message });
    }

    req.user = user;
    next();
  });
};

export default authenticateToken;
