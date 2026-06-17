import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const auth = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, data: null, error: "Unauthorized" });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      subscription_tier: decoded.subscription_tier,
    };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, data: null, error: "Unauthorized" });
  }
};

export default auth;
