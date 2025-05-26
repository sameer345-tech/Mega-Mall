import mongoose, { Schema, Document } from "mongoose";

export interface ProductI extends Document {
    title: string;
    description: string;
    price: number;
    images: [{
        url: string;
    }];
    category: string;
    reviews: [
        {
            user: mongoose.Schema.Types.ObjectId;
            rating: number;
            comment: string;
        }
    ];
    weight: number;
    stock: number;
}

const productSchema = new Schema<ProductI>({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    images: [{
        url: {
            type: String,
            required: true,
            trim: true
        }
    }],
    category: {
        type: String,
        required: true,
        trim: true
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: false
            },
            rating: {
                type: Number,
                required: false,
                min: 1,
                max: 5
            },
            comment: {
                type: String,
                required: false,
                trim: true
            }
        }
    ],
    weight: {
        type: Number,
        required: true,
        min: 0,
    },
    stock: {
        type: Number,
        required: true,
        min: 1,
    }

}, {timestamps: true});

const Product = mongoose.model<ProductI>("Product", productSchema);

export default Product;
