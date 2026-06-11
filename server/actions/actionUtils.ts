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

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
