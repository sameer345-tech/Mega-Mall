import mongoose, { Schema, Document } from "mongoose";

export interface OrderI extends Document {
  user: mongoose.Schema.Types.ObjectId;
  cartItems: mongoose.Schema.Types.ObjectId;
  totalPrice: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  shippingDetails: {
    name: string;
    address: string;
    phone: number;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

const orderSchema = new Schema<OrderI>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cartItems: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cart",
    required: true
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ["pending", "shipped", "delivered", "cancelled"],
    default: "pending",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  shippingDetails: {
    name: {
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
  },

}, {timestamps: true});

const Order = mongoose.model<OrderI>("Order", orderSchema);

export default Order;

