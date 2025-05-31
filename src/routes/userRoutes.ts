import express from "express";
import {signUp, signIn, changePassword,changeAvatar,changeEmail, EmailVerification, logout,verifyOtp, deleteAccount } from "../controllers/userController.js";
import { verifyJwt } from "../middlewares/verfyJwt.js";
const router = express.Router();

router.route("/signup").post(signUp);
router.route("/signin").post(signIn);
router.route("/update-password").patch(
    verifyJwt,
    changePassword
);
router.route("/update-avatar").patch(
    verifyJwt,
    changeAvatar
);
router.route("/update-email/:newEmail").patch(
    verifyJwt,
    changeEmail
);
router.route("/email-verification").patch(
    verifyJwt, 
    EmailVerification
);
router.route("/logout").post(
    verifyJwt,
    logout
);
router.route("/verify-otp").post(
    verifyJwt,  
    verifyOtp
);
router.route("/delete-account").delete(
    verifyJwt,
    deleteAccount
);  
export const userRouter = router;