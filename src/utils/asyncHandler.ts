import {Request, Response , NextFunction } from "express"
import { ApiResponse } from "./apiResponse.js";

 export const asyncHandler = (fn: Function) => async(req: Request, res: Response, next: NextFunction) => {

    // interface CustomError extends Error {
    //     status?: number
    // }
    try {
        await fn(req,res,next);
    } catch (error: unknown) {
        if(error instanceof Error){
            res.status(500).json(
              new ApiResponse(false,500, error.message || "Something went wrong")
            );
            return next(error);
        }
    }
}