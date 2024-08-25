import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

// Middleware to validate MongoDB ObjectID
const checkId = (
  req: Request,
  res: Response,
  next: NextFunction,
): void | Response<any, Record<string, any>> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid ID format",
    });
  }

  next();
};

export default checkId;
