import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ApiResponse } from "../utils/apiResponse.js";
import userModel, { UserI } from "../models/userModel.js";

 export interface newRequest extends Request {
    user?: UserI
}


export const verifyJwt = asyncHandler(async(req: newRequest, res: Response, next: NextFunction) => {
  
   try {
    const token =  req.cookies?.Token || req.header("Authorization")?.replace("Bearer ","");
    if(!token) {
    return res.status(400)
     .json(
         new ApiResponse(false,400,"unauthorized request Please sign in.")
     )
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload
    if(!decodedToken) {
     return res.status(400)
     .json(
         new ApiResponse(false,400,"invalid token. unauthorized request.")
     )
    }
 
    const user = await userModel.findById(decodedToken._id);
    if(!user) {
     return res.status(400)
     .json(
         new ApiResponse(false,400,"user not found.")
     )
    }
    req.user = user;
    next();
    
   } catch (error: unknown) {
    if(error instanceof Error) {
        console.log(error);
        return res.status(500)
        .json(
            new ApiResponse(false,500, error.message || "Something went wrong during token verification.")
        )   
    }
    
   }
})