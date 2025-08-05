
/**
 * The type of class types, optionally parametrised by their instance.
 */
export type Newable<T = any> = { new (...args: any[]): T };

/**
 * Immutable assignment without cloning.
 *
 * This function uses a Proxy to semantically make it like the object
 * has been cloned, while at the same time passing through any other
 * operations to the parent object.
 */
export function assignWithProxy<T extends object, K extends keyof T>(obj: T, key: K, value: T[K]) {
  return new Proxy(obj, {
    get(target, p, receiver) {
      return p === key ? value : Reflect.get(target, p, receiver);
    },
  });
}

