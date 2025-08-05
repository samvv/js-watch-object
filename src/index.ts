import { traceContextSymbol } from "./constants.js";
import { type Delta } from "./delta.js";
import TracedArray from "./types/Array.js";
import { assignWithProxy, type Newable } from "./util.js";

export {
  TracedArray,
};

type TraceFn = (delta: Delta) => void;

export interface Context {
  path: PropertyKey[];
  notify: TraceFn;
}

const defaultTypes: Newable[] = [ TracedArray ];

export type TracedOptions = {
  onChange: TraceFn;
  path?: PropertyKey[];
  types?: Newable[];
};
export function watch<T>(obj: T, {
  onChange,
  path = [],
  types = defaultTypes,
}: TracedOptions): T {

  function wrap(obj: any, path: PropertyKey[]) {

    return new Proxy(obj, {
      get(target, p, receiver) {
        let value = Reflect.get(target, p, receiver)
        if (isPrimitive(value)) {
          return value;
        }
        for (const type of types) {
          if (value.constructor === Object.getPrototypeOf(type)) {
            return wrapForSpecialType(value, type, [...path, p]);
          }
        }
        return wrap(value, [...path, p]);
      },
      set(target, p, newValue, receiver) {
        if (Reflect.has(target, p)) {
          onChange({ type: 'set', value: newValue, path: [...path, p ] });
        } else {
          onChange({ type: 'create', value: newValue, path: [...path, p ] });
        }
        return Reflect.set(target, p, newValue, receiver);
      },
      deleteProperty(target, p) {
        onChange({ type: 'delete', path: [...path, p] });
        return Reflect.deleteProperty(target, p);
      },
    });
  }

  function wrapForSpecialType(obj: any, type: Newable, path: PropertyKey[]) {

    // One context per unique path and callback
    const ctx = { notify: onChange, path };

    // Get the list of methods that are defined within the class
    const proto = type.prototype;

    return new Proxy(obj, {
      get(target, p, receiver) {
        if (Object.prototype.hasOwnProperty.call(proto, p)) {
          let member = proto[p];
          if (typeof(member) === 'function') {
            member = member.bind(assignWithProxy(obj, traceContextSymbol, ctx));
          }
          return member;
        }
        const value = Reflect.get(target, p, receiver);
        if (isPrimitive(value)) {
          return value;
        }
        return wrap(value, [ ...path, p ]);
      },
    });
  }

  return wrap(obj, path);
}

function isPrimitive(value: any): boolean {
  return typeof(value) === 'string'
      || typeof(value) === 'boolean'
      || typeof(value) === 'number'
      || typeof(value) === 'bigint'
      || typeof(value) === 'undefined'
      || value === null;
}

export default watch;
