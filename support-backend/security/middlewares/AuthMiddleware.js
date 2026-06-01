import { verifyJWT } from "../JWT/JWT.js";

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Authorization header is required" });
    }
    if(!authHeader.startsWith("Bearer ")){
        return res.status(401).json({ message: "Invalid authorization header format" });
     }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = verifyJWT(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

