type KeyFrame = {
  time?: number;
  curve?: number[] | string;
  c1?: number;
  c2?: number;
  c3?: number;
  c4?: number;
};
type BoneTimelineType = {
  rotate: KeyFrame[];
  translate: KeyFrame[];
  shear: KeyFrame[];
  scale: KeyFrame[];
};
type SlotTimelineType = {
  attachment: KeyFrame[];
  color?: KeyFrame[];
};

export type KeyFrameWithAngle = KeyFrame & {
  angle?: number;
};

export type KeyFrameWithXY = KeyFrame & {
  x?: number;
  y?: number;
};

export type KeyFrameWithMix = KeyFrame & {
  mix?: number;
  softness?: number;
  bendPositive?: boolean;
  compress?: boolean;
  stretch?: boolean;
};

export type KeyFrameWithOffset = KeyFrame & {
  offset?: number;
  vertices?: number[];
};

export type KeyFrameWithName = KeyFrame & {
  name?: string;
};

export type KeyFrameWithColor = KeyFrame & {
  color?: string;
};

export type KeyFrameWithEvent = KeyFrame & {
  int?: number;
  float?: number;
  string?: string;
  volume?: number;
  balance?: number;
};

type DrawOrderOffset = {
  slot: string;
  offset: number;
};

export type KeyFrameWithDrawOrder = KeyFrame & {
  offsets?: DrawOrderOffset[];
};

type Timeline<T extends KeyFrame> = Record<string, T[]>;

type DeformTimeline = Record<string, KeyFrameWithOffset[]>;

export type KeyFrameData = {
  bones: Timeline<KeyFrameWithXY>;
  slots: Timeline<KeyFrameWithName | KeyFrameWithColor>;
  ik: Timeline<KeyFrameWithMix>;
  transform: Timeline<KeyFrameWithMix>;
  path: Timeline<KeyFrameWithMix>;
  deform: Record<string, Record<string, DeformTimeline>>;
  events: KeyFrameWithEvent[];
  drawOrder: KeyFrameWithDrawOrder[];
};

type Animation = {
  name?: string;
  frames?: KeyFrameData;
};

export class AnimationData {
  private activeAnimation: Animation = {};
  private animations: Animation[] = [];

  private initFrames() {
    if (!this.activeAnimation.frames) {
      this.activeAnimation.frames = {
        bones: {},
        slots: {},
        ik: {},
        transform: {},
        path: {},
        deform: {},
        events: [],
        drawOrder: [],
      };
    }
  }

  private addTimeline<T extends KeyFrame>(
    timelineType: keyof KeyFrameData,
    timelineName: string,
    keyframes: T[]
  ) {
    this.initFrames();

    const timeline = this.activeAnimation.frames![timelineType] as Timeline<T>;
    timeline[timelineName] = keyframes;
  }
  private addBoneTimeline(
    boneName: string,
    timelineType: keyof BoneTimelineType,
    keyframes: KeyFrame[]
  ) {
    this.initFrames();
    if (!this.activeAnimation.frames!.bones[boneName]) {
      this.activeAnimation.frames!.bones[boneName] = {
        rotate: [],
        translate: [],
        shear: [],
        scale: [],
      } as unknown as KeyFrameWithXY[];
    }
    (
      this.activeAnimation.frames!.bones[
        boneName
      ]! as unknown as Timeline<KeyFrameWithXY>
    )[timelineType] = keyframes;
  }
  private addSlotTimeline(
    slotName: string,
    timelineType: keyof SlotTimelineType,
    keyframes: KeyFrame[]
  ) {
    this.initFrames();
    if (!this.activeAnimation.frames!.slots[slotName]) {
      this.activeAnimation.frames!.slots[slotName] = {
        attachment: [],
        color: [],
      } as unknown as KeyFrameWithXY[];
    }
    (
      this.activeAnimation.frames!.slots[slotName]! as unknown as Timeline<
        KeyFrameWithName | KeyFrameWithColor
      >
    )[timelineType] = keyframes;
  }

  addAnimation(animationName: string): void {
    this.animations.push({ name: animationName });
    this.setAnimation(animationName);
  }

  setAnimation(animationName: string): void {
    const animation = this.findAnimation(animationName);
    if (animation) {
      this.activeAnimation = animation;
    } else {
      this.addAnimation(animationName);
    }
  }

  private findAnimation(animationName: string): Animation | undefined {
    return this.animations.find(
      (animation) => animation.name === animationName
    );
  }

  getAnimations(): Record<string, KeyFrameData> {
    const animationObject: Record<string, KeyFrameData> = {};
    for (const anim of this.animations) {
      if (anim.name && anim.frames) {
        animationObject[anim.name] = { ...anim.frames };
      }
    }
    return animationObject;
  }

  addSlotAttachmentTimeline(slotName: string, keyframes: KeyFrameWithName[]) {
    this.addSlotTimeline(slotName, "attachment", keyframes);
  }

  addSlotColorTimeline(slotName: string, keyframes: KeyFrameWithColor[]) {
    this.addSlotTimeline(slotName, "color", keyframes);
  }

  addBoneRotateTimeline(boneName: string, keyframes: KeyFrameWithAngle[]) {
    this.addBoneTimeline(boneName, "rotate", keyframes);
  }

  addBoneTranslateTimeline(boneName: string, keyframes: KeyFrameWithXY[]) {
    this.addBoneTimeline(boneName, "translate", keyframes);
  }

  addBoneScaleTimeline(boneName: string, keyframes: KeyFrameWithXY[]) {
    this.addBoneTimeline(boneName, "scale", keyframes);
  }

  addBoneShearTimeline(boneName: string, keyframes: KeyFrameWithXY[]) {
    this.addBoneTimeline(boneName, "shear", keyframes);
  }

  addIKConstraintTimeline(
    constraintName: string,
    keyframes: KeyFrameWithMix[]
  ) {
    this.addTimeline("ik", constraintName, keyframes);
  }

  addTransformConstraintTimeline(
    constraintName: string,
    keyframes: KeyFrameWithMix[]
  ) {
    this.addTimeline("transform", constraintName, keyframes);
  }

  addPathConstraintTimeline(
    constraintName: string,
    keyframes: KeyFrameWithMix[]
  ) {
    this.addTimeline("path", constraintName, keyframes);
  }

  addDeformTimeline(
    skinName: string,
    slotName: string,
    meshName: string,
    keyframes: KeyFrameWithOffset[]
  ) {
    this.initFrames();

    const deformTimeline = this.activeAnimation.frames!.deform;
    if (!deformTimeline[skinName]) {
      deformTimeline[skinName] = {};
    }

    const skinDeform = deformTimeline[skinName];
    if (!skinDeform[slotName]) {
      skinDeform[slotName] = {};
    }

    const slotDeform = skinDeform[slotName];
    slotDeform[meshName] = keyframes;
  }

  addEventKeyframe(eventKeyframe: KeyFrameWithEvent[]) {
    this.initFrames();
    this.activeAnimation.frames!.events = eventKeyframe;
  }

  addDrawOrderKeyframe(drawOrderKeyframe: KeyFrameWithDrawOrder[]) {
    this.initFrames();
    this.activeAnimation.frames!.drawOrder = drawOrderKeyframe;
  }
}
