import { clsx, type ClassValue } from "clsx";

export type ActionResult = {
  ok: boolean;
  message: string;
};

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getFormString(formData: FormData, key: string, fallback = "") {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : fallback;
}

export function getFormOptionalString(formData: FormData, key: string) {
  const value = getFormString(formData, key);
  return value.length > 0 ? value : null;
}

export function getFormBoolean(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}

export function getFormNumber(formData: FormData, key: string, fallback = 0) {
  const raw = getFormString(formData, key);
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

export function getFormDate(formData: FormData, key: string) {
  const raw = getFormString(formData, key);
  if (!raw) return null;

  const value = new Date(raw);
  return Number.isNaN(value.getTime()) ? null : value;
}

export function getFormFile(formData: FormData, key: string) {
  const value = formData.get(key);

  if (
    !value ||
    typeof value === "string" ||
    typeof value.size !== "number" ||
    typeof value.arrayBuffer !== "function" ||
    value.size === 0
  ) {
    return null;
  }

  return value as File;
}

export function messageParam(message: string) {
  return encodeURIComponent(message);
}
