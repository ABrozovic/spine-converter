/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type AttachmentTimeline,
  type ColorTimeline,
  type DeformTimeline,
  type IkConstraintTimeline,
  type PathConstraintMixTimeline,
  type RotateTimeline,
  type ScaleTimeline,
  type ShearTimeline,
  type SkinEntry,
  type TransformConstraintTimeline,
  type TranslateTimeline,
} from "@pixi-spine/runtime-3.4";
import {
  AttachmentType,
  type IBoneData,
  type IEventData,
  type IIkConstraintData,
  type IPathConstraintData,
  type ISkin,
  type ITimeline,
  type ITransformConstraintData,
  type Spine,
} from "pixi-spine";

import {
  AnimationData,
  type KeyFrameData,
  type KeyFrameWithAngle,
  type KeyFrameWithColor,
  type KeyFrameWithOffset,
  type KeyFrameWithXY,
} from "./spine-animation-data";
import {
  SkinData,
  type SkinAttachmentParameters,
  type SkinAttributes,
} from "./spine-skin-data";

type SkeletonAttributes = {
  hash?: string;
  spine?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  images?: string;
  audio?: string;
};
type BoneAttributes = {
  name: string;
  length?: number;
  parent?: string;
  transform?: TransformModeValue;
  skin?: boolean;
  x?: number;
  y?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  shearX?: number;
  shearY?: number;
  color?: number;
};
type SlotAttributes = {
  name: string;
  bone: string;
  color?: string;
  dark?: string;
  attachment?: string;
  blend?: "normal" | "additive" | "multiply" | "screen";
};
type IKConstraintAttributes = {
  name: string;
  order: number;
  skin?: boolean;
  bones: string[];
  target: string;
  mix?: number;
  softness?: number;
  bendPositive?: boolean;
  compress?: boolean;
  stretch?: boolean;
  uniform?: boolean;
};

type TransformConstraintAttributes = {
  name: string;
  order: number;
  skin?: boolean;
  bones: string[];
  target: string;
  rotation?: number;
  x?: number;
  y?: number;
  scaleX?: number;
  scaleY?: number;
  shearY?: number;
  rotateMix?: number;
  translateMix?: number;
  scaleMix?: number;
  shearMix?: number;
  local?: boolean;
  relative?: boolean;
};

type PathConstraintAttributes = {
  name: string;
  order: number;
  skin?: boolean;
  bones: string[];
  target: string;
  positionMode?: "fixed" | "percent";
  spacingMode?: "length" | "fixed" | "percent";
  rotateMode?: "tangent" | "chain" | "chain scale";
  rotation?: number;
  position?: number;
  spacing?: number;
  rotateMix?: number;
  translateMix?: number;
};

type EventAttributes = {
  name: string;
  int?: number;
  float?: number;
  string?: string;
  audio?: string;
  volume?: number;
  balance?: number;
};
type ExtendedBoneData = {
  inheritRotation: boolean;
  inheritScale: boolean;
} & IBoneData;

type ExtendedIkConstraintData = {
  bones: BoneAttributes[];
  target: BoneAttributes;
  bendPositive: number;
  softness: number;
} & IIkConstraintData;

type ExtendedTransformConstraintData = {
  bones: BoneAttributes[];
  target: BoneAttributes;
  rotateMix: number;
  translateMix: number;
  scaleMix: number;
  shearMix: number;
} & ITransformConstraintData;

type ExtendedIPathConstraintData = {
  bones: BoneAttributes[];
  target: BoneAttributes;
  rotateMix: number;
  translateMix: number;
  spacingMode: number;
} & IPathConstraintData;
type ExtendedEventData = {
  intValue: number;
  floatValue: number;
  stringValue: string;
  audioPath: string;
  volume: number;
  balance: number;
} & IEventData;

type ExtendedSkin = {
  getAttachments: () => SkinEntry[];
} & ISkin;

const transformModeStrings = {
  0: "normal",
  1: "onlyTranslation",
  2: "noRotationOrReflection",
  3: "noScale",
  4: "noScaleOrReflection",
} as const;
type TransformModeStrings = typeof transformModeStrings;
type TransformModeValue = TransformModeStrings[keyof TransformModeStrings];
export class SkelToJson {
  animData = new AnimationData();
  skeleton: SkeletonAttributes;
  bones: BoneAttributes[];
  slots: SlotAttributes[];
  ik: IKConstraintAttributes[];
  transform: TransformConstraintAttributes[];
  path: PathConstraintAttributes[];
  events: EventAttributes[];
  skins: SkinAttributes[];
  animations: Record<string, KeyFrameData>;

