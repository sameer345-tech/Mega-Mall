import { asyncHandler } from "../utils/asyncHandler.js";
import { newRequest } from "../middlewares/verfyJwt.js";
import { Response } from "express";
import { ApiResponse } from "../utils/apiResponse.js";
import orderModel, { OrderI } from "../models/orderModel.js";
import cartModel, { CartI } from "../models/cartModel.js";
import mongoose, { isValidObjectId } from "mongoose";
import userModel from "../models/userModel.js";
import { orderSchema } from "../zodSchemas/orderSchema.js";

export const placeOrder = asyncHandler(
  async (req: newRequest, res: Response) => {
    const userId = req.user?._id;
    if (!isValidObjectId(userId)) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, "Invalid user id."));
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, "User not found."));
    }
    const {
      fullName,
      address,
      phone,
      city,
      state,
      postalCode,
      country,
      paymentMethod,
    } = req.body;

    const validateOrderData = orderSchema.safeParse({
      fullName,
      address,
      phone,
      city,
      state,
      postalCode: Number(postalCode),
      country,
      paymentMethod,
    });
    if (!validateOrderData.success) {
      const errorMessages = validateOrderData.error.issues
        .map((i) => i.message)
        .join(", ");
      return res.status(400).json(new ApiResponse(false, 400, errorMessages));
    }

    const cart = await cartModel.findOne<CartI>({ user: userId });
    if (!cart) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, "Cart not found."));
    }
    if (cart.products.length === 0) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, "Cart is empty."));
    }
    const totalRevenue = cart.products.reduce(
      (acc, curr) => acc + curr.totalPrice,
      0
    );
    if (paymentMethod === "cod") {
      const codCharges: number = 50;
      const order: OrderI = await orderModel.create({
        user: userId,
        orderItems: cart.products,
        paymentMethod,
        codCharges,
        totalRevenue: codCharges + totalRevenue,
        shippingDetails: {
          fullName,
          address,
          phone,
          city,
          state,
          postalCode,
          country,
        },
      });
      if (!order) {
        return res
          .status(400)
          .json(new ApiResponse(false, 400, "Order not placed."));
      }
      await cartModel.findByIdAndDelete(cart._id);
      user.orders.push({ order: order._id as mongoose.Schema.Types.ObjectId });
      await user.save();
      await userModel.updateOne(
        { _id: userId },
        { $set: { cartItems: [] } },
        { new: true }
      );
      return res
        .status(200)
        .json(new ApiResponse(true, 200, "Order placed successfully."));
    } else {
      return res
        .status(400)
        .json(
          new ApiResponse(false, 400, "only cod payment method is supported.")
        );
    }
  }
);

export const getOrders = asyncHandler(
  async (req: newRequest, res: Response) => {
    const userId = req.user?._id;
    if (!isValidObjectId(userId)) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, "Invalid user id."));
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, "User not found."));
    }
    // const orders = await orderModel.aggregate([
    //   { $match: { user: userId } },
    //   { $unwind: "$orderItems" },
    //   {
    //     $lookup: {
    //       from: "products",
    //       localField: "orderItems.product",
    //       foreignField: "_id",
    //       as: "productData",
    //     },
    //   },
    //   { $unwind: "$productData" },

    //   {
    //     $project: {
    //       _id: 0,
    //       orderItems: {
    //           title: "$productData.title",
    //           quantity: "$orderItems.quantity",
    //           totalPrice: "$orderItems.totalPrice",
    //           price: "$productData.price",
    //           images: "$productData.images",
    //           category: "$productData.category",
    //           weight: "$productData.weight",
    //           stock: "$productData.stock",
    //       },
    //       totalRevenue: 1,
    //       status: 1,
    //       paymentMethod: 1,
    //       codCharges: 1,
    //       createdAt: 1,
    //       updatedAt: 1,
    //       shippingDetails: 1,
    //     },
    //   },
    // ]);

    const orders = await orderModel.find({ user: userId }).populate({
      path: "orderItems.product",
      model: "Product",
    });

    if (!orders || orders.length === 0) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, "Orders not found."));
    }
    return res
      .status(200)
      .json(new ApiResponse(true, 200, "Orders fetched successfully.", orders));
  }
);
