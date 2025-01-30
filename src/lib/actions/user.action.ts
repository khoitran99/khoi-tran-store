"use server";

import { auth, signIn, signOut } from "@/config/auth";
import {
  shippingAddressSchema,
  signInFormSchema,
  signUpFormSchema,
} from "../validators";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { prisma } from "@/db/prisma";
import { hashSync } from "bcrypt-ts-edge";
import { formatError } from "../utils";
import { ShippingAddress } from "@/types";

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
