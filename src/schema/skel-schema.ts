import { z, type ZodType } from "zod";

import {
  verifyFileExtension,
  verifyMimeType,
  verifySize,
} from "@/lib/schema-utils";
import { type FileWithId } from "@/hooks/use-file-input";

const LIMIT_TO_30MB = 1000000 * 30;
const maxFileSizePerFileInMB = 1;
const acceptedMimeTypes = ["application/skel", ""];
const maxNumberOfFiles = 1;
const maxFileSizePerItem = maxFileSizePerFileInMB * LIMIT_TO_30MB;

export const skelSchema: ZodType<FileWithId[]> = z
  .array(
    z.object({
      id: z.string(),
      file: z.instanceof(File).refine((file) => file instanceof File, {
        message: "Expected a File object.",
      }),
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
      verifyFileExtension(file, ctx, i, [".skel", ".bytes"]);
    }
  });
