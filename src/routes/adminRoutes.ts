import { Router } from "express";
import {
  suggestProductDetails,
  uploadProduct,
  deleteProduct,
  signUp,
  login,
  updateProduct,
  deleteOrder,
  changeDeliveryStatus,
  logout,
} from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import { verifyJwt } from "../middlewares/admin/verifyJwt.js";

const adminRouter = Router();
adminRouter
  .route("/upload-product")
  .post(verifyJwt, upload.array("images"), uploadProduct);

adminRouter.route("/update-product/:id").patch(verifyJwt, updateProduct);

adminRouter.route("/suggest-product-details").get(verifyJwt, upload.single("image"), suggestProductDetails);

adminRouter.route("/delete-product/:id").delete(verifyJwt, deleteProduct);

adminRouter.route("/sign-up").post(signUp);

adminRouter.route("/login").post(login);

adminRouter.route("/delete-order").delete(verifyJwt, deleteOrder);

adminRouter.route("/change-delivery-status").patch(verifyJwt, changeDeliveryStatus);

adminRouter.route("/logout").post(verifyJwt, logout);

export default adminRouter;
