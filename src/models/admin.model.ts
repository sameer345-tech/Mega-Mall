import mongoose, { Schema, Document } from "mongoose";
import bcypt from "bcrypt";
export interface adminI extends Document {
  fullName: string;
  email: string;
  password: string;
  role: "superAdmin" | "admin" | "moderator";
  products: {product: mongoose.Schema.Types.ObjectId}[];
}

const adminSchema = new Schema<adminI>({
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
    enum: [ "superAdmin", "admin", "moderator"],
    default: "admin",
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      }
    },
  ],
  
}, {timestamps: true});

adminSchema.pre("save", async function (next) {
  if(!this.isModified("password")) return next();
  this.password = await bcypt.hash(this.password, 10);
  return next();
})

const adminModel = mongoose.model<adminI>("Admin", adminSchema);

export default adminModel;

