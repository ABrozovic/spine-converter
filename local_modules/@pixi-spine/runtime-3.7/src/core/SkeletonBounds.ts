import { SkeletonBoundsBase } from "@pixi-spine/base";

import { BoundingBoxAttachment } from "./attachments";

/** Collects each visible {@link BoundingBoxAttachment} and computes the world vertices for its polygon. The polygon vertices are
 * provided along with convenience methods for doing hit detection.
 * @public
 * */
export class SkeletonBounds extends SkeletonBoundsBase<BoundingBoxAttachment> {}
