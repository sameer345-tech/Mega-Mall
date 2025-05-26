import {z} from "zod"

export const signInSchema = z.object({
        email: z.string().email({ message: "Invalid email" }).trim(),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(30, "Password must be at most 30 characters"),
    });