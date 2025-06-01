import express from "express";
import {signUp, signIn, changePassword,changeAvatar,changeEmail, EmailVerification, logout,verifyOtp, deleteAccount } from "../controllers/userController.js";
import { verifyJwt } from "../middlewares/verfyJwt.js";
import upload from "../middlewares/multer.js";
const router = express.Router();

router.route("/sign-up").post(signUp);
router.route("/sign-in").post(signIn);
router.route("/update-password").patch(
    verifyJwt,
    changePassword
);
router.route("/update-avatar").patch(
    verifyJwt,
    upload.single("avatar"),
    changeAvatar
);
router.route("/update-email/:newEmail").patch(
    verifyJwt,
    changeEmail
);
router.route("/email-verification").post(
    verifyJwt, 
    EmailVerification
);
router.route("/logout").post(
    verifyJwt,
    logout
);
router.route("/verify-otp/:userId").post(
    verifyOtp
);
router.route("/delete-account").delete(
    verifyJwt,
    deleteAccount
);  
export const userRouter = router;