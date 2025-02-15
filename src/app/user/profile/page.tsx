import ProfileForm from "@/components/shared/user/profile-form";
import { auth } from "@/config/auth";
import { Metadata } from "next";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "My Profile",
};

const UserProfilePage = async () => {
  const session = await auth();
  return (
    <>
      <SessionProvider session={session}>
        <div className="max-w-md mx-auto space-y-4">
          <h2 className="h2-bold">Profile</h2>
          <div>
            <ProfileForm />
          </div>
        </div>
      </SessionProvider>
    </>
  );
};

export default UserProfilePage;