  constructor(private spine: Spine) {
    this.skeleton = this.createSkeletonAttributes();
    this.bones = this.createBoneAttributes();
    this.slots = this.createSlotAttributes();
    this.ik = this.createIKConstraintAttributes();
    this.transform = this.createTransformConstraintAttributes();
    this.path = this.createPathConstraintAttributes();
    this.events = this.createEventAttributes();
    this.skins = this.createSkinAttributes();
    this.animations = this.createAnimationData();
  }
  toJSON() {
    return JSON.stringify(
      removeEmpty({
        skeleton: this.skeleton,
        bones: this.bones,
        slots: this.slots,
        ik: this.ik,
        transform: this.transform,
        path: this.path,
        events: this.events,
        skins: this.skins,
        animations: this.animations,
      }),
      null,
      2
    );
  }
  private getTransform(
    inheritRotation: boolean,
    inheritScale: boolean
  ): TransformModeValue {
    let transform: keyof typeof transformModeStrings = 0;
    if (!inheritRotation && inheritScale) transform = 2;
    if (inheritRotation && !inheritScale) transform = 3;
    if (!inheritRotation && !inheritScale) transform = 1;
    return transformModeStrings[transform];
  }
  private rgba8888ToColor(rgba: {
    r: number;
    g: number;
    b: number;
    a: number;
  }): string {
    const { r, g, b, a } = rgba;
    const hex = (color: number) =>
      Math.round(color * 255)
        .toString(16)
        .padStart(2, "0");

    return `${hex(r)}${hex(g)}${hex(b)}${hex(a)}`;
  }

  private createSkeletonAttributes(): SkeletonAttributes {
    const {
      data: { hash, width, height },
      x,
      y,
    } = this.spine.skeleton;
    return {
      hash,
      spine: "3.8.76",
      x,
      y,
      width,
      height,
      images: "/images/",
      audio: "",
    };
  }

  private createBoneAttributes(): BoneAttributes[] {
    const bones = this.spine.skeleton.bones;
    return bones.map(({ data: boneData }) => {
      const bone = boneData as ExtendedBoneData;
      return {
        name: bone.name,
        length: bone.length,
        // transform: bone.transformMode,
        parent: bone.parent ? bone.parent.name : undefined,
        skin: false,
        x: bone.x,
        y: bone.y,
        rotation: bone.rotation,
        scaleX: bone.scaleX,
        scaleY: bone.scaleY,
        shearX: bone.shearX,
        shearY: bone.scaleY,
        transform: this.getTransform(bone.inheritRotation, bone.inheritScale),
        //color: bone.
      };
    });
  }

  private createSlotAttributes(): SlotAttributes[] {
    const slots = this.spine.skeleton.slots;
    return slots.map(({ data: slot }) => {
      return {
        name: slot.name,
        bone: slot.boneData.name,
        color: this.rgba8888ToColor(slot.color),
        // dark: "",
        attachment: slot.attachmentName ?? slot.name,
        // blend: slot.blendMode,
      };
    });
  }

  private createIKConstraintAttributes(): IKConstraintAttributes[] {
    const iks = this.spine.skeleton.data.ikConstraints;
    return iks.map((ikConstraint) => {
      const extendedIkConstraint = ikConstraint as ExtendedIkConstraintData;
      return {
        name: extendedIkConstraint.name,
        order: extendedIkConstraint.order,
        skin: false,
        bones: extendedIkConstraint.bones.map((bone) => bone.name),
        target: extendedIkConstraint.target.name,
        mix: extendedIkConstraint.mix,
        softness: extendedIkConstraint.softness,
        bendPositive: extendedIkConstraint.bendPositive > 0,
        compress: extendedIkConstraint.compress,
        stretch: extendedIkConstraint.stretch,
        uniform: extendedIkConstraint.uniform,
      };
    });
  }

