import { z } from "zod";

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(30, "Name must be at most 30 characters"),
    email: z
      .string().email({ message: "Invalid email" }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Confirm Password must be at least 8 characters")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
