import Menu from "@/components/shared/header/menu";
import UserMainNav from "@/components/shared/user/main-nav";
import { APP_NAME } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="flex flex-col">
        <header className="border-b container mx-auto">
          <div className="flex items-center h-16 px-4">
            <Link href="/" className="flex-start">
              <Image
                alt={`${APP_NAME} logo`}
                src="/images/logo.svg"
                height={48}
                width={48}
                priority
              />
            </Link>
            <UserMainNav className="mx-6" />
            <div className="ml-auto items-center flex space-x-4">
              <Menu />
            </div>
          </div>
        </header>
        <div className="flex-1 space-y-4 p-8 pt-6 container mx-auto">
          {children}
        </div>
      </div>
    </>
  );
}
