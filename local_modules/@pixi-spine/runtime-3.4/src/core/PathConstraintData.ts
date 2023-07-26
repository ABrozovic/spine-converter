import type { PositionMode, RotateMode } from "@pixi-spine/base";

import type { BoneData } from "./BoneData";
import { ConstraintData } from "./Constraint";
import type { SlotData } from "./SlotData";

/**
 * @public
 */
export class PathConstraintData extends ConstraintData {
  bones = new Array<BoneData>();
  target: SlotData;
  positionMode: PositionMode;
  spacingMode: SpacingMode;
  rotateMode: RotateMode;
  offsetRotation: number;
  position: number;
  spacing: number;
  rotateMix: number;
  translateMix: number;

  constructor(name: string) {
    super(name, 0, false);
  }
}
/**
 * @public
 */
export enum SpacingMode {
  Length,
  Fixed,
  Percent,
}
