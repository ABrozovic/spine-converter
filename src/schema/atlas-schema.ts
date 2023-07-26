import { z } from "zod";

import {
  verifyFileExtension,
  verifyMimeType,
  verifySize,
} from "@/lib/schema-utils";
import { zodFileValidation } from "@/lib/utils";

const LIMIT_TO_30MB = 1000000 * 30;
const maxFileSizePerFileInMB = 1;
const acceptedMimeTypes = ["text/plain", ""];
const maxNumberOfFiles = 1;
const maxFileSizePerItem = maxFileSizePerFileInMB * LIMIT_TO_30MB;

export const atlasSchema = z
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
      verifyFileExtension(file, ctx, i, [".atlas", ".txt"]);
    }
  });
