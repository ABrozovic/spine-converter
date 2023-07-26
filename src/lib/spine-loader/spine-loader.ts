/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as spine34 from "@pixi-spine/runtime-3.4";
import * as spine37 from "@pixi-spine/runtime-3.7";
import * as spine38 from "@pixi-spine/runtime-3.8";
import * as spine41 from "@pixi-spine/runtime-4.1";
import {
  BinaryInput,
  type ISkeletonData,
  type ISkeletonParser,
  type TextureAtlas,
} from "pixi-spine";

import { detectSpineVersion, SPINE_VERSION } from "./versions";

class UniBinaryParser implements ISkeletonParser {
  scale = 1;

  readSkeletonData(
    atlas: TextureAtlas,
    dataToParse: Uint8Array
  ): ISkeletonData {
    const version = this.readVersionOldFormat(dataToParse);
    const ver = detectSpineVersion(version);

    const parser = this.getSpineParserByVersion(ver, atlas);
    if (!parser) {
      const error = `Unsupported version of spine model ${version}, please update pixi-spine`;
      throw new Error(error);
    }

    parser.scale = this.scale;

    return parser.readSkeletonData(dataToParse);
  }

  readVersionOldFormat(dataToParse: Uint8Array) {
    const input = new BinaryInput(dataToParse);
    let version = "";

    try {
      input.readString();
      version = input.readString() ?? "";
    } catch (e) {
      // Ignore errors
    }

    return version;
  }

  private getSpineParserByVersion(ver: SPINE_VERSION, atlas: any): any {
    switch (ver) {
      case SPINE_VERSION.VER34:
        return new spine34.SkeletonBinary(
          new spine34.AtlasAttachmentLoader(atlas)
        );
      case SPINE_VERSION.VER38:
        return new spine38.SkeletonBinary(
          new spine38.AtlasAttachmentLoader(atlas)
        );
      case SPINE_VERSION.VER40:
      case SPINE_VERSION.VER41:
        return new spine41.SkeletonBinary(
          new spine41.AtlasAttachmentLoader(atlas)
        );
      default:
        return null;
    }
  }
}

class UniJsonParser implements ISkeletonParser {
  scale = 1;

  readSkeletonData(atlas: any, dataToParse: any): ISkeletonData {
    const version = dataToParse.skeleton.spine;
    const ver = detectSpineVersion(version);
    let parser: any = null;

    if (ver === SPINE_VERSION.VER37) {
      parser = new spine37.SkeletonJson(
        new spine37.AtlasAttachmentLoader(atlas)
      );
    }
    if (ver === SPINE_VERSION.VER38) {
      parser = new spine38.SkeletonJson(
        new spine38.AtlasAttachmentLoader(atlas)
      );
    }
    if (ver === SPINE_VERSION.VER40 || ver === SPINE_VERSION.VER41) {
      parser = new spine41.SkeletonJson(
        new spine41.AtlasAttachmentLoader(atlas)
      );
    }
    if (!parser) {
      const error = `Unsupported version of spine model ${version}, please update pixi-spine`;

      console.error(error);
    }

    parser.scale = this.scale;

    return parser.readSkeletonData(dataToParse);
  }
}

export type ISpineResource<SKD extends ISkeletonData> = {
  spineData: SKD;
  spineAtlas: TextureAtlas;
};

/**
 * @public
 */
export class SpineLoader {
  createBinaryParser(): ISkeletonParser {
    return new UniBinaryParser();
  }

  createJsonParser(): ISkeletonParser {
    return new UniJsonParser();
  }

  parseData(
    parser: ISkeletonParser,
    atlas: TextureAtlas,
    dataToParse: any
  ): ISpineResource<ISkeletonData> {
    const parserCast = parser as UniBinaryParser | UniJsonParser;

    return {
      spineData: parserCast.readSkeletonData(atlas, dataToParse),
      spineAtlas: atlas,
    };
  }
}
