import jwt from "jsonwebtoken";
import asyncHandler from "../middlewares/asyncHandler.js";
import User from "../models/user.js";
// Middleware to authenticate users based on JWT
const authenticate = asyncHandler(async (req, res, next) => {
    let token = req.cookies["jwt"];
    const jwtSecret = process.env.JWT_SECRET;
    // Check if JWT secret is defined
    if (!jwtSecret) {
        return res
            .status(500)
            .json({ message: "Internal server error: JWT secret is not defined" });
    }
    // If token exists, verify it
    if (token) {
        try {
            const decoded = jwt.verify(token, jwtSecret);
            // Find the user based on the userId from the token
            const user = (await User.findById(decoded.userId).select("-password"));
            if (!user) {
                return res
                    .status(401)
                    .json({ message: "Not authorized, user not found" });
            }
            // Attach user to the request object
            req.user = user;
            next();
        }
        catch (error) {
            // Handle token verification errors
            console.error("Token verification error:", error);
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    }
    else {
        // Handle missing token
        res.status(401).json({ message: "Not authorized, no token" });
    }
});
// Middleware to authorize admin users
const authorizeAdmin = (req, res, next) => {
    // Check if the user is an admin
    if (req.user && req.user.isAdmin) {
        next();
    }
    else {
        res.status(403).send("Forbidden: Not authorized as admin");
    }
};
export { authenticate, authorizeAdmin };
