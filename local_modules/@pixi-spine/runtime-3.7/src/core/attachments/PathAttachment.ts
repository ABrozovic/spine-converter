import { AttachmentType, Color } from "@pixi-spine/base";

import { VertexAttachment } from "./Attachment";

/**
 * @public
 */
export class PathAttachment extends VertexAttachment {
  type = AttachmentType.Path;
  lengths: Array<number>;
  closed = false;
  constantSpeed = false;
  color = new Color(1, 1, 1, 1);

  constructor(name: string) {
    super(name);
  }
}
