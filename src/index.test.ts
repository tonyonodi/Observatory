import { Optic } from "./index";

// Messing about
import { Lens, fromTraversable, Traversal } from "monocle-ts";
import { array } from "fp-ts/lib/Array";
import * as L from "monocle-ts/lib/Lens";
import * as T from "monocle-ts/lib/Traversal";
import { pipe } from "fp-ts/lib/function";

// Not messing about
type Address = {
  number: number;
  street: string;
  city: string;
};

type Person = {
  first_name: string;
  surname: string;
  address: Address;
  pets: string[];
};

const person: Person = {
  first_name: "Tony",
  surname: "Onodi",
  address: {
    number: 1,
    street: "Glentrammon Road",
    city: "London",
  },
  pets: ["Fido", "Mittens"],
};

// More messsing about
const p = L.id<Person>();
const ad = L.prop<Person, "address">("address");
const pt = L.prop<Person, "pets">("pets");
const st = L.prop<Address, "street">("street");

st(ad(p)).get(person);

const arrayTraversal = T.fromTraversable(array)<string>();
// const piped = pipe(
//   // blah
//   p,
//   pets,
//   t
// );

// const x = pipe(p, ad, st);

const capitalise = (s: string) => s.toUpperCase();

const pets = Lens.fromProp<Person>()("pets");

// var fromTraversal = function (traversal) { return new Traversal(traversal.modifyF); };
// Lens.prototype.composeTraversal = function (ab) {
//   return fromTraversal(pipeable_1.pipe(this, lens.asTraversal, traversal.compose(ab)));
// };
// const test = ad.compose(Lens.fromProp<Address>()("street"));

const personToPets = new Traversal(
  pipe(pets, pets.asTraversal, T.compose(arrayTraversal)).modifyF
);

// pipe(personToPets, L.id<string>());

// const capitalised = personToPets.modify(capitalise)(person);

// console.log(capitalised);

const trav = fromTraversable(array)<Person>();

const blah = trav
  .composeLens(Lens.fromProp<Person>()("first_name"))
  .set("blah")([person]);

// Optic<Person[]>().__each().first_name.__setWith(capitalise)

it("should be able to get a prop value", () => {
  expect(Optic<Person>().first_name.__getFrom(person)).toEqual("Tony");
});

it("should be able to get a nested value", () => {
  expect(Optic<Person>().address.number.__getFrom(person)).toEqual(1);
});

it("should be able to set a nested value", () => {
  expect(Optic<Person>().address.number.__setTo(11)(person)).toEqual({
    first_name: "Tony",
    surname: "Onodi",
    address: {
      number: 11,
      street: "Glentrammon Road",
      city: "London",
    },
    pets: ["Fido", "Mittens"],
  });
});
