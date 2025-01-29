import { z } from "zod";
import { formatNumberWithDecimal } from "./utils";

const currency = z
  .string()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
    "Price must have exactly two decimal places"
  );

// Schema for inserting product
export const insertProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  slug: z.string().min(3, "Slug must be at least 3 characters long"),
  category: z.string().min(3, "Category must be at least 3 characters long"),
  brand: z.string().min(3, "Brand must be at least 3 characters long"),
  description: z
    .string()
    .min(3, "Description must be at least 3 characters long"),
  stock: z.coerce.number(),
  images: z.array(z.string()).min(1, "Image must have at least one value"),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  price: currency,
});

// Schema for signing users in
export const signInFormSchema = z.object({
  email: z.string().email("Invalid email address").nonempty("Email required"),
  password: z.string().min(6, "Password must be at 6 characters long"),
});

// Schema for signing users in
export const signUpFormSchema = z
  .object({
    name: z.string().min(3, "Name must be at 3 characters long"),
    email: z.string().email("Invalid email address").nonempty("Email required"),
    password: z.string().min(6, "Password must be at 6 characters long"),
    confirmPassword: z.string().min(6, "Password must be at 6 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Schema for cart items
export const cartItemSchema = z.object({
  productId: z.string().min(1, "Product ID required"),
  name: z.string().min(1, "Name required"),
  slug: z.string().min(1, "Slug required"),
  quantity: z.number().int().positive("Quantity must be a positive number"),
  image: z.string().min(1, "Image is required"),
  price: currency,
});

// itemsPrice, totalPrice,shippingPrice, taxPrice, sessionCartId, userId
export const insertCartSchema = z.object({
  items: z.array(cartItemSchema),
  itemsPrice: currency,
  totalPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  sessionCartId: z.string().min(1, "Session cart ID required"),
  userId: z.string().optional().nullable(),
});
