import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const providers = [];

if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(GitHub);
}

const enableCredentials =
  process.env.NODE_ENV !== "production" ||
  Boolean(process.env.AUTH_DEV_EMAIL && process.env.AUTH_DEV_PASSWORD);

if (enableCredentials) {
  providers.push(
    Credentials({
      name: "Development Login",
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
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const email = process.env.AUTH_DEV_EMAIL ?? "editor@example.com";
        const password = process.env.AUTH_DEV_PASSWORD ?? "letmein";

        if (
          parsed.data.email.toLowerCase() !== email.toLowerCase() ||
          parsed.data.password !== password
        ) {
          return null;
        }

        return prisma.user.upsert({
          where: { email },
          update: {
            name: process.env.AUTH_DEV_NAME ?? "Development Editor",
            emailVerified: new Date(),
          },
          create: {
            email,
            name: process.env.AUTH_DEV_NAME ?? "Development Editor",
            emailVerified: new Date(),
          },
        });
      },
    }),
  );
}

if (providers.length === 0) {
  throw new Error(
    "No authentication providers are configured. Set GitHub auth env vars or enable credentials auth.",
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  secret:
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV !== "production" ? "minicms-development-secret" : undefined),
  session: {
    strategy: "jwt",
  },
  providers,
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }

      if (!token.id && token.sub) {
        token.id = token.sub;
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
      }

      return session;
    },
  },
});
