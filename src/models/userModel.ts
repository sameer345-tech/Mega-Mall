import mongoose, { Schema, Document } from "mongoose";

import bcypt from "bcrypt";

export interface UserI extends Document {
  _id: string;
  fullName: string;
  email: string;
  password: string;
  isVerified: boolean;
  otp: string;
  otpExpiry: Date;
  avatar: string;
  cartItems: mongoose.Schema.Types.ObjectId;
  orders: mongoose.Schema.Types.ObjectId[];
}

const userSchema = new Schema<UserI>({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"]
  },
  password: {
    type: String,
    minlength: 8,
    maxlength: 30,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
    required: false,
  },
  otpExpiry: {
    type: Date,
    required: false,
  },   
  avatar: {
    type: String,
    required: false,
    default: "https://res.cloudinary.com/dvqjyjyjy/image/upload/v1698975600/avatars/default-avatar.jpg"
    
  } ,
  cartItems: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cart",
    required: false,
  },
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
}, {timestamps: true});

userSchema.pre("save", async function (next) {
  if(!this.isModified("password")) return next();
  this.password = await bcypt.hash(this.password, 10);
  return next();
})

const userModel = mongoose.model<UserI>("User", userSchema);

export default userModel;