  private createTransformConstraintAttributes(): TransformConstraintAttributes[] {
    const transforms = this.spine.skeleton.data.transformConstraints;
    return transforms.map((transformConstraint) => {
      const ExtendedTransformConstraint =
        transformConstraint as ExtendedTransformConstraintData;
      return {
        name: ExtendedTransformConstraint.name,
        order: ExtendedTransformConstraint.order,
        skin: false,
        bones: ExtendedTransformConstraint.bones.map((bone) => bone.name),
        target: ExtendedTransformConstraint.target.name,
        rotation: ExtendedTransformConstraint.offsetRotation,
        x: ExtendedTransformConstraint.offsetX,
        y: ExtendedTransformConstraint.offsetY,
        scaleX: ExtendedTransformConstraint.offsetScaleX,
        scaleY: ExtendedTransformConstraint.offsetScaleY,
        shearY: ExtendedTransformConstraint.offsetShearY,
        rotateMix: ExtendedTransformConstraint.rotateMix,
        translateMix: ExtendedTransformConstraint.translateMix,
        scaleMix: ExtendedTransformConstraint.scaleMix,
        shearMix: ExtendedTransformConstraint.shearMix,
        local: ExtendedTransformConstraint.local,
        relative: ExtendedTransformConstraint.relative,
      };
    });
  }

  private createPathConstraintAttributes(): PathConstraintAttributes[] {
    const paths = this.spine.skeleton.data.pathConstraints;
    return paths.map((pathConstraint) => {
      const extendedPathConstraint =
        pathConstraint as ExtendedIPathConstraintData;
      return {
        name: extendedPathConstraint.name,
        order: extendedPathConstraint.order,
        skin: false,
        bones: extendedPathConstraint.bones.map((bone) => bone.name),
        target: extendedPathConstraint.target.name,
        positionMode:
          extendedPathConstraint.positionMode > 0 ? "fixed" : "percent",
        spacingMode:
          extendedPathConstraint.spacingMode == 1
            ? "fixed"
            : extendedPathConstraint.rotateMode == 2
            ? "percent"
            : "length",
        rotateMode:
          extendedPathConstraint.rotateMode == 1
            ? "chain"
            : extendedPathConstraint.rotateMode == 2
            ? "chain scale"
            : "tangent",
        rotation: extendedPathConstraint.rotateMix,
        position: extendedPathConstraint.position,
        spacing: extendedPathConstraint.spacing,
        rotateMix: extendedPathConstraint.rotateMix,
        translateMix: extendedPathConstraint.translateMix,
      };
    });
  }

  private createEventAttributes(): EventAttributes[] {
    const events = this.spine.skeleton.data.events;
    return events.map((event: IEventData) => {
      const extendedEvent = event as ExtendedEventData;
      return {
        name: extendedEvent.name,
        int: extendedEvent.intValue,
        float: extendedEvent.floatValue,
        string: extendedEvent.stringValue,
        audio: extendedEvent.audioPath,
        volume: extendedEvent.volume,
        balance: extendedEvent.balance,
      };
    });
  }

  private createAnimationData(): Record<string, KeyFrameData> {
    this.spine.skeleton.data.animations.forEach((animation) => {
      this.animData.addAnimation(animation.name);
      animation.timelines.forEach((timeline) => {
        const timelineConstructorName =
          (timeline as ITimeline & { type: string }).type ??
          timeline.constructor.name;

        if (
          ["_ColorTimeline", "ColorTimeline"].some((item) =>
            timelineConstructorName.includes(item)
          )
        ) {
          this.handleSlotColorKeyframe(timeline as ColorTimeline);
        }
        if (
          ["AttachmentTimeline", "_AttachmentTimeline"].some((item) =>
            timelineConstructorName.includes(item)
          )
        ) {
          this.handleSlotAttachmentKeyframe(timeline as AttachmentTimeline);
        }
        if (
          ["_RotateTimeline", "RotateTimeline"].some((item) =>
            timelineConstructorName.includes(item)
          )
        ) {
          this.handleRotateTimeline(timeline as RotateTimeline);
        }
        if (
          [
            "_TranslateTimeline",
            "TranslateTimeline",
            "_ScaleTimeline",
            "ScaleTimeline",
            "_ShearTimeline",
            "ShearTimeline",
          ].some((item) => timelineConstructorName.includes(item))
        ) {
          this.handleTranslateScaleShearTimeline(
            timeline as TranslateTimeline,
            timelineConstructorName
          );
        }
        if (
          ["_IkConstraintTimeline", "IkConstraintTimeline"].some((item) =>
            timelineConstructorName.includes(item)
          )
        ) {
          this.handleIkContraintTimeline(timeline as IkConstraintTimeline);
        }
        if (
          ["_TransformConstraintTimeline", "TransformConstraintTimeline"].some(
            (item) => timelineConstructorName.includes(item)
          )
        ) {
          this.handleTransformConstraintTimeline(
            timeline as TransformConstraintTimeline
          );
        }
        if (
          ["_PathConstraintMixTimeline", "PathConstraintMixTimeline"].some(
            (item) => timelineConstructorName.includes(item)
          )
        ) {
          this.handlePathConstraintMixTimeline(
            timeline as PathConstraintMixTimeline
          );
        }
        if (
          ["_DeformTimeline", "DeformTimeline"].some((item) =>
            timelineConstructorName.includes(item)
          )
        ) {
          this.handleDeformTimeline(timeline as DeformTimeline);
        }
        // TODO: Handle EventTimeline and DrawOrderTimeline
      });
    });
    return this.animData.getAnimations();
  }

