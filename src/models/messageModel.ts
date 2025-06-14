import mongoose, { Document, Schema } from "mongoose";

export interface MessageI extends Document {
    _id: mongoose.Schema.Types.ObjectId;
    sender: mongoose.Schema.Types.ObjectId;
    senderModel: "User" | "Admin"; // Identify which model the sender belongs to
    receiver: mongoose.Schema.Types.ObjectId;
    receiverModel: "User" | "Admin"; // Identify which model the receiver belongs to
    message: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new Schema<MessageI>({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'senderModel'
    },
    senderModel: {
        type: String,
        required: true,
        enum: ['User', 'Admin']
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'receiverModel'
    },
    receiverModel: {
        type: String,
        required: true,
        enum: ['User', 'Admin']
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

const messageModel = mongoose.model<MessageI>("Message", messageSchema);

export default messageModel;

