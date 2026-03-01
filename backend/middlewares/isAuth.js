import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) { 
      return res.status(401).json({ msg: "Unauthorized: Token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;
    next();

  } catch (error) {
    return res.status(401).json({
      msg: "Unauthorized: Invalid or expired token",
    });
  }
};

export default isAuth;
