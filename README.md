# Observatory (WIP, don't use)

Observatory is a wrapper around [monocle-ts](https://gcanti.github.io/monocle-ts/) that is designed to make it easier to use.

# Warning

This is really just a playground to try to understand how good of an idea it is. Please don't try to use it. Even if you do it won't work. Thanks.

# Motivation

Imagine you have a person with some bad tweets:

```TypeScript
type Person = {
  username: string;
  tweets: Tweet[];
};

type Tweet = {
  text: string;
  id: number;
};


const person: Person = {
  username: "Tony",
  tweets: [
    { text: "bitcoin is a good investment actually", id: 1 },
    { text: "something else bad", id: 2 },
  ],
};
```

But one of the tweets is so bad that it needs to be found and censored. If we want to do this immutably it can end up being fairly verbose:

```TypeScript
const censorTweet = (person: Person, tweetId: number, newText: string)  => {
  return {
    ...person,
    tweets: person.tweets.map(t => {
      return t.id === tweetId ? { ...t, text: newText } : t;
    })
  }
}

const newTweet = censorTweet(person, 1, "throw your money in the sea");
```

While this code successfully improves the standard of financial advice on our toy social media site it's arguably a bit unweildy. Optics libraries like `monocle-ts` are meant to make this sort of thing a bit more concise, or at least more composable:

```TypeScript
import { Lens, fromTraversable } from "monocle-ts";
import { array } from "fp-ts/lib/Array";

const censorTweet = (person: Person, tweetId: number, newText: string)  =>
  Lens.fromProp<Person>()("tweets")
    .composeTraversal(fromTraversable(array)<Tweet>())
    .filter((t) => t.id === tweetId)
    .composeLens(Lens.fromProp<Tweet>()("text"))
    .modify(() => newText)(person)


const newTweet = censorTweet(person, 1, "throw your money in the sea");
```

Optics are very powerful and composable, but at worst this can be less concise, and less readable; and at best it can be confusing to know what to put where.

With proxy violence and liberal use of `any` under the bonnet I've slapped a layer on top of all of this in an attempt to make our censorship function more friendly to read and write:

```TypeScript
import { Optic } from "observatory";


const censorTweet = (person: Person, tweetId: number, newText: string)  =>
  Optic<Person>()
    .tweets.__filter(t => t.id === tweetId)
    .text.__setTo(newText)(person)

const newTweet = censorTweet(person, 1, "throw your money in the sea");
```

Better still, once `Optic` knows the type of the object you're modifying you're pretty much off to the races. You Can lazily tab your way through your censorship function logic with code completion, as demonstrated by the gif below:

[GIF below]
