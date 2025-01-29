"use server";

import { CartItem } from "@/types";
import { convertToPlainObject, formatError, round2 } from "../utils";
import { cookies } from "next/headers";
import { auth } from "@/config/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";

// Calculate cart price
function calculateCartPrice(items: CartItem[]) {
  const itemsPrice = round2(
    items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0)
  );
  const shippingPrice = itemsPrice >= 100 ? 0 : 10;
  const taxPrice = round2(0.15 * itemsPrice);
  const totalPrice = round2(itemsPrice + shippingPrice + taxPrice);
  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
}

export async function addItemToCart(data: CartItem) {
  try {
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Cart session not found");
    // Get session and user id
    const session = await auth();
    const userId = session?.user?.id ?? undefined;

    // Get cart
    const cart = await getMyCart();

    // Parse item
    const item = cartItemSchema.parse(data);

    // Find product in db
    const product = await prisma.product.findUnique({
      where: {
        id: item.productId,
      },
    });
    if (!product) throw new Error("Product not found");

    if (!cart) {
      const newCart = insertCartSchema.parse({
        items: [item],
        userId: userId,
        sessionCartId: sessionCartId,
        ...calculateCartPrice([item]),
      });

      // Add cart to db
      await prisma.cart.create({
        data: newCart,
      });

      // Revalidate path cache
      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: "Added item in cart successfully",
      };
    }
    return {
      success: true,
      message: "Added item in cart successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getMyCart() {
  const sessionCartId = (await cookies()).get("sessionCartId")?.value;
  if (!sessionCartId) throw new Error("Cart session not found");

  // Get session and user id
  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
  });
  if (!cart) return undefined;

  // Convert decimals and return
  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  });
}
