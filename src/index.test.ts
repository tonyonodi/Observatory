import { Optic } from "./index";
type Address = {
  number: number;
  street: string;
  city: string;
};

type Person = {
  first_name: string;
  surname: string;
  address: Address;
};

const person: Person = {
  first_name: "Tony",
  surname: "Onodi",
  address: {
    number: 1,
    street: "Glentrammon Road",
    city: "London",
  },
};

it("should be able to get a nested value", () => {
  expect(Optic<Person>().address.number.__getFrom(person)).toEqual(1);
});

it("should be able to set a nested value", () => {
  expect(Optic<Person>().address.number.__setTo(10)).toEqual({
  first_name: "Tony",
  surname: "Onodi",
  address: {
    number: 10,
    street: "Glentrammon Road",
    city: "London",
  },
});
});
