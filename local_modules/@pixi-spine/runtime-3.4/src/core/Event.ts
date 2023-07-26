import type { IEvent } from "@pixi-spine/base";

import type { EventData } from "./EventData";

/**
 * @public
 */
export class Event implements IEvent {
  data: EventData;
  intValue: number;
  floatValue: number;
  stringValue: string;
  time: number;
  volume: number;
  balance: number;

  constructor(time: number, data: EventData) {
    if (data == null) throw new Error("data cannot be null.");
    this.time = time;
    this.data = data;
  }
}
