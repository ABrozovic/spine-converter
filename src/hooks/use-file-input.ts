import * as React from "react";
import { z } from "zod";

export type FileWithId = {
  id: string;
  file: File & { readonly path?: string };
};

type FileInputProps = {
  onFilesChanged: (files: FileWithId[]) => void;
  onError: (err: string[]) => void;
  defaultFiles?: FileWithId[];
  validator?: <T extends FileWithId[]>(file: T) => void;
};

const useFileInput = ({
  onFilesChanged,
  onError,
  defaultFiles = [],
  validator,
}: FileInputProps) => {
  const [files, setFiles] = React.useState<FileWithId[]>(defaultFiles);

  const reset = () => {
    setFiles(defaultFiles);
  };

  const handleValidationError = (err: unknown) => {
    let errorMessage: string[];
    if (err instanceof z.ZodError) {
      errorMessage = err.issues.map((issue) => issue.message);
    } else if (err instanceof Error) {
      errorMessage = [err.message];
    } else if (typeof err === "string") {
      errorMessage = [err];
    } else {
      errorMessage = ["An unknown error occurred"];
    }
    onError(errorMessage);
  };

  const handleDrop = (acceptedFiles: File[], autoReplace?: boolean) => {
    const existingIds = new Set(files.map(({ id }) => id));
    const newFilesWithIds = acceptedFiles
      .map((file) => {
        const id = `${file.name}-${file.lastModified}-${file.size}`;
        return { id, file };
      })
      .filter(({ id }) => !existingIds.has(id));

    if (newFilesWithIds.length > 0) {
      const allFiles = autoReplace
        ? newFilesWithIds
        : newFilesWithIds.concat(files);
      try {
        if (validator) {
          validator(allFiles);
        }
        setFiles(allFiles);
        onFilesChanged(allFiles);
        onError([]);
      } catch (err) {
        handleValidationError(err);
      }
    }
  };

  const handleRemove = React.useCallback(
    (index: number) => {
      if (index >= 0 && index < files.length) {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
      }
    },
    [files, setFiles]
  );

  return { files, handleDrop, onError, handleRemove, reset };
};

export default useFileInput;
