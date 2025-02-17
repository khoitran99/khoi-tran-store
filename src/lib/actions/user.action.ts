"use server";

import { auth, signIn, signOut } from "@/config/auth";
import {
  paymentMethodSchema,
  shippingAddressSchema,
  signInFormSchema,
  signUpFormSchema,
  updateProfileSchema,
} from "../validators";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { prisma } from "@/db/prisma";
import { hashSync } from "bcrypt-ts-edge";
import { formatError } from "../utils";
import { PaymentMethod, ShippingAddress } from "@/types";
import { DEFAULT_PAGE_SIZE } from "../constants";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Sign in the user with credentials
export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    await signIn("credentials", user);
    return { success: true, message: "User signed in successfully." };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return {
      success: false,
      message: "Invalid credentials. Please try again.",
    };
  }
}

// Sign up the user with credentials
export async function signUpWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashSync(user.password, 10),
        role: "user",
      },
    });
    await signIn("credentials", {
      email: user.email,
      password: user.password,
    });
    return { success: true, message: "User signed up successfully." };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function signOutUser() {
  await signOut();
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) throw new Error("Error not found");
  return user;
}

// Update user address
export async function updateUserAddress(data: ShippingAddress) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("No user id");
    const foundUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!foundUser) throw new Error("User not found!");
    const address = shippingAddressSchema.parse(data);
    await prisma.user.update({
      where: { id: foundUser.id },
      data: {
        address,
      },
    });
    return {
      success: true,
      message: "User's address is updated successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// Update user address
export async function updatePaymentMethod(data: PaymentMethod) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("No user id");
    const foundUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!foundUser) throw new Error("User not found!");
    const paymentMethod = paymentMethodSchema.parse(data);
    await prisma.user.update({
      where: { id: foundUser.id },
      data: {
        paymentMethod: paymentMethod.type,
      },
    });
    return {
      success: true,
      message: "User's payment method is updated successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getMyOrders({
  page,
  size = DEFAULT_PAGE_SIZE,
}: {
  page: number;
  size?: number;
}) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("No user id");

    const myOrders = await prisma.order.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: size,
      skip: (page - 1) * size,
    });

    const totalOrders = await prisma.order.count({
      where: { userId: userId },
    });

    return {
      success: true,
      data: {
        data: myOrders,
        page: page,
        size: size,
        total: totalOrders,
        numPages: Math.ceil(totalOrders / size),
      },
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// Update user address
export async function updateMyProfile({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("No user id");

    const foundUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!foundUser) throw new Error("User not found!");

    const updateProfileData = updateProfileSchema.parse({ name, email });
    await prisma.user.update({
      where: { id: foundUser.id },
      data: {
        name: updateProfileData.name,
        email: updateProfileData.email,
      },
    });
    return {
      success: true,
      message: "User's profile is updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getAllUsers({
  page,
  size = DEFAULT_PAGE_SIZE,
  query,
}: {
  page: number;
  size?: number;
  query?: string;
}) {
  try {
    const whereClause: Prisma.UserWhereInput = {
      AND: [
        {
          OR: [
            {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
        {
          role: {
            not: "admin",
          },
        },
      ],
    };
    const data = await prisma.user.findMany({
      where: whereClause,
      take: size,
      skip: (page - 1) * size,
      include: {
        _count: {
          select: { order: true }, // Count total orders for each user
        },
      },
    });
    const total = await prisma.user.count({ where: whereClause });

    return {
      success: true,
      data: {
        data,
        page,
        size,
        total,
        numPages: Math.ceil(total / size),
      },
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function deleteAnUser(id: string) {
  try {
    const existedUser = await prisma.user.findUnique({ where: { id } });
    if (!existedUser) throw new Error("User not found");
    if (existedUser.role === "admin")
      throw new Error("Admin can not be deleted");

    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/users");
    return {
      success: true,
      message: "The user is deleted successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
