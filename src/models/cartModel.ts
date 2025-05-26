import mongoose, { Schema, Document } from "mongoose";

export interface CartI extends Document {
    user: mongoose.Schema.Types.ObjectId,
    products: {
        product: mongoose.Schema.Types.ObjectId,
        quantity: number;
    }[];
}

const cartSchema = new Schema<CartI>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    products: [{
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
    }],
}, {timestamps: true});

const Cart = mongoose.model<CartI>("Cart", cartSchema);

export default Cart;
