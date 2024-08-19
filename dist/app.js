import express from "express";
import { config } from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
// Import Routes
import userRoutes from "./routes/user.js";
import categoryRoutes from "./routes/category.js";
import productRoutes from "./routes/product.js";
import orderRoutes from "./routes/order.js";
//Load Environment Variables
config({ path: "./.env" });
// Set Port
const port = process.env.PORT || 3000;
// Connect to MongoDB
connectDB();
// Initiate Express App
const app = express();
//Middleware Setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Routes
app.use("/api/users", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
// Default Route
app.get("/new", (req, res) => {
    res.send("Hello, World!");
});
app.listen(port, () => {
    console.log(`app listening on port ${port}`);
});
