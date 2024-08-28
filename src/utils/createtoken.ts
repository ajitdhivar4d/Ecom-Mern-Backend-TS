import { Response } from "express";
import jwt from "jsonwebtoken";

const generateToken = (res: Response, userId: string): void => {
  try {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT secret is not defined in environment variables");
    }

    // Generate JWT
    const token = jwt.sign({ userId }, jwtSecret, {
      expiresIn: "30d",
    });

    // Set JWT as an HTTP-only cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "PRODUCTION",
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
  } catch (error) {
    console.error(
      "Error generating token:",
      error instanceof Error ? error.message : error,
    );
    throw error;
  }
};

export default generateToken;
