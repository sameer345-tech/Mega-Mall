import { asyncHandler } from "../utils/asyncHandler.js";
import { Response } from "express";
import { newRequest } from "../middlewares/verfyJwt.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { productSchema } from "../zodSchemas/productSchema.js";
import productModel from "../models/productModel.js";
import { uploadFile } from "../utils/cloudinary.js";
import { unlink } from "node:fs/promises";
import { UploadApiResponse } from "cloudinary";
import mongoose, { isValidObjectId } from "mongoose";
import { updateProductSchema } from "../zodSchemas/updateProductSchema.js";
import { suggestImageDetails } from "../services/openAi/openAi.js";
import { v2 as cloudinary } from "cloudinary";
import adminModel from "../models/admin.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { adminLoginSchema } from "../zodSchemas/adminLoginSchema.js";
import { adminSignupSchema } from "../zodSchemas/adminSignupSchema.js";
  
export const generateAccessToken = async(userId: mongoose.Schema.Types.ObjectId): Promise<string> => {
  try {
    if(!isValidObjectId(userId)) {
      throw new Error("Invalid user id.");
    }
    const admin = await adminModel.findById(userId);
    if(!admin) {
      throw new Error("Admin not found.");
    }
    const accessToken = jwt.sign(
      { _id: admin._id, role: admin.role, email: admin.email, fullName: admin.fullName },
      process.env.ADMIN_JWT_SECRET!,
      { expiresIn: "7d" }
    );
    return accessToken as string;
  } catch (error: unknown) {
    if(error instanceof Error) {
      return error.message;
    }
    return "Something went wrong during access token generation.";
  }

}

export const signUp = asyncHandler(async (req: newRequest, res: Response) => {
  const { fullName, email, password, role } = req.body;
  const validateSignupData = adminSignupSchema.safeParse({
    fullName,
    email,
    password,
    role,
  });
  if (!validateSignupData.success) {
    const errorMessages = validateSignupData.error.issues
      .map((i) => i.message)
      .join(", ");
    return res.status(400).json(new ApiResponse(false, 400, errorMessages));
  }

  const existingAdmin = await adminModel.findOne({ email });
  if (existingAdmin) {
    return res
      .status(400)
      .json(new ApiResponse(false, 400, "Admin already exists"));
  }
  const newAdmin = await adminModel.create({ fullName, email, password, role });
  return res
    .status(200)
    .json(new ApiResponse(true, 200, "Admin created successfully", newAdmin));
});

export const login = asyncHandler(async (req: newRequest, res: Response) => {

  const { email, password } = req.body;
  const validateLoginData = adminLoginSchema.safeParse({ email, password });
  if (!validateLoginData.success) {
    const errorMessages = validateLoginData.error.issues
      .map((i) => i.message)
      .join(", ");
    return res.status(400).json(new ApiResponse(false, 400, errorMessages));
  }
  const admin = await adminModel.findOne({ email });
  if (!admin) return res.status(401).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const accessToken = jwt.sign(
    { _id: admin._id, role: admin.role, email: admin.email, fullName: admin.fullName },
    process.env.ADMIN_JWT_SECRET!,
    { expiresIn: "7d" }
  );
  return res
    .status(200)
    .cookie("access_token", accessToken, {
      httpOnly: true,
      secure: true,
    })
    .json(new ApiResponse(true, 200, "Login successful.", accessToken));
});

