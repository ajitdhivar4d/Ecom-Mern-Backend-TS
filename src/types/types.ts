// src/types/express.d.ts
import mongoose from "mongoose";
import { IOrder } from "../models/order.js";
import { IUser } from "../models/user.js"; // Adjust the import according to your project structure

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // Adjust the type if necessary
    }
  }
}
