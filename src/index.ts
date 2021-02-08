import { Lens, fromTraversable } from "monocle-ts";
import { array } from "fp-ts/lib/Array";

const trav = fromTraversable(array)<Person>();

const blah = trav
  .composeLens(Lens.fromProp<Person>()("first_name"))
  .set("blah")([person]);
// Optic<Person[]>().__each().first_name.__setWith(capitalise)

type Optic<A, B> = {
  __getFrom: (a: A) => B;
  __setTo: (a: B) => (a: A) => B;
};

interface OpticProxyConstructor<Source extends Object, Dest extends Object> {
  new (
    target: {},
    handler: {
      get: <Key extends keyof Dest>(target: {}, k: Key) => number;
    }
  ): {
    [Key in keyof Dest]: Optic<Source, Dest[Key]> &
      (Dest[Key] extends object
        ? InstanceType<OpticProxyConstructor<Source, Dest[Key]>>
        : {});
  };
}

export const Optic = <T extends object>() => {
  const OpticProxy = Proxy as OpticProxyConstructor<T, T>;

  return new OpticProxy({}, {
    get: function <K extends keyof T>(target: any, prop: any) {
      const oldPath = target.path || [];
      const path = [...oldPath, prop];

      if (prop === "__getFrom") {
        return Lens.fromPath<T>()(target.path).get;
      } else if (prop === "__setTo") {
        return Lens.fromPath<T>()(target.path).set;
      } else {
        return new Proxy({ path }, this);
      }
    },
  } as any);
};
