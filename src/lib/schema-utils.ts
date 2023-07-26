import { z } from "zod";

import type { CommonMimeType } from "./mime-types";

export function verifyMimeType(
  file: File & { type: string },
  ctx: z.RefinementCtx,
  i: number,
  acceptedMimeTypes: CommonMimeType[] | string[]
) {
  if (!acceptedMimeTypes.includes(file?.type as CommonMimeType)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${
        i > 1 ? `File at index ${i}` : `File `
      } must have a mime-type of: "${acceptedMimeTypes.join(
        ", "
      )}" but was ${file?.type}`,
    });
  }
}

export function verifySize(
  file: File & { type: string },
  ctx: z.RefinementCtx,
  i: number,
  maxFileSizePerItem: number
) {
  if (file && file.size > maxFileSizePerItem) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_big,
      type: "array",
      message: `The file at index ${i} must not be larger than ${maxFileSizePerItem} bytes: ${file.size}`,
      maximum: maxFileSizePerItem,
      inclusive: true,
    });
  }
}

export function verifyFileExtension(
  file: File & { name: string },
  ctx: z.RefinementCtx,
  i: number,
  acceptedExtensions: string[]
) {
  const fileExtension = file?.name.split(".").pop()?.toLowerCase() ?? "";
  if (!acceptedExtensions.includes(`.${fileExtension}`)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${
        i > 1 ? `File at index ${i}` : `File `
      } must have one of the following extensions: "${acceptedExtensions.join(
        ", "
      )}`,
    });
  }
}
