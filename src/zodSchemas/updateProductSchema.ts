import { z } from "zod";

export const updateProductSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be at most 100 characters").optional(),
  description: z.string().min(1, "Description is required").max(1000, "Description must be at most 1000 characters").optional(),
  price: z.number().min(0, "Price must be a positive number").optional(),
  images: z.array(z.object({
    url: z.string().url("Invalid URL format for image")
  })).min(1, "At least one image is required").optional(),
  category: z.string().min(1, "Category is required").max(100, "Category must be at most 100 characters").optional(),
  reviews: z.array(z.object({
    user: z.string().optional(),
    rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5").optional(),
    comment: z.string().max(500, "Comment must be at most 500 characters").optional()
  })).optional(),
  weight: z.string().min(1, "Weight is required").optional(),
  stock: z.number().min(0, "Stock must be a non-negative number").optional()
});

