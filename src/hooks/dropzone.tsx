import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

import { buildAcceptedObjects, type CommonMimeType } from "@/lib/mime-types";
import useFileInput, { type FileWithId } from "@/hooks/use-file-input";

type DropzoneProps = {
  onFilesChanged: (files: FileWithId[]) => void;
  onError?: (err: string) => void;
  multiple?: boolean;
  acceptedMimeTypes?: CommonMimeType[];
  acceptAll?: boolean;
  defaultValue?: FileWithId[];
  maxFiles?: number;
  className?: string;

  validator?: <T extends FileWithId[]>(file: T) => FileWithId[];
  children: ({
    files,
    isDragAccept,
    maxFilesReached,
    handleRemove,
    reset,
    error,
  }: {
    files: FileWithId[];
    isDragAccept: boolean;
    maxFilesReached: boolean;
    handleRemove: (index: number) => void;
    reset: () => void;
    error?: string[];
  }) => JSX.Element;
};
const Dropzone = ({
  onFilesChanged,
  acceptedMimeTypes = ["image/png", "image/jpeg"],
  acceptAll,
  defaultValue = [],
  multiple = true,
  maxFiles,
  className,
  validator,
  children,
}: DropzoneProps) => {
  const [error, setError] = useState<string[]>();

  const { files, handleDrop, reset, handleRemove } = useFileInput({
    defaultFiles: defaultValue,
    validator,
    onError: setError,
    onFilesChanged,
  });

  const { getRootProps, getInputProps, isDragAccept } = useDropzone({
    maxFiles,
    multiple,
    accept: acceptAll ? undefined : buildAcceptedObjects(acceptedMimeTypes),
    onDrop: (files) => handleDrop(files, maxFiles === 1 && maxFilesReached()),
  });

  const maxFilesReached = useCallback(
    () => !!maxFiles && files.length >= maxFiles,
    [files.length, maxFiles]
  );

  return (
    <div className={className}>
      <div {...getRootProps()}>
        {children({
          files,
          isDragAccept,
          maxFilesReached: maxFilesReached(),
          reset,
          handleRemove,
          error,
        })}
        <input {...getInputProps()} className="hidden" />
      </div>
      {error?.map((error, i) => (
        <div key={i} className="mt-1 text-center text-red-500">
          {error}{" "}
        </div>
      ))}
    </div>
  );
};

export default Dropzone;
