import { z } from "zod";

export const adminSignupSchema = z.object({
  fullName: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(30, "Name must be at most 30 characters"),
  email: z.string().email({ message: "Invalid email" }).trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(30, "Password must be at most 30 characters"),
    role: z.enum(["superAdmin", "admin", "moderator"]),
});
