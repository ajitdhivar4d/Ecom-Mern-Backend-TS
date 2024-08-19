import express from "express";
import {
  addProductReviews,
  fetchAllProducts,
  fetchNewProducts,
  fetchProductById,
  fetchProducts,
  fetchTopProducts,
  removeProduct,
} from "../controllers/product.js";
import checkId from "../middlewares/checkId.js";
import {
  authenticate,
  authorizeAdmin,
} from "../middlewares/authMiddlewares.js";

const router = express.Router();

//Route - http://localhost:5000/api/products
router.route("/").get(fetchProducts);

// .post(authenticate, authorizeAdmin, addProduct);

//Route - http://localhost:5000/api/products/allproducts
router.route("/allproducts").get(fetchAllProducts);

router.route("/:id/reviews").post(authenticate, checkId, addProductReviews);

//Route - http://localhost:5000/api/products/top
router.get("/top", fetchTopProducts);

//Route - http://localhost:5000/api/products/new
router.get("/new", fetchNewProducts);

//Route - http://localhost:5000/api/products/:id
router
  .route("/:id")
  .get(fetchProductById)
  .delete(authenticate, authorizeAdmin, checkId, removeProduct);
//   .put(authenticate, authorizeAdmin, formidable(), updateProductDetails)

// router.route("/filtered-products").post(filterProducts);

export default router;
