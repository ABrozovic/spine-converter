import { z, type ZodType } from "zod";

import type { CommonMimeType } from "@/lib/mime-types";
import { verifyMimeType, verifySize } from "@/lib/schema-utils";
import { zodFileValidation } from "@/lib/utils";
import { type FileWithId } from "@/hooks/use-file-input";

const LIMIT_TO_30MB = 1000000 * 30;
const maxFileSizePerFileInMB = 1;
const acceptedMimeTypes: CommonMimeType[] = ["image/jpeg", "image/png"];
const maxNumberOfFiles = 1;
const maxFileSizePerItem = maxFileSizePerFileInMB * LIMIT_TO_30MB;

export const imageSchema: ZodType<FileWithId[]> = z
  .array(
    z.object({
      id: z.string(),
      file: zodFileValidation,
    })
  )
  .max(maxNumberOfFiles, {
    message: `You can only add up to ${maxNumberOfFiles} files`,
  })
  .superRefine((f, ctx) => {
    for (let i = 0; i < f.length; i += 1) {
      const { file } = f[i];
      verifyMimeType(file, ctx, i, acceptedMimeTypes);
      verifySize(file, ctx, i, maxFileSizePerItem);
    }
  });
