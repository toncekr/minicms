import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

import { prisma } from "@/lib/prisma";
import { loginInputSchema } from "@/lib/validation/auth";

const providers = [
  Credentials({
    name: "Email and Password",
    credentials: {
      email: {
        label: "Email",
        type: "email",
      },
      password: {
        label: "Password",
        type: "password",
      },
    },
    authorize: async (credentials) => {
      const parsed = loginInputSchema.safeParse(credentials);

      if (!parsed.success) {
        return null;
      }

      const email = parsed.data.email.toLowerCase();
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          passwordHash: true,
          role: true,
        },
      });

      if (!user?.passwordHash) {
        return null;
      }

      const { verifyPassword } = await import("@/lib/password");
      const isValidPassword = await verifyPassword(parsed.data.password, user.passwordHash);

      if (!isValidPassword) {
        return null;
      }

      return user;
    },
  }),
  ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
    ? [
        Google({
          clientId: process.env.AUTH_GOOGLE_ID,
          clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
      ]
    : []),
  ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
    ? [
        GitHub({
          clientId: process.env.AUTH_GITHUB_ID,
          clientSecret: process.env.AUTH_GITHUB_SECRET,
        }),
      ]
    : []),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  secret:
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV !== "production" ? "weedpal-development-secret" : undefined),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        return Boolean(profile?.email_verified);
      }

      return true;
    },
    async jwt({ token, user }) {
      const userId =
        typeof user?.id === "string"
          ? user.id
          : typeof token.id === "string"
            ? token.id
            : typeof token.sub === "string"
              ? token.sub
              : null;

      if (userId) {
        token.id = userId;
      }

      if (!token.id && token.sub) {
        token.id = token.sub;
      }

      if (typeof user?.role === "string") {
        token.role = user.role;
      }

      if (userId && typeof token.role !== "string") {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            role: true,
          },
        });

        token.role = dbUser?.role ?? "USER";
      }

      return token;
    },
    session({ session, token }) {
      const userId =
        typeof token.id === "string"
          ? token.id
          : typeof token.sub === "string"
            ? token.sub
            : null;

      if (session.user && userId) {
        session.user.id = userId;
        session.user.role = typeof token.role === "string" ? token.role : "USER";
      }

      return session;
    },
  },
});
