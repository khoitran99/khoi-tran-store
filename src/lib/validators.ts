import { z } from "zod";
import { formatNumberWithDecimal } from "./utils";
import { PAYMENT_METHODS } from "./constants";

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

// Schema for shipping address
export const shippingAddressSchema = z.object({
  fullName: z.string().min(3, "Full name must be at 6 characters long"),
  streetAddress: z
    .string()
    .min(3, "Street address must be at 6 characters long"),
  city: z.string().min(3, "City must be at 6 characters long"),
  postalCode: z.string().min(3, "Postal code must be at 6 characters long"),
  country: z.string().min(3, "Country must be at 6 characters long"),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

// Schema for payment method
export const paymentMethodSchema = z
  .object({
    type: z.string().min(1, "Payment method is required"),
  })
  .refine((data) => PAYMENT_METHODS.includes(data.type), {
    path: ["type"],
    message: "Invalid payment method",
  });

// Schema for inserting order
export const insertOrderSchema = z.object({
  userId: z.string().min(1, "User id required"),
  itemsPrice: currency,
  totalPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.string().refine((data) => PAYMENT_METHODS.includes(data), {
    message: "Invalid payment method",
  }),
});

// Schema for insearting order itmes
export const insertOrderItemSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  image: z.string(),
  name: z.string(),
  price: currency,
  quantity: z.number(),
});

// Schema for payment method schema
export const paymentResultSchema = z.object({
  id: z.string(),
  status: z.string(),
  email_address: z.string(),
  pricePaid: z.string(),
});