  private createSkinAttributes(): SkinAttributes[] {
    const skinData = new SkinData();
    this.spine.skeleton.data.skins.map((skin) => {
      skinData.setSkin("default");
      const skinExtended = skin as ExtendedSkin;
      const skinAttachments = skinExtended.getAttachments();
      for (const skinAttachmentEntry of skinAttachments) {
        const skinEntry = skinAttachmentEntry;
        const attachment =
          skinEntry.attachment as unknown as SkinAttachmentParameters;
        switch (attachment.type) {
          case AttachmentType.Region: {
            skinData.addRegionAttachment(
              this.spine.skeleton.data.slots[skinEntry.slotIndex]?.name,
              skinEntry.name,
              {
                height: attachment.height ?? 0,
                width: attachment.width ?? 0,
                color: this.rgba8888ToColor(attachment.color!),
                name: attachment.name,
                path: attachment.path,
                rotation: attachment.rotation,
                scaleX: attachment.scaleX,
                scaleY: attachment.scaleY,
                type: "region",
                x: attachment.x,
                y: attachment.y,
              }
            );
            break;
          }
          case AttachmentType.BoundingBox: {
            skinData.addBoundingBoxAttachment(
              this.spine.skeleton.data.slots[skinEntry.slotIndex]?.name,
              skinEntry.name,
              {
                type: "boundingbox",
                vertexCount: attachment.worldVerticesLengtt! >> 1,
                vertices: attachment.cVertices,
                color: this.rgba8888ToColor(attachment.color!),
                name: attachment.name,
              }
            );
            break;
          }
          case AttachmentType.Mesh: {
            skinData.addMeshAttachment(
              this.spine.skeleton.data.slots[skinEntry.slotIndex]?.name,
              skinEntry.name,
              {
                type: "mesh",
                name: attachment.name,
                vertices: attachment.cVertices,
                uvs: attachment.uvs ?? Object.values(attachment.regionUVs!),
                hull: attachment.hullLength! >> 1,
                edges: attachment.edges,
                color: this.rgba8888ToColor(attachment.color!),
                triangles: attachment.triangles ?? [],
                height: attachment.height,
                path: attachment.path,
                width: attachment.width,
              }
            );
            break;
          }
          case AttachmentType.Clipping: {
            skinData.addClippingAttachment(
              this.spine.skeleton.data.slots[skinEntry.slotIndex]?.name,
              skinEntry.name,
              {
                type: "clipping",
                vertexCount: attachment.worldVerticesLengtt! >> 1,
                vertices: attachment.cVertices,
                name: attachment.name,
                end: attachment.endSlot.name,
              }
            );
            break;
          }
          case AttachmentType.LinkedMesh: {
            skinData.addLinkedMeshAttachment(
              this.spine.skeleton.data.slots[skinEntry.slotIndex]?.name,
              skinEntry.name,
              {
                parent: attachment.parent ?? "",
                type: "linkedmesh",
                color: this.rgba8888ToColor(attachment.color!),
                deform: attachment.inheritDeform,
                name: attachment.name,
                height: attachment.height,
                path: attachment.path,
                skin: attachment.skinName,
                width: attachment.width,
              }
            );
            break;
          }
          case AttachmentType.Path: {
            skinData.addPathAttachment(
              this.spine.skeleton.data.slots[skinEntry.slotIndex]?.name,
              skinEntry.name,
              {
                type: "path",
                vertexCount: attachment.worldVerticesLengtt! >> 1,
                vertices: attachment.cVertices,
                closed: attachment.closed,
                color: this.rgba8888ToColor(attachment.color!),
                constantSpeed: attachment.constantSpeed,
                lengths: attachment.lengths,
                name: attachment.name,
              }
            );
            break;
          }
          case AttachmentType.Point: {
            skinData.addPointAttachment(
              this.spine.skeleton.data.slots[skinEntry.slotIndex]?.name,
              skinEntry.name,
              {
                type: "point",
                name: attachment.name,
                rotation: attachment.rotation,
                color: this.rgba8888ToColor(attachment.color!),
                x: attachment.x,
                y: attachment.y,
              }
            );
            break;
          }
        }
      }
    });
    return skinData.getSkins();
  }
  private handleSlotColorKeyframe(timeline: ColorTimeline) {
    const mergedData = this.mergeTimelineData(
      timeline.data,
      timeline.curveData
    );
    this.animData.addSlotColorTimeline(
      this.spine.skeleton.data.slots[timeline.slotIndex]!.name,
      mergedData.map((data) => this.createColorKeyFrame(data))
    );
  }

