"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpDefaultValues } from "@/lib/constants";
import Link from "next/link";
import { signUpWithCredentials } from "@/lib/actions/user.action";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";

const CredentialsSignUpForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [data, action] = useActionState(signUpWithCredentials, {
    success: false,
    message: "",
  });

  const SignUpButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button disabled={pending} className="w-full" variant="default">
        {pending ? "Submitting..." : "Sign Up"}
      </Button>
    );
  };

  return (
    <form id="sign-up" className="space-y-4" action={action}>
      <input type="hidden" value={callbackUrl} name="callbackUrl" />
      <div>
        <Label htmlFor="email">Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          defaultValue={signUpDefaultValues.name}
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={signUpDefaultValues.email}
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="password"
          defaultValue={signUpDefaultValues.password}
        />
      </div>
      <div>
        <Label htmlFor="password">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="confirmPassword"
          defaultValue={signUpDefaultValues.confirmPassword}
        />
      </div>
      <div>
        <SignUpButton />
      </div>
      {data && !data.success && (
        <p className="text-center text-destructive">{data.message}</p>
      )}
      <div className="text-sm text-center text-muted-foreground">
        Already have an account?
        <Link href="/sign-in" target="_self" className="text-primary underline">
          Sign in
        </Link>{" "}
        instead.
      </div>
    </form>
  );
};

export default CredentialsSignUpForm;
