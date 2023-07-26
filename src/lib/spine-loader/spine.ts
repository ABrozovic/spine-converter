/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as spine34 from "@pixi-spine/runtime-3.4";
import * as spine37 from "@pixi-spine/runtime-3.7";
import * as spine38 from "@pixi-spine/runtime-3.8";
import * as spine41 from "@pixi-spine/runtime-4.1";
import {
  SpineBase,
  type IAnimationState,
  type IAnimationStateData,
  type ISkeleton,
  type ISkeletonData,
} from "pixi-spine";

import { detectSpineVersion, SPINE_VERSION } from "./versions";

/**
 * @public
 */
export class Spine extends SpineBase<
  ISkeleton,
  ISkeletonData,
  IAnimationState,
  IAnimationStateData
> {
  private spineVersionsMap: { [version in SPINE_VERSION]: any } = {
    [SPINE_VERSION.VER34]: spine34,
    [SPINE_VERSION.VER37]: spine37,
    [SPINE_VERSION.VER38]: spine38,
    [SPINE_VERSION.VER40]: spine41,
    [SPINE_VERSION.VER41]: spine41,
    [SPINE_VERSION.UNKNOWN]: null,
  };

  createSkeleton(spineData: ISkeletonData) {
    const ver = detectSpineVersion(spineData.version);
    const spine = this.spineVersionsMap[ver];

    if (!spine) {
      const error = `Can't detect version of spine model ${spineData.version}`;
      console.error(error);
      return;
    }

    this.skeleton = new spine.Skeleton(spineData);
    this.skeleton.updateWorldTransform();
    this.stateData = new spine.AnimationStateData(spineData);
    this.state = new spine.AnimationState(this.stateData);
  }
}
