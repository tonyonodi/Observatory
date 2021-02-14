import { Lens } from "monocle-ts";
import * as L from "monocle-ts/lib/Lens";
import * as T from "monocle-ts/lib/Traversal";
import { array } from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";

type Optic<A, B> = {
  __getFrom: (a: A) => B;
  __setTo: (a: B) => (a: A) => B;
} & (B extends Array<infer I>
  ? {
      __arrayStuff: (a: A) => B;
    }
  : {});

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

const arrayTraversal = T.fromTraversable(array)<string>();

export const impl1 = <T extends object>() => {
  const OpticProxy = Proxy as OpticProxyConstructor<T, T>;

  return new OpticProxy({}, {
    get: function <S, K extends keyof T>(
      target: { optic?: L.Lens<S, T> },
      prop: K
    ) {
      // HACK the T in this isn't really doing much!
      const optic = target.optic || (L.id() as L.Lens<T, T>);
      const propLens = L.prop<T, typeof prop>(prop);

      if (prop === "__getFrom") {
        return optic.get;
      } else if (prop === "__setTo") {
        return optic.set;
      } else {
        const newOptic = propLens(optic as any);
        return new OpticProxy({ optic: newOptic }, this);
      }
    },
  } as any);
};

export const impl2 = <T extends object>() => {
  const OpticProxy = Proxy as OpticProxyConstructor<T, T>;

  return new OpticProxy({}, {
    get: function <S, K extends keyof T>(
      target: { optic?: L.Lens<S, T> },
      prop: K
    ) {
      // HACK the T in this isn't really doing much!
      const _lens = target.optic || ((L.id<T>() as any) as L.Lens<S, T>);
      const lens = new Lens(_lens.get, _lens.set);

      if (prop === "__getFrom") {
        return lens.get;
      } else if (prop === "__setTo") {
        return lens.set;
      } else {
        const newOptic = lens.composeLens(Lens.fromProp<T>()(prop));
        return new OpticProxy({ optic: newOptic }, this);
      }
    },
  } as any);
};

export const Optic = <T extends object>() => {
  return impl1<T>();
};