  private handleSlotAttachmentKeyframe(
    slotAttachmentTimeline: AttachmentTimeline
  ) {
    this.animData.addSlotAttachmentTimeline(
      this.spine.skeleton.data.slots[slotAttachmentTimeline.slotIndex]!.name,
      slotAttachmentTimeline.data.map((slot) => ({
        time: slot.time,
        name: slot.attachmentName,
      }))
    );
  }

  private handleRotateTimeline(timeline: RotateTimeline) {
    const mergedData = this.mergeTimelineData(
      timeline.data,
      timeline.curveData
    );
    this.animData.addBoneRotateTimeline(
      this.spine.skeleton.data.bones[timeline.boneIndex]?.name,
      mergedData.map((data) => this.createKeyFrameWithAngle(data))
    );
  }

  private handleTranslateScaleShearTimeline(
    timeline: TranslateTimeline | ScaleTimeline | ShearTimeline,
    timelineConstructorName: string
  ) {
    if (
      ["_TranslateTimeline", "TranslateTimeline"].some((item) =>
        timelineConstructorName.includes(item)
      )
    ) {
      this.animData.addBoneTranslateTimeline(
        this.spine.skeleton.data.bones[timeline.boneIndex]?.name,
        (timeline as TranslateTimeline).data.map((data) =>
          this.createKeyFrameWithXY(data)
        )
      );
    }
    if (
      ["_ShearTimeline", "ShearTimeline"].some((item) =>
        timelineConstructorName.includes(item)
      )
    ) {
      this.animData.addBoneShearTimeline(
        this.spine.skeleton.data.bones[timeline.boneIndex]?.name,
        (timeline as ShearTimeline).data.map((data) =>
          this.createKeyFrameWithXY(data)
        )
      );
    }
    if (
      ["_ScaleTimeline" || "ScaleTimeline"].some((item) =>
        timelineConstructorName.includes(item)
      )
    ) {
      this.animData.addBoneScaleTimeline(
        this.spine.skeleton.data.bones[timeline.boneIndex]?.name,
        (timeline as ScaleTimeline).data.map((data) =>
          this.createKeyFrameWithXY(data)
        )
      );
    }
  }

