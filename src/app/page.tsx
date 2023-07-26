"use client";

import { useCallback, useRef } from "react";
import { atlasSchema } from "@/schema/atlas-schema";
import { imageSchema } from "@/schema/image-schema";
import { skelSchema } from "@/schema/skel-schema";
import { LucideX } from "lucide-react";
import { Spine, TextureAtlas } from "pixi-spine";
import { BaseTexture } from "pixi.js";

import { SkelToJson } from "@/lib/spine-converter/spine-skel-to-json";
import { SpineLoader } from "@/lib/spine-loader/spine-loader";
import { cn } from "@/lib/utils";
import Dropzone from "@/hooks/dropzone";
import useSpine from "@/hooks/use-spine";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Combobox from "@/components/combobox";
import { SpineControlButtons } from "@/components/spine-control-buttons";

type SpineUrls = {
  imageUrl?: string | null;
  skelFile?: Uint8Array | null;
  atlasText?: string | null;
};
const readFileAsDataURL = (file: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export default function IndexPage() {
  const spineUrlRef = useRef<SpineUrls>();
  const spinePlayer = useSpine();
  const spineString = useRef<string>();
  const { toast } = useToast();
  const setBlob = useCallback(
    ({
      atlasText = spineUrlRef.current?.atlasText,
      imageUrl = spineUrlRef.current?.imageUrl,
      skelFile = spineUrlRef.current?.skelFile,
    }: SpineUrls) => {
      spineUrlRef.current = {
        atlasText,
        imageUrl,
        skelFile,
      };

      if (!atlasText || !imageUrl || !skelFile) return;
      try {
        const texturedAtlas = new TextureAtlas(
          atlasText,
          (_, callback) => callback(BaseTexture.from(imageUrl)) // eslint-disable-line @typescript-eslint/no-unsafe-return
        );
        const spineLoader = new SpineLoader();
        const binaryParser = spineLoader.createBinaryParser();
        const skeletonToConvert = spineLoader.parseData(
          binaryParser,
          texturedAtlas,
          skelFile
        );
        const spineToConvert = new Spine(skeletonToConvert.spineData);
        const jsonToConvert = new SkelToJson(spineToConvert);
        spineString.current = jsonToConvert.toJSON();
        const convertedJson = JSON.parse(spineString.current) as unknown;

        const jsonParser = spineLoader.createJsonParser();
        const skeleton = spineLoader.parseData(
          jsonParser,
          texturedAtlas,
          convertedJson
        );
        const spine = new Spine(skeleton.spineData);

        spinePlayer.init(spine);
      } catch (error) {
        console.log("error:", error);
        toast({
          title: "Error loading Spine data",
          description: "Make sure your SKEL file version is compatible (3.4)",
        });
      }
    },
    [spinePlayer, toast]
  );
  const handleDownload = () => {
    if (!spineString.current) return;
    const blob = new Blob([spineString.current], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "converted.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFilesChanged = useCallback(
    async <T extends { file: File }>(
      files: T[],
      propertyName: keyof SpineUrls
    ): Promise<void> => {
      const uploadedFile = files[0]?.file;

      if (!uploadedFile) {
        setBlob({ [propertyName]: null });
        return;
      }
      switch (propertyName) {
        case "atlasText":
          const atlasText = await uploadedFile.text();
          setBlob({ [propertyName]: atlasText });
          break;
        case "imageUrl":
          const imageUrl = await readFileAsDataURL(uploadedFile);
          setBlob({ [propertyName]: imageUrl });
          break;
        case "skelFile":
          const skelFile = new Uint8Array(await uploadedFile.arrayBuffer());
          setBlob({ [propertyName]: skelFile });
          break;
        default:
          setBlob({ [propertyName]: null });
          break;
      }
    },
    [setBlob]
  );

  return (
    <section className="container grid min-h-screen items-center gap-6 pb-6 pt-4">
      <div className="flex h-full w-full flex-col gap-4 md:px-6 ">
        <div className="mx-auto flex w-full max-w-[980px] flex-col items-center gap-2">
          <h1 className="self-center text-center text-xl font-extrabold leading-tight tracking-tighter md:text-2xl lg:text-3xl">
            Spine Converter
          </h1>
          <h2 className="text-center font-semibold">
            Work in Progress: Upgrade Spine files to version 3.8
          </h2>
          <h3>(Supports spine versions 3.3 and 3.4)</h3>
        </div>
        <div className="flex w-full flex-col justify-between gap-2 md:flex-row ">
          <Dropzone
            className="flex-1 md:max-w-[33%]"
            onFilesChanged={(files) =>
              void handleFilesChanged(files, "atlasText")
            }
            acceptedMimeTypes={["application/octet-stream"]}
            acceptAll
            multiple={false}
            maxFiles={1}
            validator={(files) => atlasSchema.parse(files)}
          >
            {({
              maxFilesReached,
              isDragAccept: isFocused,
              files,
              handleRemove,
            }) => (
              <div
                className={`${cn(
                  `relative flex flex-1 cursor-pointer flex-col items-center justify-center border-2 border-dashed border-gray-500 px-6 text-center sm:min-h-[50px]`,
                  isFocused && "border-blue-500"
                )}`}
              >
                <p className="w-40 truncate sm:w-full">{`${
                  maxFilesReached
                    ? `${files[0] && `${files[0]?.file.name}`}`
                    : `Drop a .atlas file`
                }`}</p>
                {maxFilesReached && (
                  <button
                    className="pointer-events-auto absolute right-0 top-0 z-50"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(0);
                    }}
                  >
                    <LucideX className="h-full w-full" />
                  </button>
                )}
              </div>
            )}
          </Dropzone>
          <Dropzone
            className="w-full flex-1 md:max-w-[33%]"
            onFilesChanged={(files) =>
              void handleFilesChanged(files, "imageUrl")
            }
            acceptedMimeTypes={["image/jpeg", "image/png"]}
            acceptAll
            multiple={false}
            maxFiles={1}
            validator={(files) => imageSchema.parse(files)}
          >
            {({
              maxFilesReached,
              isDragAccept: isFocused,
              files,
              handleRemove,
            }) => (
              <div
                className={`${cn(
                  `relative flex flex-1 cursor-pointer flex-col items-center justify-center border-2 border-dashed border-gray-500 px-6 text-center sm:min-h-[50px]`,
                  isFocused && "border-blue-500"
                )}`}
              >
                <p className="w-40 truncate sm:w-full">{`${
                  maxFilesReached
                    ? `${files[0] && `${files[0]?.file.name}`}`
                    : `Drop a .png/jpeg file`
                }`}</p>
                {maxFilesReached && (
                  <button
                    className="pointer-events-auto absolute right-0 top-0 z-50"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(0);
                    }}
                  >
                    <LucideX className="h-6 w-6" />
                  </button>
                )}
              </div>
            )}
          </Dropzone>
          <Dropzone
            className="w-full flex-1 md:max-w-[33%]"
            onFilesChanged={(files) =>
              void handleFilesChanged(files, "skelFile")
            }
            acceptAll
            multiple={false}
            maxFiles={1}
            validator={(files) => skelSchema.parse(files)}
          >
            {({
              maxFilesReached,
              isDragAccept: isFocused,
              files,
              handleRemove,
            }) => (
              <div
                className={`${cn(
                  `relative flex flex-1 cursor-pointer flex-col items-center justify-center border-2 border-dashed border-gray-500 px-6 text-center sm:min-h-[50px]`,
                  isFocused && "border-blue-500"
                )}`}
              >
                <p className="w-40 truncate sm:w-full">{`${
                  maxFilesReached
                    ? `${files[0] && `${files[0]?.file.name}`}`
                    : `Drop a .skel file`
                }`}</p>
                {maxFilesReached && (
                  <button
                    className="pointer-events-auto absolute right-0 top-0 z-50"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(0);
                    }}
                  >
                    <LucideX className="h-6 w-6" />
                  </button>
                )}
              </div>
            )}
          </Dropzone>
        </div>
        <div className="flex w-full  flex-col gap-2">
          <Combobox
            defaultToFirst
            disabledText="Load a Spine file"
            searchText="Search by animation name"
            selectText="Select an animation"
            notFoundText="No animations found"
            data={spinePlayer.animationList?.map((animation, i) => ({
              value: i.toString(),
              label: animation.name,
            }))}
            onChange={(index) =>
              spinePlayer.playAnimation(parseInt(index.value))
            }
          />
          <SpineControlButtons pixiData={spinePlayer}>
            <Button
              disabled={!spineString.current}
              className="w-full"
              onClick={() => handleDownload()}
              variant="outline"
            >
              Download
            </Button>
          </SpineControlButtons>
        </div>
        <div className="h-full w-full flex-1 ">{spinePlayer.render}</div>
      </div>
    </section>
  );
}
