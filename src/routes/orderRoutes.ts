import express from "express";
import { placeOrder, getOrders } from "../controllers/orderController.js";
import { verifyJwt } from "../middlewares/verfyJwt.js";

const orderRouter = express.Router();

orderRouter.route("/place-order").post(
    verifyJwt,
    placeOrder
);

orderRouter.route("/get-orders").get(
    verifyJwt,
    getOrders
);

export default orderRouter;

