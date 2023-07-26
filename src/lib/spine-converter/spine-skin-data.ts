import { type AttachmentType, type ISlotData } from "@pixi-spine/base";

export type SkinAttachmentParameters = {
  name?: string;
  rotation?: number;
  x?: number;
  y?: number;
  scaleX?: number;
  scaleY?: number;
  width?: number;
  height?: number;
  worldVerticesLengtt?: number;
  regionUVs?: number[];
  endSlot: ISlotData;
  color?: { r: number; g: number; b: number; a: number };
  path?: string;
  cVertices: number[];
  vertices?: WeightedVertex;
  bones?: number[];
  triangles?: number[];
  hullLength?: number;
  edges?: number[];
  uvs?: number[];
  skinName?: string;
  parent?: string;
  inheritDeform?: boolean;
  closed?: boolean;
  constantSpeed?: boolean;
  lengths?: number[];
  type?: AttachmentType;
};

export type RegionAttachment = {
  name?: string;
  type?: "region";
  path?: string;
  x?: number;
  y?: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
  width: number;
  height: number;
  color?: string;
};

export type MeshAttachment = {
  name?: string;
  type: "mesh";
  path?: string;
  uvs: number[];
  triangles: number[];
  vertices: number[] | WeightedVertex[];
  hull?: number;
  edges?: number[];
  color?: string;
  width?: number;
  height?: number;
};

export type LinkedMeshAttachment = {
  name?: string;
  type: "linkedmesh";
  path?: string;
  skin?: string;
  parent: string;
  deform?: boolean;
  color?: string;
  width?: number;
  height?: number;
};

export type BoundingBoxAttachment = {
  name?: string;
  type: "boundingbox";
  vertexCount: number;
  vertices: number[] | WeightedVertex[];
  color?: string;
};

export type PathAttachment = {
  name?: string;
  type: "path";
  closed?: boolean;
  constantSpeed?: boolean;
  lengths?: number[];
  vertexCount: number;
  vertices: number[] | WeightedVertex[];
  color?: string;
};

export type PointAttachment = {
  name?: string;
  type: "point";
  x?: number;
  y?: number;
  rotation?: number;
  color?: string;
};

export type ClippingAttachment = {
  name?: string;
  type: "clipping";
  end: string;
  vertexCount: number;
  vertices: number[] | WeightedVertex[];
  color?: string;
};

export type WeightedVertex = {
  bones: number[];
  vertices: number[];
};

export type AttachmentMap = Record<
  string,
  | RegionAttachment
  | MeshAttachment
  | LinkedMeshAttachment
  | BoundingBoxAttachment
  | PathAttachment
  | PointAttachment
  | ClippingAttachment
>;

export type SlotAttachments = Record<string, AttachmentMap>;

export type SkinAttributes = {
  name: string;
  attachments: SlotAttachments;
};

export class SkinData {
  private defaultSkin: SkinAttributes = { name: "default", attachments: {} };
  private activeSkin: SkinAttributes;
  private skins: SkinAttributes[];

  constructor(skins: SkinAttributes[] = []) {
    this.skins = skins;
    this.activeSkin = this.defaultSkin;
  }
  getSkins() {
    return this.skins;
  }

  addSkin(skinName: string): void {
    this.skins.push({ name: skinName, attachments: {} });
    this.setSkin(skinName);
  }

  setSkin(skinName: string): void {
    const skin = this.findSkin(skinName);
    if (skin) {
      this.activeSkin = skin;
    } else {
      this.addSkin(skinName);
    }
  }

  private findSkin(skinName: string): SkinAttributes | undefined {
    return this.skins.find((skin) => skin.name === skinName);
  }

  addRegionAttachment(
    slotName: string,
    attachmentName: string,
    attachment: RegionAttachment
  ): void {
    const slotAttachments = this.activeSkin.attachments[slotName] || {};
    slotAttachments[attachmentName] = attachment;
    this.activeSkin.attachments[slotName] = slotAttachments;
  }

  addMeshAttachment(
    slotName: string,
    attachmentName: string,
    attachment: MeshAttachment
  ): void {
    const slotAttachments = this.activeSkin.attachments[slotName] || {};
    slotAttachments[attachmentName] = attachment;
    this.activeSkin.attachments[slotName] = slotAttachments;
  }

  addLinkedMeshAttachment(
    slotName: string,
    attachmentName: string,
    attachment: LinkedMeshAttachment
  ): void {
    const slotAttachments = this.activeSkin.attachments[slotName] || {};
    slotAttachments[attachmentName] = attachment;
    this.activeSkin.attachments[slotName] = slotAttachments;
  }

  addBoundingBoxAttachment(
    slotName: string,
    attachmentName: string,
    attachment: BoundingBoxAttachment
  ): void {
    const slotAttachments = this.activeSkin.attachments[slotName] || {};
    slotAttachments[attachmentName] = attachment;
    this.activeSkin.attachments[slotName] = slotAttachments;
  }

  addPathAttachment(
    slotName: string,
    attachmentName: string,
    attachment: PathAttachment
  ): void {
    const slotAttachments = this.activeSkin.attachments[slotName] || {};
    slotAttachments[attachmentName] = attachment;
    this.activeSkin.attachments[slotName] = slotAttachments;
  }

  addPointAttachment(
    slotName: string,
    attachmentName: string,
    attachment: PointAttachment
  ): void {
    const slotAttachments = this.activeSkin.attachments[slotName] || {};
    slotAttachments[attachmentName] = attachment;
    this.activeSkin.attachments[slotName] = slotAttachments;
  }

  addClippingAttachment(
    slotName: string,
    attachmentName: string,
    attachment: ClippingAttachment
  ): void {
    const slotAttachments = this.activeSkin.attachments[slotName] || {};
    slotAttachments[attachmentName] = attachment;
    this.activeSkin.attachments[slotName] = slotAttachments;
  }

  getAttachment(
    slotName: string,
    attachmentName: string
  ):
    | RegionAttachment
    | MeshAttachment
    | LinkedMeshAttachment
    | BoundingBoxAttachment
    | PathAttachment
    | PointAttachment
    | ClippingAttachment
    | undefined {
    const slotAttachments = this.activeSkin.attachments[slotName];
    if (slotAttachments) {
      return slotAttachments[attachmentName];
    }
    return undefined;
  }
}
