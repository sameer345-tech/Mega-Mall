import express from "express";
import { authHandler } from "../auth/auth.js";
import { signUp} from "../controllers/userController.js";

const router = express.Router();



router.route("/signup").post(signUp);
router.route("/signin").post(authHandler);
export const userRouter = router;