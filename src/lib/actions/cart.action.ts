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

    const session = await auth();
    const userId = session?.user?.id ?? undefined;

    const cart = await getMyCart();

    const item = cartItemSchema.parse(data);

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

      await prisma.cart.create({
        data: newCart,
      });

      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} is added to cart successfully`,
      };
    } else {
      /*
      Find existing item to:
      - Existed: add quantity
      - Non-existed: push new item
      */
      const existingIndex = (cart.items as CartItem[]).findIndex(
        (cartItem) => cartItem.productId === item.productId
      );

      // - Existed: add quantity
      if (existingIndex !== -1) {
        if (product.stock < cart.items[existingIndex].quantity + 1)
          throw new Error(`${product.name} does not have enough stock.`);

        cart.items[existingIndex] = {
          ...cart.items[existingIndex],
          quantity: cart.items[existingIndex].quantity + 1,
        };
      } else {
        // - Non-existed: push new item
        if (product.stock < 1)
          throw new Error(`${product.name} does not have enough stock.`);

        cart.items.push(item);
      }

      // Update data in cart and recalculate price
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items,
          ...calculateCartPrice(cart.items),
        },
      });

      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} is ${
          existingIndex !== -1 ? "updated in" : "added to"
        } cart successfully.`,
      };
    }
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

  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
  });
  if (!cart) return undefined;

  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  });
}

export async function removeItemFromCart(productId: string) {
  try {
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Cart session not found");
    let message = "";

    const cart = await getMyCart();
    if (!cart) throw new Error("Cart not found");

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });
    if (!product) throw new Error("Product not found");

    const existingIndex = (cart.items as CartItem[]).findIndex(
      (cartItem) => cartItem.productId === productId
    );

    if (existingIndex === -1)
      throw new Error(`${product.name} is not in cart.`);

    /*
      Check cart item quantity
      - Equal to 1: remove
      - Greater than 1: subtract 1 unit
      */
    if (cart.items[existingIndex].quantity === 1) {
      // - Equal to 1: remove
      cart.items = cart.items.filter(
        (cartItem) => cartItem.productId !== productId
      );
      message = `${product.name} is removed from cart successfully.`;
    } else {
      // - Greater than 1: subtract 1 unit
      cart.items[existingIndex] = {
        ...cart.items[existingIndex],
        quantity: cart.items[existingIndex].quantity - 1,
      };
      message = `${product.name} is updated in cart successfully.`;
    }

    // Update data in cart and recalculate price
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items,
        ...calculateCartPrice(cart.items),
      },
    });

    // Revalidate path cache
    revalidatePath(`/product/${product.slug}`);

    return {
      success: true,
      message: message,
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
