import express from "express";
import {
  createUser,
  deleteUserById,
  getAllUsers,
  getCurrentUserProfile,
  getUserById,
  loginUser,
  logoutCurrentUser,
  updateCurrentUserProfile,
  updateUserById,
} from "../controllers/user.js";
import {
  authenticate,
  authorizeAdmin,
} from "../middlewares/authMiddlewares.js";

const router = express.Router();

//Route - http://localhost:5000/api/users
router
  .route("/")
  .post(createUser)
  .get(authenticate, authorizeAdmin, getAllUsers);

//Route - http://localhost:5000/api/users/auth
router.post("/auth", loginUser);

//Route - http://localhost:5000/api/users/logout
router.post("/logout", logoutCurrentUser);

//Route - http://localhost:5000/api/users/profile
router
  .route("/profile")
  .get(authenticate, getCurrentUserProfile)
  .put(authenticate, updateCurrentUserProfile);

//// Admin Routes

//Route - http://localhost:5000/api/users/:id
router
  .route("/:id")
  .delete(authenticate, authorizeAdmin, deleteUserById)
  .get(authenticate, authorizeAdmin, getUserById)
  .put(authenticate, authorizeAdmin, updateUserById);

export default router;
