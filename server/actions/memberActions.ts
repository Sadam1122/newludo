"use server";

import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFormBoolean, getFormNumber, getFormString } from "@/lib/utils";
import { idSchema, memberSchema } from "@/lib/validations";
import {
  getActionErrorMessage,
  redirectWithMessage,
} from "@/server/actions/actionUtils";

const adminPath = "/admin/members";

function buildMemberData(formData: FormData) {
  return memberSchema.parse({
    username: getFormString(formData, "username"),
    category: getFormString(formData, "category") || null,
    discountPercent: getFormNumber(formData, "discountPercent"),
    benefitNote: getFormString(formData, "benefitNote") || null,
    isActive: getFormBoolean(formData, "isActive"),
  });
}

export async function createMember(formData: FormData) {
  await requireAdminSession();

  try {
    const data = buildMemberData(formData);
    const password = getFormString(formData, "password");
    if (!password || password.length < 4) {
      throw new Error("Password must be at least 4 characters.");
    }

    const existing = await prisma.member.findUnique({
      where: { username: data.username },
    });
    if (existing) {
      throw new Error("Username is already taken.");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.member.create({
      data: { ...data, passwordHash },
    });

    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Member created.");
}

export async function updateMember(formData: FormData) {
  await requireAdminSession();

  try {
    const id = idSchema.parse(getFormString(formData, "id"));
    const data = buildMemberData(formData);
    const password = getFormString(formData, "password");

    const existing = await prisma.member.findFirst({
      where: { username: data.username, NOT: { id } },
    });
    if (existing) {
      throw new Error("Username is already taken.");
    }

    await prisma.member.update({
      where: { id },
      data: {
        ...data,
        ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}),
      },
    });

    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Member updated.");
}

export async function deleteMember(formData: FormData) {
  await requireAdminSession();

  try {
    const id = idSchema.parse(getFormString(formData, "id"));
    await prisma.member.delete({ where: { id } });
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Member deleted.");
}

export async function toggleMemberActive(formData: FormData) {
  await requireAdminSession();

  try {
    const id = idSchema.parse(getFormString(formData, "id"));
    const member = await prisma.member.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!member) throw new Error("Member not found.");

    await prisma.member.update({
      where: { id },
      data: { isActive: !member.isActive },
    });
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "Member status updated.");
}