  private handleIkContraintTimeline(timeline: IkConstraintTimeline) {
    this.animData.addIKConstraintTimeline(
      this.spine.skeleton.data.ikConstraints[timeline.ikConstraintIndex]!.name,
      timeline.data.map((keyframe) => ({
        time: keyframe.time,
        bendPositive: keyframe.bendDirection > 0,
        mix: keyframe.mix,
      }))
    );
  }
  private handleTransformConstraintTimeline(
    timeline: TransformConstraintTimeline
  ) {
    this.animData.addTransformConstraintTimeline(
      this.spine.skeleton.data.transformConstraints[
        timeline.transformConstraintIndex
      ]!.name,
      timeline.data.map((keyframe) => ({
        time: keyframe.time,
        rotateMix: keyframe.rotateMix,
        translateMix: keyframe.translateMix,
        scaleMix: keyframe.scaleMix,
        shearMix: keyframe.shearMix,
      }))
    );
  }
  private handlePathConstraintMixTimeline(timeline: PathConstraintMixTimeline) {
    this.animData.addPathConstraintTimeline(
      this.spine.skeleton.data.pathConstraints[timeline.pathConstraintIndex]!
        .name,
      timeline.data.map((keyframe) => ({
        time: keyframe.time,
        rotateMix: keyframe.rotateMix,
        translateMix: keyframe.translateMix,
      }))
    );
  }
  private handleDeformTimeline(timeline: DeformTimeline) {
    const mergedData = this.mergeTimelineData(
      timeline.data,
      timeline.curveData
    );
    this.animData.addDeformTimeline(
      timeline.data[0]!.skin,
      this.spine.skeleton.data.slots[timeline.slotIndex]!.name,
      timeline.attachment.name,
      mergedData.map((data) => this.createKeyWithOffset(data))
    );
  }
  private mergeTimelineData<
    T extends { frameIndex: number },
    U extends { frameIndex: number },
  >(
    data: T[],
    curveData: U[]
  ): (T & {
    frameIndex?: number | undefined;
  })[] {
    return data.map((item1) => {
      const item2 = curveData.find(
        (item) => item.frameIndex === item1.frameIndex
      );
      return { ...item1, ...item2 };
    });
  }

  private createKeyFrameWithAngle(data: any): KeyFrameWithAngle {
    const curveType = data.curveType === 1 ? "stepped" : "other";
    return curveType === "stepped"
      ? {
          time: data.time,
          angle: data.degrees,
          curve: "stepped",
        }
      : data.cx1
      ? {
          time: data.time,
          angle: data.degrees,
          curve: data.cx1,
          c2: data.cy1,
          c3: data.cx2,
          c4: data.cy2,
        }
      : {
          time: data.time,
          angle: data.degrees,
        };
  }
  private createKeyFrameWithXY(data: any): KeyFrameWithXY {
    const curveType = data.curveType === 1 ? "stepped" : "other";
    return curveType === "stepped"
      ? {
          time: data.time,
          x: data.x,
          y: data.y,
          curve: "stepped",
        }
      : data.cx1
      ? {
          time: data.time,
          x: data.x,
          y: data.y,
          curve: data.cx1,
          c2: data.cy1,
          c3: data.cx2,
          c4: data.cy2,
        }
      : {
          time: data.time,
          x: data.x,
          y: data.y,
        };
  }
  private createColorKeyFrame(data: any): KeyFrameWithColor {
    const curveType = data.curveType === 1 ? "stepped" : "other";
    return curveType === "stepped"
      ? {
          time: data.time,
          color: this.rgba8888ToColor({
            r: data.r,
            g: data.g,
            b: data.b,
            a: data.a,
          }),
          curve: "stepped",
        }
      : data.cx1
      ? {
          time: data.time,
          color: this.rgba8888ToColor({
            r: data.r,
            g: data.g,
            b: data.b,
            a: data.a,
          }),
          curve: data.cx1,
          c2: data.cy1,
          c3: data.cx2,
          c4: data.cy2,
        }
      : {
          time: data.time,
          color: this.rgba8888ToColor({
            r: data.r,
            g: data.g,
            b: data.b,
            a: data.a,
          }),
        };
  }
  private createKeyWithOffset(data: any): KeyFrameWithOffset {
    const curveType = data.curveType === 1 ? "stepped" : "other";
    return curveType === "stepped"
      ? {
          time: data.time,
          vertices: Object.values(data.vertices) ?? [],
          curve: "stepped",
        }
      : data.cx1
      ? {
          time: data.time,
          vertices: Object.values(data.vertices),
          curve: "stepped",
          c2: data.cy1,
          c3: data.cx2,
          c4: data.cy2,
        }
      : {
          time: data.time,
          vertices: Object.values(data.vertices),
        };
  }
}
function removeEmpty(obj: any): any {
  if (Array.isArray(obj)) {
    // Remove empty arrays
    return obj.filter((item: any) => {
      if (typeof item === "object") {
        const result = removeEmpty(item);
        return Object.keys(result).length !== 0;
      }
      return true;
    });
  } else if (typeof obj === "object" && obj !== null) {
    // Remove empty objects
    const result: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (typeof value === "object" && value !== null) {
          const subObj = removeEmpty(value);
          if (Object.keys(subObj).length !== 0) {
            result[key] = subObj;
          }
        } else {
          result[key] = value;
        }
      }
    }
    return result;
  }
  return obj;
}
