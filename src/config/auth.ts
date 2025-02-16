import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import type { NextAuthConfig, Session } from "next-auth";
import { Session as AdapterSession, User as AdapterUser } from "next-auth"; // Adjust based on your setup.
import type { JWT } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Assuming you're using next-auth

interface ExtendedUser extends AdapterUser {
  role?: string; // Define the role property, making it optional
}

export const config = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "Credentials",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        // Find user in database
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        // Check if the user exists and the password is correct
        if (user && user.password) {
          const isPasswordValid = compareSync(
            credentials.password as string,
            user.password
          );
          // You can now create a user session and log the user in
          if (isPasswordValid)
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({
      token,
      user,
      trigger,
      session,
    }: {
      session: AdapterSession & { user: ExtendedUser; id?: string }; // Extend AdapterSession to include user id
      user: ExtendedUser;
      trigger?: string; // trigger is optional
      token?: JWT; // token is optional
    }) {
      if (trigger === "update") {
        session.user.name = user.name; // Modify session here
      }
      if (token?.sub) session.user.id = token.sub as string; // Assert that token.sub is a string
      if (token?.role) session.user.role = token.role as string; // Assert for role
      if (token?.name) session.user.name = token.name as string; // Assert for name

      if (trigger === "update") {
        session.user.name = user.name;
      }
      return session;
    },
    async jwt({
      token,
      user,
      trigger,
      session,
    }: {
      session?: AdapterSession & { user: ExtendedUser; id?: string }; // Extend AdapterSession to include user id
      token: JWT;
      user: ExtendedUser;
      trigger?: string;
    }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        // If user has no name then use the email
        if (user.name === "NO_NAME") {
          token.name = user.email!.split("@")[0];
          // Update db to reflect token name
          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              name: token.name,
            },
          });
        }

        if (trigger === "signIn" || trigger === "signUp") {
          // Add items cart to user when user is authenticated
          const cookiesObj = await cookies();
          const sessionCartId = cookiesObj.get("sessionCartId")?.value;

          if (sessionCartId) {
            const sessionCart = await prisma.cart.findFirst({
              where: {
                sessionCartId,
              },
            });
            if (sessionCart) {
              await prisma.cart.deleteMany({
                where: {
                  userId: user.id,
                  NOT: {
                    id: sessionCart.id,
                  },
                },
              });

              // Assign new cart
              await prisma.cart.update({
                where: { id: sessionCart.id },
                data: { userId: user.id },
              });
            }
          }
        }
      }

      if (session?.user.name && trigger === "update") {
        token.name = session.user.name;
      }

      return token;
    },
    authorized({
      request,
      auth,
    }: {
      request: NextRequest;
      auth: Session | null;
    }) {
      // Array of regex patterns of paths we want to protect
      const protectedPaths = [
        /\/shipping-address/,
        /\/payment-method/,
        /\/place-order/,
        /\/profile/,
        /\/user\/(.*)/,
        /\/order\/(.*)/,
        /\/admin/,
      ];

      const { pathname } = request.nextUrl;

      // Check if user is not authenticated and accessing a protected route
      if (!auth && protectedPaths.some((path) => path.test(pathname)))
        return false;

      // Check for the session cart cookie
      if (!request.cookies.get("sessionCartId")) {
        // Generate new session cart id cookie
        const sessionCartId = crypto.randomUUID();

        // Clone cookie header
        const newRequestHeaders = new Headers(request.headers);

        // Create new response and add the new headers
        const response = NextResponse.next({
          headers: newRequestHeaders,
        });

        // Add new key-value in cookie
        response.cookies.set("sessionCartId", sessionCartId);
        return response;
      }
      return true;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
