import express from "express";
import { placeOrder, getOrders, cancelOrderByUser } from "../controllers/orderController.js";
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

orderRouter.route("/cancel-order-by-user").delete(
    verifyJwt,
    cancelOrderByUser
);

export default orderRouter;

