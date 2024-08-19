import express from "express";
import {
  authenticate,
  authorizeAdmin,
} from "../middlewares/authMiddlewares.js";
import {
  createCategory,
  listCategories,
  readCategory,
  removeCategory,
  updateCategory,
} from "../controllers/category.js";

const router = express.Router();

//Route - http://localhost:5000/api/category
router.route("/").post(authenticate, authorizeAdmin, createCategory);

//Route - http://localhost:5000/api/category/:categoryId
router.route("/categoryId").put(authenticate, authorizeAdmin, updateCategory);

//Route - http://localhost:5000/api/category/:categoryId
router
  .route("/:categoryId")
  .delete(authenticate, authorizeAdmin, removeCategory);

//Route - http://localhost:5000/api/category/categories
router.route("/categories").get(listCategories);

//Route - http://localhost:5000/api/category/:id
router.route("/:id").get(readCategory);

export default router;
