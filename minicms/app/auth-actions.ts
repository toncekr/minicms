"use server";

import { Prisma } from "@prisma/client";
import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { getSafeRedirect } from "@/lib/auth-redirect";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { loginInputSchema, registerInputSchema } from "@/lib/validation/auth";

export type AuthActionState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  values?: Record<string, string>;
};

function isSupportedOAuthProvider(value: FormDataEntryValue | null): value is "google" | "github" {
  return value === "google" || value === "github";
}

function toValues(entries: Record<string, FormDataEntryValue | null>) {
  return Object.fromEntries(
    Object.entries(entries).map(([key, value]) => [key, typeof value === "string" ? value : ""]),
  );
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const rawValues = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginInputSchema.safeParse(rawValues);

  if (!parsed.success) {
    return {
      error: "Check the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: toValues({
        email: rawValues.email,
      }),
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirectTo: getSafeRedirect(formData.get("callbackUrl")),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "Invalid email or password.",
        values: toValues({
          email: rawValues.email,
        }),
      };
    }

    throw error;
  }

  return {};
}

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const rawValues = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = registerInputSchema.safeParse(rawValues);

  if (!parsed.success) {
    return {
      error: "Check the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: toValues({
        name: rawValues.name,
        email: rawValues.email,
      }),
    };
  }

  const email = parsed.data.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    return {
      error: "An account with that email already exists.",
      values: toValues({
        name: rawValues.name,
        email: rawValues.email,
      }),
    };
  }

  try {
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email,
        emailVerified: new Date(),
        passwordHash: await hashPassword(parsed.data.password),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        error: "An account with that email already exists.",
        values: toValues({
          name: rawValues.name,
          email: rawValues.email,
        }),
      };
    }

    throw error;
  }

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: getSafeRedirect(formData.get("callbackUrl")),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "Your account was created, but automatic sign-in failed. Please log in manually.",
        values: {
          name: parsed.data.name,
          email,
        },
      };
    }

    throw error;
  }

  return {};
}

export async function oauthSignInAction(formData: FormData) {
  const provider = formData.get("provider");

  if (!isSupportedOAuthProvider(provider)) {
    return;
  }

  await signIn(provider, {
    redirectTo: getSafeRedirect(formData.get("callbackUrl")),
  });
}
