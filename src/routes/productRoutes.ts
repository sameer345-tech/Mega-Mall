import { Router } from "express";
import { verifyJwt } from "../middlewares/verfyJwt.js";
import {
  reviews,
  getReviews,
  getProduct,
  getProductByCategory,
  getAllProducts,
  getProductByQuery,
} from "../controllers/productController.js";
const productRouter = Router();

productRouter.route("/reviews/:productId").post(verifyJwt, reviews);
productRouter.route("/get-reviews/:id").get(verifyJwt, getReviews);
productRouter.route("/get-product/:productId").get(verifyJwt, getProduct);
productRouter.route("/get-product-by-category").get(verifyJwt, getProductByCategory);
productRouter.route("/get-all-products").get(verifyJwt, getAllProducts);
productRouter.route("/get-product-by-query").get(verifyJwt, getProductByQuery);

export default productRouter;
