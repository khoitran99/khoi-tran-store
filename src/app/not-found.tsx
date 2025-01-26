"use client";

import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import Image from "next/image";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Image
        alt={`${APP_NAME} logo`}
        src="/images/logo.svg"
        height={48}
        width={48}
        priority
      />
      <div className="w-1/3 p-6 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold mb-4">Not found</h1>
        <p className="text-destructive">
          Sorry, the page you are looking for does not exist.
        </p>
        <Button
          variant={"outline"}
          className="mt-4 ml-2"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          Back To Home
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
