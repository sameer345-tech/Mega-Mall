import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ApiResponse } from "../../utils/apiResponse.js";
import adminModel, { adminI } from "../../models/admin.model.js";
import { generateAccessToken } from "../../controllers/adminController.js";
import mongoose from "mongoose";

 export interface newAdminRequest extends Request {
    admin?: adminI
}


export const verifyJwt = asyncHandler(async(req: newAdminRequest, res: Response, next: NextFunction) => {
  
   try {
    const accessToken =  req.cookies?.access_token || req.header("Authorization")?.replace("Bearer ","");
    if(!accessToken) {
    return res.status(400)
     .json(
         new ApiResponse(false,400,"unauthorized request Please sign in.")
     )
    }
    const decodedToken = jwt.verify(accessToken, process.env.ADMIN_JWT_SECRET as string) as JwtPayload
    if(!decodedToken) {
     return res.status(400)
     .json(
         new ApiResponse(false,400,"invalid token. unauthorized request.")
     )
    }
    if(decodedToken.role !== "superAdmin" && decodedToken.role !== "admin") {
      return res.status(400)
     .json(
         new ApiResponse(false,400,"only superAdmin and admin can perform this action.")
     )
    }
 
    const admin = await adminModel.findById(decodedToken._id);
    if(!admin) {
     return res.status(400)
     .json(
         new ApiResponse(false,400,"user not found.")
     )
    }
    req.admin = admin;
    next();
    
   } catch (error: unknown) {
    if(error instanceof Error) {
        console.log(error);
        if(error.message === "jwt expired" || "jwt expired.") {
            const accessToken = await generateAccessToken(req.admin?._id as mongoose.Schema.Types.ObjectId);
            req.cookies.access_token = accessToken;
            return next();
        }
        else {
            return res.status(500)
        .json(
            new ApiResponse(false,500, error.message || "Something went wrong during token verification.")
        )   
        };
    };
    
   }
})