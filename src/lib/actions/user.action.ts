"use server";

import { signIn, signOut } from "@/config/auth";
import { signInFormSchema } from "../validators";
import { isRedirectError } from "next/dist/client/components/redirect-error";

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

export async function signOutUser() {
  await signOut();
}
