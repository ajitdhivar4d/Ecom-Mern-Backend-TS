import express from "express";
import { config } from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
// Import Routes
import userRoutes from "./routes/user.js";
import categoryRoutes from "./routes/category.js";
import productRoutes from "./routes/product.js";
import orderRoutes from "./routes/order.js";
import { corsOptions } from "./constants/config.js";
//Load Environment Variables
config({ path: "./.env" });
// Set Port
const port = process.env.PORT || 3000;
// Connect to MongoDB
connectDB();
// Initiate Express App
const app = express();
//Middleware Setup
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Routes
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
// Default Route
app.get("/new", (req, res) => {
    res.send("Hello, World!");
});
app.listen(port, () => {
    console.log(`app listening on port ${port}`);
});
