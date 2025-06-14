import mongoose, { Schema, Document } from "mongoose";
import { CartI } from "./cartModel.js";

export interface OrderI extends Document {
  user: mongoose.Schema.Types.ObjectId;
  orderItems: [{
    product: mongoose.Schema.Types.ObjectId,
    quantity: number;
    totalPrice: number;
  }];
  totalRevenue: number;
  status: string;
  paymentMethod: string;
  codCharges?: number;
  createdAt: Date;
  updatedAt: Date;
  shippingDetails: {
    fullName: string;
    address: string;
    phone: number;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }[];
}

const orderSchema = new Schema<OrderI>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  orderItems: [{
            product: {
                type:mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                default: 1,
                min: 1,
            },
            totalPrice: {
                type: Number,
                required: true,
                default: 0,
            }
        ,
  }],
  
  totalRevenue: {
    type: Number,
    required: true,
    default: 0, 
  },
  status: {
    type: String,
    enum: ["pending", "shipped", "delivered", "cancelled"],
    default: "pending",
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["cod", "card"],
    default: "cod",
    required: true,
  },
  codCharges: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  shippingDetails: [{
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: Number,
      required: true,
      length: 11,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
  }],

}, {timestamps: true});

const orderModel = mongoose.model<OrderI>("Order", orderSchema);

export default orderModel;

