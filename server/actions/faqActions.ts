"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getFormBoolean,
  getFormNumber,
  getFormString,
} from "@/lib/utils";
import { faqSchema, idSchema } from "@/lib/validations";
import {
  getActionErrorMessage,
  redirectWithMessage,
} from "@/server/actions/actionUtils";

const adminPath = "/admin/faq";

function buildFAQData(formData: FormData) {
  return faqSchema.parse({
    question: getFormString(formData, "question"),
    answer: getFormString(formData, "answer"),
    isActive: getFormBoolean(formData, "isActive"),
    sortOrder: getFormNumber(formData, "sortOrder"),
  });
}

export async function createFAQ(formData: FormData) {
  await requireAdminSession();

  try {
    const data = buildFAQData(formData);
    await prisma.fAQItem.create({ data });
    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "FAQ created.");
}

export async function updateFAQ(formData: FormData) {
  await requireAdminSession();

  try {
    const id = idSchema.parse(getFormString(formData, "id"));
    const data = buildFAQData(formData);
    await prisma.fAQItem.update({ where: { id }, data });
    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "FAQ updated.");
}

export async function deleteFAQ(formData: FormData) {
  await requireAdminSession();

  try {
    const id = idSchema.parse(getFormString(formData, "id"));
    await prisma.fAQItem.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "FAQ deleted.");
}

export async function toggleFAQActive(formData: FormData) {
  await requireAdminSession();

  try {
    const id = idSchema.parse(getFormString(formData, "id"));
    const faq = await prisma.fAQItem.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!faq) throw new Error("FAQ not found.");

    await prisma.fAQItem.update({
      where: { id },
      data: { isActive: !faq.isActive },
    });
    revalidatePath("/");
    revalidatePath(adminPath);
  } catch (error) {
    redirectWithMessage(adminPath, "error", getActionErrorMessage(error));
  }

  redirectWithMessage(adminPath, "success", "FAQ visibility updated.");
}
