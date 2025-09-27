
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {

    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }


    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }

     
      
      req.user = decoded;
    //   res.status(200).json({ message: "Authenticated", user: decoded });
        next();
   
    });
  } catch (err) {
    res.status(500).json({ message: "Authentication error", error: err.message });
  }
};

module.exports = authMiddleware;
