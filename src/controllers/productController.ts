import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import productModel from "../models/productModel.js";
import { newRequest } from "../middlewares/verfyJwt.js";
import { Response } from "express";
import { reviewsSchema } from "../zodSchemas/reviews.js";
import mongoose from "mongoose";
import { isValidObjectId } from "mongoose";


export const reviews = asyncHandler(async (req: newRequest, res: Response) => {
    const userId = req.user?._id as mongoose.Schema.Types.ObjectId;
    interface reviewI {
    user: mongoose.Schema.Types.ObjectId;
    rating: number;
    comment: string;
  }
  if(!isValidObjectId(req.user?._id)) {
    return res.status(400).json(new ApiResponse(false, 400, "Invalid user id."));
  }
  const productId = req.params.productId;
  const { rating, comment } = req.body;
  if(!rating || !comment) {
    return res.status(400).json(new ApiResponse(false, 400, "Please enter rating and comment."));
  }
  const validateReviewData = reviewsSchema.safeParse({ rating, comment });
  if (!validateReviewData.success) {
    const errorMessages = validateReviewData.error.issues.map(i => i.message).join(", ");
    return res
      .status(400)
      .json(
        new ApiResponse(
          false,
          400,
          errorMessages
        )
      );
  }
  
  const product = await productModel.findById(productId);
  if(!product) {
    return res.status(400).json(new ApiResponse(false, 400, "Product not found."));
  }

  const review: reviewI = {
    user: userId as mongoose.Schema.Types.ObjectId,
    rating: Number(rating),
    comment,
  };
  product.reviews?.push(review);
  await product.save();
  return res.status(200).json(new ApiResponse(true, 200, "Review added successfully."));
});

export const getReviews = asyncHandler(async (req: newRequest, res: Response) => {
  const productId = req.params.id;
  if(!isValidObjectId(productId)) {
    return res.status(400).json(new ApiResponse(false, 400, "Invalid product id."));
  }
  const product = await productModel.findById(productId);
  const totalReviews = product?.reviews?.length;
  if(!product) {
    return res.status(400).json(new ApiResponse(false, 400, "Product not found."));
  }
  const reviews = {
    reviews: product.reviews,
    totalReviews

  }
  return res.status(200).json(new ApiResponse(true, 200, "Reviews fetched successfully.", reviews));
});

export const getProduct = asyncHandler(async (req: newRequest, res: Response) => {
  const productId = req.params.productId;
  if(!isValidObjectId(productId)) {
    return res.status(400).json(new ApiResponse(false, 400, "Invalid product id."));
  }
  const product = await productModel.findById(productId);
  if(!product) {
    return res.status(400).json(new ApiResponse(false, 400, "Product not found."));
  }
  return res.status(200).json(new ApiResponse(true, 200, "Product fetched successfully.", product));
});

export const getProductByCategory = asyncHandler(async (req: newRequest, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const {category}: {category: string} = req.body;
  if(!category) {
    return res.status(400).json(new ApiResponse(false, 400, "Please enter category."));
  }
  const products = await productModel.find({category})
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));
  const totalProducts = await productModel.countDocuments({category});
  if(!products) {
    return res.status(400).json(new ApiResponse(false, 400, "Products not found."));
  }
  return res.status(200).json(new ApiResponse(true, 200, "Products fetched successfully.", {
    products,
    totalPages: Math.ceil(totalProducts / Number(limit)),
    currentPage: Number(page)
  }));
  
});

export const getAllProducts = asyncHandler(async (req: newRequest, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const products = await productModel.find()
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit)).sort({createdAt: -1});
  const totalProducts = await productModel.countDocuments();
  if(!products) {
    return res.status(400).json(new ApiResponse(false, 400, "Products not found."));
  }
  return res.status(200).json(new ApiResponse(true, 200, "Products fetched successfully.", {
    products,
    totalPages: Math.ceil(totalProducts / Number(limit)),
    currentPage: Number(page)
  }));
  
});

export const getProductByQuery = asyncHandler(async (req: newRequest, res: Response) => {
  const { page = 1, limit = 10, sortField = 'createdAt', sortOrder = 'desc' } = req.query;
  const query = req.body.query as string;
  if(!query) {
    return res.status(400).json(new ApiResponse(false, 400, "Please enter query."));
  }
  
  const products = await productModel.find({title: { $regex: new RegExp(query, "i") } })
    .sort({ [sortField as string]: sortOrder === 'asc' ? 1 : -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const totalProducts = await productModel.countDocuments({title: { $regex: new RegExp(query, "i") } });
  
  if (!products || products.length === 0) {
    return res.status(400).json(new ApiResponse(false, 400, "Products not found."));
  }
  
  return res.status(200).json(new ApiResponse(true, 200, "Products fetched successfully.", {
    products,
    totalPages: Math.ceil(totalProducts / Number(limit)),
    currentPage: Number(page)
  }));
});

