import { Access } from "./index";

// Messing about
import { Lens, fromTraversable } from "monocle-ts";
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
  tweets: Tweet[];
};

const person: Person = {
  first_name: "Tony",
  surname: "Onodi",
  address: {
    number: 1,
    street: "Glentrammon Road",
    city: "London",
  },
  tweets: [
    { text: "blah", id: 1 },
    { text: "blah 2", id: 2 },
  ],
};

type Tweet = {
  text: string;
  id: number;
};

const _Person = Access<Person>();
const _Tweet = Access<Tweet>();

// More messsing about
// const p = L.id<Person>();
// const ad = L.prop<Person, "address">("address");
// const pt = L.prop<Person, "tweets">("tweets");
// const st = L.prop<Address, "street">("street");
// const _fn: L.Lens<Person, string> = Lens.fromProp<Person>()("first_name");

// // var fromLens = function (lens) { return new Lens(lens.get, lens.set); };
// const l = new Lens(p.get, p.set);

// st(ad(p)).get(person);

// const arrayTraversal = fromTraversable(array)<string>();

// Optic<Person>().tweets.__each;

// const capitalise = (s: string) => s.toUpperCase();

// const pets = Lens.fromProp<Person>()("tweets");

// it("quick test", () => {
//   const optic = l
//     .composeLens(Lens.fromProp<Person>()("tweets"))
//     .composeTraversal(fromTraversable(array)<Tweet>())
//     .composeLens(Lens.fromProp<Tweet>()("text"));

//   expect(optic.asFold().getAll(person)).toEqual(["blah", "blah 2"]);
// });

// const trav = fromTraversable(array)<Person>();
// const mytrav = T.id<string>();

// const blah = trav
//   .composeLens(Lens.fromProp<Person>()("first_name"))
//   .set("blah")([person]);

it("should be able to get a prop value", () => {
  expect(Access<Person>().first_name.__getFrom(person)).toEqual("Tony");
});

it("should be able to get an array from a value", () => {
  expect(Access<Person>().tweets.__getFrom(person)).toEqual(person.tweets);
});

it("should be able to get a nested value", () => {
  expect(Access<Person>().address.number.__getFrom(person)).toEqual(1);
});

it("should be able to get props from an array", () => {
  expect(Access<Person>().tweets.__each.text.__getFrom(person)).toEqual([
    "blah",
    "blah 2",
  ]);
});

const capitalise = (s: string) => s.toUpperCase();

const updateFirstTweet = (t: Tweet) =>
  t.id === 1 ? { ...t, text: "updated" } : t;

const _l = L.id<Person>();
const l = new Lens(_l.get, _l.set);
const updatedPerson = l
  .composeLens(Lens.fromProp<Person>()("tweets"))
  .composeTraversal(fromTraversable(array)<Tweet>())
  .filter((t) => t.id === 1);

// _Person.tweets.__filter((t) => t.id === 1).text.__getFrom(person);

// it("quick", () => {
//   expect(updatedPerson).toEqual({
//     ...person,
//     tweets: [
//       { text: "updated", id: 1 },
//       { text: "blah 2", id: 2 },
//     ],
//   });
// });

it("should be able to modify values in an array", () => {
  expect(
    Access<Person>().tweets.__each.__setWith(updateFirstTweet)(person)
  ).toEqual({
    ...person,
    tweets: [
      { text: "updated", id: 1 },
      { text: "blah 2", id: 2 },
    ],
  });
});

it("should be able to filter an array and get a value from it", () => {
  expect(
    _Person.tweets.__filter((t) => t.id === 1).text.__getFrom(person)
  ).toEqual(["blah"]);
});

it("should be able to filter an array and modify a value", () => {
  expect(
    _Person.tweets.__filter((t) => t.id === 1).text.__setTo("updated")(person)
  ).toEqual({
    ...person,
    tweets: [
      { text: "updated", id: 1 },
      { text: "blah 2", id: 2 },
    ],
  });
});

it("should be able to set a nested value", () => {
  expect(Access<Person>().address.number.__setTo(11)(person)).toEqual({
    first_name: "Tony",
    surname: "Onodi",
    address: {
      number: 11,
      street: "Glentrammon Road",
      city: "London",
    },
    tweets: person.tweets,
  });
});
