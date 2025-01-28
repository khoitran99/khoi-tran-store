"use server";

import { signIn, signOut } from "@/config/auth";
import { signInFormSchema, signUpFormSchema } from "../validators";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { prisma } from "@/db/prisma";
import { hashSync } from "bcrypt-ts-edge";
import { formatError } from "../utils";

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
