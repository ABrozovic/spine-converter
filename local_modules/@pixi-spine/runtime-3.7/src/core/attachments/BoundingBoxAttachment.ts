import { AttachmentType, Color } from "@pixi-spine/base";

import { VertexAttachment } from "./Attachment";

/**
 * @public
 */
export class BoundingBoxAttachment extends VertexAttachment {
  type = AttachmentType.BoundingBox;
  color = new Color(1, 1, 1, 1);

  constructor(name: string) {
    super(name);
  }
}
