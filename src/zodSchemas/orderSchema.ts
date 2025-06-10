import { z } from "zod";

export const orderSchema = z.object({
  fullName: z.string().min(1, "Full name is required").trim(),
  address: z.string().min(1, "Address is required").trim(),
  phone: z.string()
    .regex(/^\d{11}$/, "Phone number must be exactly 11 digits"),
  city: z.string().min(1, "City is required").trim(),
  state: z.string().min(1, "State is required").trim(),
  postalCode: z.number().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required").trim(),
  paymentMethod: z.string().min(1, "Payment method is required").trim(),
});