export const uploadProduct = asyncHandler(
  async (req: newRequest, res: Response) => {
    const images = req.files as Express.Multer.File[];
    if (!images || images.length === 0) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, "No images provided."));
    }
    // console.log(images)
    // console.log(req.body)
     const { title, description, price, category, weight, stock } =
      req.body;
    const validateProductData = productSchema.safeParse({
      title,
      description,
      price: Number(price),
      category,
      weight,
      stock: Number(stock)
    });
    if (!validateProductData.success) {
        const errorMessages = validateProductData.error.issues.map(i => i.message).join(", ");
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

    const existingProduct = await productModel.findOne({
      title: { $regex: new RegExp("^" + title + "$", "i") },
    });

    if (existingProduct) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, "Product already exists."));
    }
    const uploadedImages = await Promise.all(
      images.map((image) => uploadFile(image.path, "image", true))
    );
   const imagesUrls: { url: string }[] = uploadedImages
  .filter((res): res is UploadApiResponse => !!res && !!res.url)
  .map((res) => ({ url: res.url }));
    if (imagesUrls.length === 0) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            false,
            400,
            "Something went wrong during file upload."
          )
        );
    }

    const product = await productModel.create({
      title,
      description,
      price: Number(price),
      category,
      weight,
      stock: Number(stock),
      images: imagesUrls,
    });
    await Promise.all(images.map((image) => unlink(image.path)));
    await adminModel.findByIdAndUpdate(
      req.user?._id,
      { $push: { products: { product: product._id } } },
      { new: true }
    );
    return res
      .status(200)
      .json(
        new ApiResponse(true, 200, "Product uploaded successfully.", product)
      );
  }
);

export const deleteProduct = asyncHandler(
  async (req: newRequest, res: Response) => {
    const productId = req.params.id;
    if (!isValidObjectId(productId)) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, "Invalid product id."));
    }
    const product = await productModel.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json(new ApiResponse(false, 404, "Product not found."));
    }
   await productModel.findByIdAndDelete(productId);
   
    return res
      .status(200)
      .json(
        new ApiResponse(true, 200, "Product deleted successfully.")
      );
  }
);

export const updateProduct = asyncHandler(
  async (req: newRequest, res: Response) => {
    
    const productId = req.params.id;
    const { title, description, price, category, weight, stock } = req.body;
     interface productDetailsI {
      title?: string;
      description?: string;
      price?: number;
      category?: string;
      weight?: number;
      stock?: number;
    }
    if (!isValidObjectId(productId)) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, "Invalid product id."));
    }
    const productDetails: productDetailsI = {};

    if (title) {
      productDetails.title = title;
    }
    if (description) {
      productDetails.description = description;
    }
    if (price) {
      productDetails.price = Number(price);
    }
    if (category) {
      productDetails.category = category;
    }
    if (weight) {
      productDetails.weight = weight;
    }
    if (stock) {
      productDetails.stock = Number(stock);
    }
   
    if (!productDetails) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, "No fields to update."));
    }
    
    const validateProductData = updateProductSchema.safeParse(productDetails);

    if (!validateProductData.success) {
      const errorMessages = validateProductData.error.issues.map(i => i.message).join(", ");
      return res
        .status(400)
        .json(new ApiResponse(false, 400, errorMessages));
    }

    const product = await productModel.findByIdAndUpdate(
      productId,
      productDetails,
      { new: true }
    );

    if (!product?._id) {
      return res
        .status(404)
        .json(new ApiResponse(false, 404, "Product not found."));
    }

    return res
      .status(200)
      .json(new ApiResponse(true, 200, "Product updated successfully."));
  }
);
 
export const suggestProductDetails = asyncHandler(async(req: newRequest, res: Response) => {
 const filePath = req.file?.path;
 if(!filePath) {
  return res.status(400).json(new ApiResponse(false, 400, "Please upload an image"));
 }
 const uploadedFile = await uploadFile(filePath, "image");
 if(!uploadedFile || !uploadedFile.public_id) {
  return res.status(400).json(new ApiResponse(false, 400, "Something went wrong during file upload."));
 }
 const message =  await suggestImageDetails(uploadedFile.url);
 if(!message || message.length === 0) {
   return res.status(500).json(new ApiResponse(false, 500, "Suggestions generation failed. Something went wrong.", message));

 }
   const deletedImage = await cloudinary.uploader.destroy(uploadedFile.public_id);
    await unlink(filePath);

 console.log(deletedImage)
 return res.status(200).json(new ApiResponse(true, 200, "Suggestions generated successfully.", message  ));
});

export const logout = asyncHandler(async (req: newRequest, res: Response) => {
  const options = {
    httpOnly: true,
    secure: true
  }
 return res.status(200)
 .clearCookie("access_token", options)
 .json(new ApiResponse(true, 200, "Logout successfully."));

});

