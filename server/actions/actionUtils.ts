import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";

import { messageParam } from "@/lib/utils";

export function redirectWithMessage(
  path: string,
  type: "success" | "error",
  message: string,
): never {
  redirect(`${path}?${type}=${messageParam(message)}`);
}

export function getActionErrorMessage(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues.map((issue) => issue.message).join(" ");
  }

  // Prisma error messages are internal/technical (raw query args, model
  // field names) — never show them to admins directly. Log the real error
  // server-side and return a generic, actionable message instead.
  if (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientValidationError ||
    error instanceof Prisma.PrismaClientUnknownRequestError ||
    error instanceof Prisma.PrismaClientRustPanicError
  ) {
    console.error("[action] Prisma error:", error);
    return "Something went wrong while saving. Please check your input and try again.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
