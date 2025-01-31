"use server";
import { auth } from "@/config/auth";
import { getMyCart } from "./cart.action";
import { convertToPlainObject, formatError } from "../utils";
import { getUserById } from "./user.action";
import { insertOrderSchema } from "../validators";
import { prisma } from "@/db/prisma";

export async function createOrder() {
  try {
    const session = await auth();
    if (!session) throw new Error("User is not authenticated");

    const userId = session?.user?.id ?? undefined;
    if (!userId) throw new Error("User Id not found");

    const user = await getUserById(userId);
    if (!user) throw new Error("User not found");

    const cart = await getMyCart();
    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "Your cart is empty",
        redirectTo: "/cart",
      };
    }
    if (!user.address) {
      return {
        success: false,
        message: "Shipping address is not existed",
        redirectTo: "/shipping-address",
      };
    }
    if (!user.paymentMethod) {
      return {
        success: false,
        message: "Payment method is not existed",
        redirectTo: "/payment-method",
      };
    }

    // Validate order object before saving in the DB
    const order = insertOrderSchema.parse({
      userId: user.id,
      itemsPrice: cart.itemsPrice,
      totalPrice: cart.totalPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
    });

    // Using transaction to make sure order is consistent
    const insertedOrderId = await prisma.$transaction(async (tx) => {
      // Step 1: Create order to get order id and attach the id to order items
      const insertedOrder = await tx.order.create({
        data: order,
      });

      // Step 2: Create order items
      await tx.orderItem.createMany({
        data: cart.items.map((item) => ({
          orderId: insertedOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          name: item.slug,
          slug: item.slug,
          image: item.image,
        })),
      });

      // Step 3: Clear cart
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          itemsPrice: 0,
          totalPrice: 0,
          shippingPrice: 0,
          taxPrice: 0,
        },
      });
      return insertedOrder.id;
    });
    if (!insertedOrderId) throw new Error("Order not created");
    return {
      success: true,
      message: "Order created successfully.",
      redirectTo: `/order/${insertedOrderId}`,
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getOrderByIdAndUserId(orderId: string, userId: string) {
  const data = await prisma.order.findUnique({
    where: {
      id: orderId,
      userId: userId,
    },
    include: {
      orderItem: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
  return convertToPlainObject(data);
}
