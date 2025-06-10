import mongoose from "mongoose";

interface messageI {
    _id: mongoose.Schema.Types.ObjectId;
    sender: mongoose.Schema.Types.ObjectId;
    receiver: mongoose.Schema.Types.ObjectId;
    message: string;
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new mongoose.Schema<messageI>({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
}, {timestamps: true});

const messageModel = mongoose.model<messageI>("Message", messageSchema);

export default messageModel;

