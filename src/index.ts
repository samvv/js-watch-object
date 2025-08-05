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
export function watch<T>(value: T, {
  onChange,
  path = [],
  types = defaultTypes,
}: TracedOptions): T {

  function wrap(value: any, path: PropertyKey[]) {

    // One context per unique path and callback
    const ctx = { notify: onChange, path };

    function wrapForSpecialType(value: any, type: Newable) {

      // Get the list of methods that are defined within the class
      const proto = type.prototype;

      return new Proxy(value, {
        get(target, p, receiver) {
          if (Object.prototype.hasOwnProperty.call(proto, p)) {
            let member = proto[p];
            if (typeof(member) === 'function') {
              member = member.bind(assignWithProxy(value, traceContextSymbol, ctx));
            }
            return member;
          }
          return wrap(Reflect.get(target, p, receiver), [ ...path, p ]);
        },
      });
    }

    return new Proxy(value, {
      get(target, p, receiver) {
        let value = Reflect.get(target, p, receiver)
        if (isPrimitive(value)) {
          return value;
        }
        for (const type of types) {
          if (value.constructor === Object.getPrototypeOf(type)) {
            return wrapForSpecialType(value, type);
          }
        }
        return wrap(value, [...path, p]);
      },
      set(target, p, newValue, receiver) {
        if (Reflect.has(target, p)) {
          onChange({ type: 'set-property', key: p, value: newValue, path });
        } else {
          onChange({ type: 'create-property', key: p, value: newValue, path });
        }
        return Reflect.set(target, p, newValue, receiver);
      },
      deleteProperty(target, p) {
        onChange({ type: 'delete-property', key: p, path });
        return Reflect.deleteProperty(target, p);
      },
    });
  }

  return wrap(value, path);
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
