import { type Context } from "../index.js";
import { traceContextSymbol } from "../constants.js";

export type Insert = {
  path: PropertyKey[];
  type: 'insert';
  index: number;
  item: any;
};

export type Append = {
  path: PropertyKey[];
  type: 'append';
  item: any;
};

declare module "../delta.js" {
  interface DeltaTypes {
    'append': Append;
    'insert': Insert;
  }
}

export default class TracedArray extends Array {

  private [traceContextSymbol]!: Context;

  override splice(start: number, deleteCount?: number, ...rest: any[]): any[] {
    const ctx = this[traceContextSymbol];
    let index = start;
    for (; index < rest.length; index++) {
      ctx.notify({
        type: 'insert',
        index,
        item: rest[index],
        path: ctx.path,
      });
    }
    // @ts-ignore `deleteCount` contains `undefined` and TypeScript does not like this
    return Array.prototype.splice.call(this, start, deleteCount, ...rest);
  }

  override push(...items: any[]): number {
    const ctx = this[traceContextSymbol];
    for (const item of items) {
      ctx.notify({ type: 'append', item, path: ctx.path });
    }
    return Array.prototype.push.call(this, ...items);
  }

}

