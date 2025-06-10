import { addToCart, getCartItems, removeProduct, toggleQuantity } from "../controllers/cartController.js";
import { verifyJwt } from "../middlewares/verfyJwt.js";
import express from "express";
const cartRouter = express.Router();

cartRouter.route("/add-to-cart").post(
    verifyJwt,
    addToCart
);
cartRouter.route("/get-cart-items").get(
    verifyJwt,
    getCartItems
);
cartRouter.route("/remove-product").delete(
    verifyJwt,
    removeProduct
);
cartRouter.route("/toggle-quantity").patch(
    verifyJwt,
    toggleQuantity
);
export default cartRouter;