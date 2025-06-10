import mongoose, { Schema, Document } from "mongoose";

export interface ProductI extends Document {
    title: string;
    description: string;
    price: number;
    images: [{
        url: string;
    }];
    category: string;
    reviews?: [
        {
            user: mongoose.Schema.Types.ObjectId;
            rating: number;
            comment: string;
        }
    ];
    weight: string;
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
            },
            rating: {
                type: Number,
                min: 1,
                max: 5
            },
            comment: {
                type: String,
                trim: true
            }
        }
    ],
    weight: {
        type: String,
        required: true,
        min: 1,
    },
    stock: {
        type: Number,
        required: true,
        min: 1,
    }

}, {timestamps: true});

const productModel = mongoose.model<ProductI>("Product", productSchema);

export default productModel;
