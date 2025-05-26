import mongoose, { Schema, Document } from "mongoose";

interface AdminI extends Document {
  fullName: string;
  email: string;
  password: string;
  role: "superAdmin" | "admin" | "moderator";
  products: mongoose.Schema.Types.ObjectId[];
}

const adminSchema = new Schema<AdminI>({
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
    trim: true,
    required: true,
  },
  role: {
    type: String,
    enum: ["superAdmin", "admin", "moderator"],
    default: "admin",
    required: true,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: false,
    },
  ],
  
}, {timestamps: true});

const Admin = mongoose.model<AdminI>("Admin", adminSchema);

export default Admin;

