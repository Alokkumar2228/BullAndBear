import Cookies from "cookies";
import jwt from "jsonwebtoken";

export const clerkAuth = (req, res, next) => {
  try {
    const publicKey = process.env.CLERK_PEM_PUBLIC_KEY;
    if (!publicKey) {
      return res
        .status(500)
        .json({ error: "Clerk public key not set in environment" });
    }

    // Get token from cookies or headers
    const cookies = new Cookies(req, res);
    const tokenFromCookie = cookies.get("__session");
    const tokenFromHeader = req.headers.authorization
      ? req.headers.authorization.split(" ")[1]
      : null;

    const token = tokenFromCookie || tokenFromHeader;
    if (!token) return res.status(401).json({ error: "Not signed in" });

    // Verify token
    const options = { algorithms: ["RS256"] };
    const decoded = jwt.verify(token, publicKey, options);

    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime)
      throw new Error("Token expired");
    if (decoded.nbf && decoded.nbf > currentTime)
      throw new Error("Token not valid yet");

    const userId = decoded.sub;
    if (!userId)
      return res.status(401).json({ error: "Invalid token: missing user ID" });

    // Attach user info to request
    req.user = { id: userId, decoded };
 

    next();
  } catch (err) {
    res
      .status(401)
      .json({ error: "Unauthorized", message: err.message || err.toString() });
  }
};