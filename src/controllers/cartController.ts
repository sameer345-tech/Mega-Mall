import { asyncHandler } from "../utils/asyncHandler.js";
import cartModel from "../models/cartModel.js";
import { newRequest } from "../middlewares/verfyJwt.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Response } from "express";
import mongoose, { isValidObjectId } from "mongoose";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";

export const addToCart = asyncHandler(
  async (req: newRequest, res: Response) => {
    const userId = req.user?._id;
    const user = await userModel.findOne({_id: userId});
    if(!user) {
     return res
        .status(400)
        .json(new ApiResponse(false, 400, "userid not found. please login again."));
    }
    const { productId, quantity }: { productId: mongoose.Schema.Types.ObjectId; quantity: number } =
      req.body;
    if (!isValidObjectId(productId)) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, "Invalid product id."));
    }
   const existingProduct = await cartModel.findOne({
  products: {
    $elemMatch: {
      product: productId
    }
  }
}).exec();


    if (existingProduct) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, "Product already added to cart."));
    }

    const cart = await cartModel.findOne({ user: userId }).exec();
    const product = await productModel.findOne({_id: productId})
    if(!product) {
      return res
        .status(400)
        .json(
          new ApiResponse(false, 400, "Product not found.")
        );
    }
    const totalPrice = product.price * quantity;
    if (!cart) {
      const newCart = new cartModel({
        user: userId,
        products: [
          {
            product: productId,
            quantity,
            totalPrice
          },
        ],
      });
      await newCart.save();
      const cartId = newCart._id ;
      user.cartItems.push({cart: cartId});
      user.save();
      return res
        .status(201)
        .json(
          new ApiResponse(true, 201, "Product added to cart successfully.")
        );
    }

    cart.products.push({ product: productId, quantity, totalPrice });
    await cart.save();
    return res
      .status(201)
      .json(new ApiResponse(true, 201, "Product added to cart successfully."));
  }
);

export const toggleQuantity = asyncHandler(
  async (req: newRequest, res: Response) => {
    const userId = req.user?._id;
    const { productId, quantity }: { productId: mongoose.Schema.Types.ObjectId; quantity: number } =
      req.body;
    if (!isValidObjectId(productId)) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, "Invalid product id."));
    }
    const product = await productModel.findOne({_id: productId});
    if(!product) {
      return res
        .status(400)
        .json(
          new ApiResponse(false, 400, "Product not found.")
        );
    }
    const toggledQuantity = await cartModel.findOneAndUpdate(
  {
    user: userId,
    "products.product": productId
  },
  {
    $set: {
      "products.$.quantity": quantity,
      "products.$.totalPrice": product.price * quantity
    }
  },
  { new: true }
);
if(!toggledQuantity) {
  return res
        .status(400)
        .json(new ApiResponse(false, 400, "Product not found in cart."));
}

    return res
      .status(200)
      .json(
        new ApiResponse(true, 200, "Product quantity updated successfully.")
      );
  }
);

export const removeProduct = asyncHandler(
  async (req: newRequest, res: Response) => {
    const userId = req.user?._id;
    const { productId }: { productId: string } = req.body;

    if (!isValidObjectId(productId)) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, "Invalid product id."));
    }

    const product = await productModel.findOne({ _id: productId });
    if (!product) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, "Product not found."));
    }

    const updatedCart = await cartModel
      .findOneAndUpdate(
        { user: userId },
        {
          $pull: {
            products: {
              product: productId,
            },
          },
        },
        { new: true }
      )
      .exec();

    if (!updatedCart) {
      return res
        .status(404)
        .json(new ApiResponse(false, 404, "Cart not found."));
    }

    // Check if product was actually removed
    const stillExists = updatedCart.products.find(
      (p) => p.product.toString() === productId
    );
    if (stillExists) {
      return res
        .status(404)
        .json(new ApiResponse(false, 404, "Product not found in cart."));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(true, 200, "Product removed from cart successfully.")
      );
  }
);

export const getCartItems = asyncHandler(
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
        .status(404)
        .json(new ApiResponse(false, 404, "User not found."));
    }

    const cartItems = await cartModel.aggregate([
      { $match: { user: userId } },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productData",
        },
      },
      { $unwind: "$productData" },

      {
        $project: {
          _id: 0,
          productId: "$products.product",
          quantity: "$products.quantity",
          title: "$productData.title",
          price: "$productData.price",
          images: "$productData.images",
        },
      },
    ]);
    if (!cartItems || cartItems.length === 0) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, "Cart items not found."));
    }
    return res
      .status(200)
      .json(new ApiResponse(true, 200, "Cart items fetched successfully.", cartItems));
  }
);
