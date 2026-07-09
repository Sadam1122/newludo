"use server";

import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

/**
 * Public (no admin session) member login check used on the booking page so
 * customers can preview their discount before paying. Checkout still
 * re-verifies credentials server-side independently — this is a UX preview,
 * not the security boundary.
 */
export async function verifyMemberLogin(
  username: string,
  password: string,
): Promise<
  | { success: true; discountPercent: number; benefitNote: string | null }
  | { success: false; error: string }
> {
  if (!username || !password) {
    return { success: false, error: "Masukkan username dan password member." };
  }

  const member = await prisma.member.findUnique({ where: { username } });

  if (!member || !member.isActive) {
    return { success: false, error: "Member tidak ditemukan atau tidak aktif." };
  }

  const isValid = await bcrypt.compare(password, member.passwordHash);
  if (!isValid) {
    return { success: false, error: "Username atau password member salah." };
  }

  return {
    success: true,
    discountPercent: member.discountPercent,
    benefitNote: member.benefitNote,
  };
}
