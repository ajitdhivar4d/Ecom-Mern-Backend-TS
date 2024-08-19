import mongoose from "mongoose";
import asyncHandler from "../middlewares/asyncHandler.js";
import Product from "../models/product.js";
// **Product Controllers**
// Fetch all products with optional keyword search and pagination
export const fetchProducts = asyncHandler(async (req, res) => {
    try {
        const pageSize = parseInt(req.query.pageSize) || 6;
        const page = parseInt(req.query.page) || 1;
        const keyword = req.query.keyword
            ? { name: { $regex: req.query.keyword, $options: "i" } }
            : {};
        const count = await Product.countDocuments({ ...keyword });
        const products = await Product.find({ ...keyword })
            .skip((page - 1) * pageSize)
            .limit(pageSize);
        res.json({
            success: true,
            products,
            page,
            pages: Math.ceil(count / pageSize),
            hasMore: page * pageSize < count,
        });
    }
    catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while retrieving the products",
        });
    }
});
// Fetch all products with category population, sorting, and limited results
export const fetchAllProducts = asyncHandler(async (req, res) => {
    try {
        const products = await Product.find({})
            .populate("category")
            .limit(12)
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            products,
        });
    }
    catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while retrieving the products",
        });
    }
});
// Fetch top-rated products
export const fetchTopProducts = asyncHandler(async (req, res) => {
    try {
        const topProducts = await Product.find({}).sort({ rating: -1 }).limit(4);
        res.status(200).json({
            success: true,
            products: topProducts,
        });
    }
    catch (error) {
        console.error("Error fetching top products:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while retrieving the top products",
        });
    }
});
// Fetch the most recent products
export const fetchNewProducts = asyncHandler(async (req, res) => {
    try {
        const newProducts = await Product.find({}).sort({ _id: -1 }).limit(5);
        res.status(200).json({
            success: true,
            products: newProducts,
        });
    }
    catch (error) {
        console.error("Error fetching new products:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while retrieving the new products",
        });
    }
});
// Fetch a product by ID
export const fetchProductById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            status: "error",
            message: "Invalid product ID",
            data: null,
        });
    }
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                status: "error",
                message: "Product not found",
                data: null,
            });
        }
        res.status(200).json({
            status: "success",
            message: "Product fetched successfully",
            data: product,
        });
    }
    catch (error) {
        next(error);
    }
});
// Add a new product (commented out for now, but organized for potential use)
// export const addProduct = asyncHandler(async (req: Request, res: Response) => {
//   try {
//     const { name, description, price, category, quantity, brand, image } =
//       req.body;
//     if (
//       !name ||
//       !description ||
//       !price ||
//       !category ||
//       !quantity ||
//       !brand ||
//       !image
//     ) {
//       return res.status(400).json({ error: "All fields are required" });
//     }
//     const product = new Product({
//       name,
//       description,
//       price,
//       category,
//       quantity,
//       brand,
//       image,
//     });
//     const savedProduct = await product.save();
//     res.status(201).json({
//       success: true,
//       product: savedProduct,
//     });
//   } catch (error: unknown) {
//     console.error("Error adding product:", error);
//     res.status(500).json({
//       success: false,
//       message: "An error occurred while adding the product",
//     });
//   }
// });
// Remove a product by ID
export const removeProduct = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            status: "error",
            message: "Invalid product ID",
            data: null,
        });
    }
    try {
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({
                status: "error",
                message: "Product not found",
                data: null,
            });
        }
        res.status(200).json({
            status: "success",
            message: "Product deleted successfully",
            data: product,
        });
    }
    catch (error) {
        console.error("Error removing product:", error);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
            data: null,
        });
    }
});
// Filter products based on category and price range
export const filterProducts = asyncHandler(async (req, res, next) => {
    try {
        const { checked, radio } = req.body;
        const query = {};
        if (Array.isArray(checked) && checked.length > 0)
            query.category = { $in: checked };
        if (Array.isArray(radio) && radio.length === 2)
            query.price = { $gte: radio[0], $lte: radio[1] };
        const products = await Product.find(query);
        res.status(200).json({
            status: "success",
            message: "Products filtered successfully",
            data: products,
        });
    }
    catch (error) {
        console.error("Error filtering products:", error);
        res.status(500).json({
            status: "error",
            message: "Server Error",
            data: null,
        });
    }
});
// Add a review to a product
export const addProductReviews = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
    if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
    }
    const { _id: userId, username } = req.user;
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        const alreadyReviewed = product.reviews.find((r) => r.user.toString() === userId.toString());
        if (alreadyReviewed) {
            return res.status(400).json({ message: "Already reviewed" });
        }
        const review = {
            name: username,
            rating: Number(rating),
            comment,
            user: userId,
        };
        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                product.reviews.length;
        await product.save();
        res.status(201).json({ message: "Review added successfully" });
    }
    catch (error) {
        console.error("Error adding the review:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while adding the review",
        });
    }
});
