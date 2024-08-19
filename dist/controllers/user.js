import User from "../models/user.js";
import bcrypt from "bcryptjs";
import createToken from "../utils/createtoken.js";
import asyncHandler from "../middlewares/asyncHandler.js";
// Create a new user
export const createUser = asyncHandler(async (req, res, next) => {
    const { username, email, password } = req.body;
    // Check for missing fields
    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please fill all the fields",
        });
    }
    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({
            success: false,
            message: "User already exists",
        });
    }
    // Hash the user's password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Create and save the new user
    const newUser = new User({ username, email, password: hashedPassword });
    try {
        await newUser.save();
        createToken(res, newUser._id);
        return res.status(201).json({
            success: true,
            user: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                isAdmin: newUser.isAdmin,
            },
            message: "User created successfully!",
        });
    }
    catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while creating the user",
        });
    }
});
// Log in a user
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }
        createToken(res, existingUser._id);
        return res.status(200).json({
            success: true,
            user: {
                _id: existingUser._id,
                username: existingUser.username,
                email: existingUser.email,
                isAdmin: existingUser.isAdmin,
            },
        });
    }
    catch (error) {
        console.error("Error logging in user:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while logging in",
        });
    }
});
// Log out the current user
export const logoutCurrentUser = asyncHandler(async (req, res) => {
    try {
        res.cookie("jwt", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            expires: new Date(0),
        });
        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    }
    catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while logging out",
        });
    }
});
// Get the current user's profile
export const getCurrentUserProfile = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user?._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        return res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    }
    catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while retrieving the user profile",
        });
    }
});
// Get all users
export const getAllUsers = asyncHandler(async (req, res) => {
    try {
        const users = await User.find().select("-password");
        return res.status(200).json({
            success: true,
            users,
        });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while retrieving users",
        });
    }
});
// Update the current user's profile
export const updateCurrentUserProfile = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user?._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            user.password = hashedPassword;
        }
        const updatedUser = await user.save();
        return res.status(200).json({
            success: true,
            user: {
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
            },
        });
    }
    catch (error) {
        console.error("Error updating user profile:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating the profile",
        });
    }
});
// Admin
// Delete a user by ID
export const deleteUserById = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        if (user.isAdmin) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete admin user",
            });
        }
        await User.deleteOne({ _id: user._id });
        return res.status(200).json({
            success: true,
            message: "User removed successfully",
        });
    }
    catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while deleting the user",
        });
    }
});
// Get a user by ID
export const getUserById = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        return res.status(200).json({
            success: true,
            user,
        });
    }
    catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching the user",
        });
    }
});
// Update a user by ID
export const updateUserById = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        user.isAdmin =
            req.body.isAdmin !== undefined
                ? Boolean(req.body.isAdmin)
                : user.isAdmin;
        const updatedUser = await user.save();
        return res.status(200).json({
            success: true,
            user: {
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
            },
        });
    }
    catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating the user",
        });
    }
});
