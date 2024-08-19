import jwt, { JwtPayload } from "jsonwebtoken";
import asyncHandler from "../middlewares/asyncHandler.js";
import User, { IUser } from "../models/user.js";
import { NextFunction, Request, Response } from "express";

// Interface for the decoded token
interface DecodedToken extends JwtPayload {
  userId: string;
}

interface AuthenticatedRequest extends Request {
  user?: IUser; // The user will be attached to the request object
}

// Middleware to authenticate users based on JWT
const authenticate = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let token = req.cookies["jwt"];
    const jwtSecret = process.env.JWT_SECRET as string;

    // Check if JWT secret is defined
    if (!jwtSecret) {
      return res
        .status(500)
        .json({ message: "Internal server error: JWT secret is not defined" });
    }

    // If token exists, verify it
    if (token) {
      try {
        const decoded = jwt.verify(token, jwtSecret) as DecodedToken;

        // Find the user based on the userId from the token
        const user = (await User.findById(decoded.userId).select(
          "-password",
        )) as IUser;

        if (!user) {
          return res
            .status(401)
            .json({ message: "Not authorized, user not found" });
        }

        // Attach user to the request object
        req.user = user;

        next();
      } catch (error) {
        // Handle token verification errors
        console.error("Token verification error:", error);
        res.status(401).json({ message: "Not authorized, token failed" });
      }
    } else {
      // Handle missing token
      res.status(401).json({ message: "Not authorized, no token" });
    }
  },
);

// Middleware to authorize admin users
const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Check if the user is an admin
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).send("Forbidden: Not authorized as admin");
  }
};

export { authenticate, authorizeAdmin };
