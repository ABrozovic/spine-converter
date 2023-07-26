import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getFileExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex == -1) return "";
  return filename.substring(lastDotIndex);
};

export const zodFileValidation = z
  .custom<File>((v) => v instanceof File)
  .refine((file) => file instanceof File, {
    message: "Expected a File object.",
  });
