import { Lens, fromTraversable, Traversal } from "monocle-ts";
import * as L from "monocle-ts/lib/Lens";
import * as T from "monocle-ts/lib/Traversal";
import { array } from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";

type ArrayOptic<A, B> = {
  __each: InstanceType<OpticProxyConstructor<A, B>> & {
    __getFrom: (a: A) => B;
    __setTo: (a: B) => (a: A) => B;
    __setWith: (f: (b: B) => B) => (a: A) => A;
  };
  __filter: (
    predicate: (b: B) => boolean
  ) => InstanceType<OpticProxyConstructor<A, B>> & {
    __getFrom: (a: A) => B;
    __setTo: (a: B) => (a: A) => B;
    __setWith: (f: (b: B) => B) => (a: A) => A;
  };
};

type Optic<A, B> = {
  __getFrom: (a: A) => B;
  __setTo: (a: B) => (a: A) => A;
};

interface OpticProxyConstructor<Source extends Object, Dest extends Object> {
  new (
    target: {},
    handler: {
      get: <Key extends keyof Dest>(target: {}, k: Key) => unknown; // Seriously, idk what to put here
    }
  ): Dest extends Array<infer I>
    ? ArrayOptic<Source, I>
    : {
        [Key in keyof Dest]: Optic<Source, Dest[Key]> &
          (Dest[Key] extends object
            ? InstanceType<OpticProxyConstructor<Source, Dest[Key]>>
            : {});
      };
}

const arrayTraversal = T.fromTraversable(array)<string>();

export const Access = <T extends object>() => {
  const OpticProxy = Proxy as OpticProxyConstructor<T, T>;

  return new OpticProxy({}, {
    get: function <S, K extends keyof T>(
      target: { optic?: Lens<S, T> | Traversal<S, T> },
      prop: K
    ) {
      switch (target.optic?._tag) {
        case "Lens":
          const lens = target.optic;

          if (prop === "__getFrom") {
            return lens.get;
          } else if (prop === "__setTo") {
            return lens.set;
          } else if (prop === "__each") {
            return new OpticProxy(
              {
                optic: lens.composeTraversal(
                  fromTraversable(array)<T>() as any
                ),
              },
              this
            );
          } else if (prop === "__filter") {
            return (predicate: (t: T) => boolean) => {
              const optic = lens
                .composeTraversal(fromTraversable(array)<T>() as any)
                .filter(predicate as any);
              return new OpticProxy(
                {
                  optic,
                },
                this
              );
            };
          } else {
            const newLens = lens.composeLens(Lens.fromProp<T>()(prop));
            return new OpticProxy({ optic: newLens }, this);
          }

        case "Traversal":
          const traversal = target.optic;
          if (prop === "__getFrom") {
            return traversal.asFold().getAll;
          } else if (prop === "__setTo") {
            // Just returning traversal.set causes a very strange bug where the traversal
            // is treated by monocle internals as if it's a proxy
            return (t: T) => traversal.asSetter().set(t);
          } else if (prop === "__setWith") {
            // Just returning traversal.modify causes a very strange bug where the traversal
            // is treated by monocle internals as if it's a proxy
            return (f: (t: T) => T) => {
              return traversal.modify(f);
            };
          } else {
            const newOptic = traversal.composeLens(Lens.fromProp<T>()(prop));
            return new OpticProxy({ optic: newOptic }, this);
          }

        case undefined:
          const _idLens = L.id<T>(); //as Lens<S, T>;
          const idLens = new Lens(_idLens.get, _idLens.set);
          return new OpticProxy(
            { optic: idLens.composeLens(Lens.fromProp<T>()(prop)) },
            this
          );
      }
    },
  } as any);
};
