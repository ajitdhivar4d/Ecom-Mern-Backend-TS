import asyncHandler from "../middlewares/asyncHandler.js";
import Category from "../models/category.js";
// Create a new category
export const createCategory = asyncHandler(async (req, res) => {
    try {
        const { name } = req.body;
        // Validate input
        if (!name) {
            return res
                .status(400)
                .json({ success: false, message: "Name is required" });
        }
        // Check if the category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res
                .status(400)
                .json({ success: false, message: "Category already exists" });
        }
        // Create and save the new category
        const category = new Category({ name });
        const savedCategory = await category.save();
        return res.status(201).json({
            success: true,
            category: savedCategory,
            message: "Category created",
        });
    }
    catch (error) {
        console.error("Error creating category:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while creating the category",
        });
    }
});
// Update an existing category
export const updateCategory = asyncHandler(async (req, res) => {
    try {
        const { name } = req.body;
        const { categoryId } = req.params;
        // Validate input
        if (!name) {
            return res
                .status(400)
                .json({ success: false, message: "Name is required" });
        }
        // Find the category by ID
        const category = await Category.findById(categoryId);
        // Check if the category exists
        if (!category) {
            return res
                .status(404)
                .json({ success: false, message: "Category not found" });
        }
        // Update the category's name
        category.name = name;
        // Save the updated category
        const updatedCategory = await category.save();
        // Log the updated category for debugging
        console.log("Category updated:", updatedCategory);
        // Respond with the updated category
        return res
            .status(200)
            .json({
            success: true,
            category: updatedCategory,
            message: " category updated successfully",
        });
    }
    catch (error) {
        console.error("Error updating category:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating the category",
        });
    }
});
// Remove a category by ID
export const removeCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    try {
        // Find and delete the category by ID
        const deletedCategory = await Category.findByIdAndDelete(categoryId);
        // Check if the category was found and deleted
        if (!deletedCategory) {
            return res
                .status(404)
                .json({ success: false, message: "Category not found" });
        }
        // Respond with the deleted category
        return res.status(200).json({
            success: true,
            message: "Category deleted successfully",
            category: deletedCategory,
        });
    }
    catch (error) {
        console.error("Error removing category:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while deleting the category",
        });
    }
});
// List all categories
export const listCategories = asyncHandler(async (req, res) => {
    try {
        // Retrieve all categories from the database
        const categories = await Category.find({});
        // Respond with the list of categories
        return res.status(200).json({
            success: true,
            message: "Categories retrieved successfully",
            categories,
        });
    }
    catch (error) {
        console.error("Error fetching categories:", error);
        // Respond with an error message
        return res.status(500).json({
            success: false,
            message: "An error occurred while retrieving categories",
        });
    }
});
// Get a category by ID
export const readCategory = asyncHandler(async (req, res) => {
    try {
        // Find the category by ID
        const category = await Category.findById(req.params.id);
        if (category) {
            // Respond with the category data
            return res.status(200).json({
                success: true,
                message: "Category retrieved successfully",
                category,
            });
        }
        else {
            // Respond with a 404 if the category is not found
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }
    }
    catch (error) {
        console.error("Error fetching category:", error);
        // Respond with a 500 error for unexpected issues
        return res.status(500).json({
            success: false,
            message: "An error occurred while retrieving the category",
        });
    }
});
