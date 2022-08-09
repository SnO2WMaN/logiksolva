import { assertEquals, assertThrows } from "std/testing/asserts.ts";
import { evalFormula, evalTableau as evalBranch, Tableau as Branch } from "./branch.ts";
import { PropFormula } from "./types.ts";

Deno.test("evalBranch:stack:P", () => {
  const actual = evalBranch({
    nodes: [],
    stack: [["PROP", "P"]],
    skip: [],
    props: {},
    junction: null,
    prev: [],
  });
  const expected: Branch = {
    nodes: [["PROP", "P"], ["TOP"]],
    stack: [],
    skip: [],
    props: { "P": { 1: true } },
    junction: null,
    prev: [],
  };
  assertEquals(actual, expected);
});
Deno.test("evalBranch:stack:¬P", () => {
  const actual = evalBranch({
    nodes: [],
    stack: [["NOT", ["PROP", "P"]]],
    skip: [],
    props: {},
    junction: null,
    prev: [],
  });
  const expected: Branch = {
    nodes: [["NOT", ["PROP", "P"]], ["TOP"]],
    stack: [],
    skip: [],
    props: { "P": { 0: true } },
    junction: null,
    prev: [],
  };
  assertEquals(actual, expected);
});
Deno.test("evalBranch:stack:⊤", () => {
  const actual = evalBranch({
    nodes: [],
    stack: [["TOP"]],
    skip: [],
    props: {},
    junction: null,
    prev: [],
  });
  const expected: Branch = {
    nodes: [["TOP"]],
    stack: [],
    skip: [],
    props: {},
    junction: null,
    prev: [],
  };
  assertEquals(actual, expected);
});
Deno.test("evalBranch:stack:⊥", () => {
  const actual = evalBranch({
    nodes: [],
    stack: [["BOT"]],
    skip: [],
    props: {},
    junction: null,
    prev: [],
  });
  const expected: Branch = {
    nodes: [["BOT"]],
    stack: [],
    skip: [],
    props: {},
    junction: null,
    prev: [],
  };
  assertEquals(actual, expected);
});
Deno.test("evalBranch:stack:¬⊤", () => {
  const actual = evalBranch({
    nodes: [],
    stack: [["NOT", ["TOP"]]],
    skip: [],
    props: {},
    junction: null,
    prev: [],
  });
  const expected: Branch = {
    nodes: [["NOT", ["TOP"]], ["BOT"]],
    stack: [],
    skip: [],
    props: {},
    junction: null,
    prev: [],
  };
  assertEquals(actual, expected);
});
Deno.test("evalBranch:stack:¬⊥", () => {
  const actual = evalBranch({
    nodes: [],
    stack: [["NOT", ["BOT"]]],
    skip: [],
    props: {},
    junction: null,
    prev: [],
  });
  const expected: Branch = {
    nodes: [["NOT", ["BOT"]], ["TOP"]],
    stack: [],
    skip: [],
    props: {},
    junction: null,
    prev: [],
  };
  assertEquals(actual, expected);
});
Deno.test("evalBranch:stack:¬¬P", () => {
  const actual = evalBranch({
    nodes: [],
    stack: [["NOT", ["NOT", ["PROP", "P"]]]],
    skip: [],
    props: {},
    junction: null,
    prev: [],
  });
  const expected: Branch = {
    nodes: [
      ["NOT", ["NOT", ["PROP", "P"]]],
      ["PROP", "P"],
      ["TOP"],
    ],
    stack: [],
    skip: [],
    props: { "P": { 1: true } },
    junction: null,
    prev: [],
  };
  assertEquals(actual, expected);
});
Deno.test("evalBranch:stack:P∧Q", () => {
  const actual = evalBranch({
    nodes: [],
    stack: [["AND", ["PROP", "P"], ["PROP", "Q"]]],
    skip: [],
    props: {},
    junction: null,
    prev: [],
  });
  const expected: Branch = {
    nodes: [
      ["AND", ["PROP", "P"], ["PROP", "Q"]],
      ["PROP", "P"],
      ["PROP", "Q"],
      ["TOP"],
    ],
    stack: [],
    skip: [],
    props: { "P": { 1: true }, "Q": { 1: true } },
    junction: null,
    prev: [],
  };
  assertEquals(actual, expected);
});
Deno.test("evalBranch:stack:P∨Q", () => {
  const actual = evalBranch({
    nodes: [],
    stack: [["OR", ["PROP", "P"], ["PROP", "Q"]]],
    skip: [],
    props: {},
    junction: null,
    prev: [],
  });
  const expected: Branch = {
    nodes: [["OR", ["PROP", "P"], ["PROP", "Q"]]],
    stack: [],
    skip: [],
    props: {},
    junction: [
      {
        nodes: [["PROP", "P"], ["TOP"]],
        stack: [],
        skip: [],
        props: { "P": { 1: true } },
        junction: null,
        prev: [],
      },
      {
        nodes: [["PROP", "Q"], ["TOP"]],
        stack: [],
        skip: [],
        props: { "Q": { 1: true } },
        junction: null,
        prev: [],
      },
    ],
    prev: [],
  };
  assertEquals(actual, expected);
});
Deno.test("evalBranch:stack:¬(P∧Q)", () => {
  const actual = evalBranch({
    nodes: [],
    stack: [["NOT", ["AND", ["PROP", "P"], ["PROP", "Q"]]]],
    skip: [],
    props: {},
    junction: null,
    prev: [],
  });
  const expected: Branch = {
    nodes: [
      ["NOT", ["AND", ["PROP", "P"], ["PROP", "Q"]]],
      ["OR", ["NOT", ["PROP", "P"]], ["NOT", ["PROP", "Q"]]],
    ],
    stack: [],
    skip: [],
    props: {},
    junction: [
      {
        nodes: [["NOT", ["PROP", "P"]], ["TOP"]],
        stack: [],
        skip: [],
        props: { "P": { 0: true } },
        junction: null,
        prev: [],
      },
      {
        nodes: [["NOT", ["PROP", "Q"]], ["TOP"]],
        stack: [],
        skip: [],
        props: { "Q": { 0: true } },
        junction: null,
        prev: [],
      },
    ],
    prev: [],
  };
  assertEquals(actual, expected);
});
Deno.test("evalBranch:stack:¬(P∨Q)", () => {
  const actual = evalBranch({
    nodes: [],
    stack: [["NOT", ["OR", ["PROP", "P"], ["PROP", "Q"]]]],
    skip: [],
    props: {},
    junction: null,
    prev: [],
  });
  const expected: Branch = {
    nodes: [
      ["NOT", ["OR", ["PROP", "P"], ["PROP", "Q"]]],
      ["NOT", ["PROP", "P"]],
      ["NOT", ["PROP", "Q"]],
      ["TOP"],
    ],
    stack: [],
    skip: [],
    props: { "P": { 0: true }, "Q": { 0: true } },
    junction: null,
    prev: [],
  };
  assertEquals(actual, expected);
});

Deno.test("evalBranch:skip:P∨Q", () => {
  const actual = evalBranch({
    nodes: [],
    stack: [],
    skip: [["OR", ["PROP", "P"], ["PROP", "Q"]]],
    props: {},
    junction: null,
    prev: [],
  });
  const expected: Branch = {
    nodes: [],
    stack: [],
    skip: [],
    props: {},
    junction: [
      {
        nodes: [["PROP", "P"], ["TOP"]],
        stack: [],
        skip: [],
        props: { "P": { 1: true } },
        junction: null,
        prev: [],
      },
      {
        nodes: [["PROP", "Q"], ["TOP"]],
        stack: [],
        skip: [],
        props: { "Q": { 1: true } },
        junction: null,
        prev: [],
      },
    ],
    prev: [],
  };
  assertEquals(actual, expected);
});

Deno.test("evalBranch:skip:P→Q", () => {
  const actual = evalBranch({
    nodes: [],
    stack: [],
    skip: [["IMP", ["PROP", "P"], ["PROP", "Q"]]],
    props: {},
    junction: null,
    prev: [],
  });
  const expected: Branch = {
    nodes: [],
    stack: [],
    skip: [],
    props: {},
    junction: [
      {
        nodes: [["NOT", ["PROP", "P"]], ["TOP"]],
        stack: [],
        skip: [],
        props: { "P": { 0: true } },
        junction: null,
        prev: [],
      },
      {
        nodes: [["PROP", "Q"], ["TOP"]],
        stack: [],
        skip: [],
        props: { "Q": { 1: true } },
        junction: null,
        prev: [],
      },
    ],
    prev: [],
  };
  assertEquals(actual, expected);
});
Deno.test("evalBranch:skip:P↔Q", () => {
  const actual = evalBranch({
    nodes: [],
    stack: [],
    skip: [["EQ", ["PROP", "P"], ["PROP", "Q"]]],
    props: {},
    junction: null,
    prev: [],
  });
  const expected: Branch = {
    nodes: [],
    stack: [],
    skip: [],
    props: {},
    junction: [
      {
        nodes: [
          ["AND", ["PROP", "P"], ["PROP", "Q"]],
          ["PROP", "P"],
          ["PROP", "Q"],
          ["TOP"],
        ],
        stack: [],
        skip: [],
        props: { "P": { 1: true }, "Q": { 1: true } },
        junction: null,
        prev: [],
      },
      {
        nodes: [
          ["AND", ["NOT", ["PROP", "P"]], ["NOT", ["PROP", "Q"]]],
          ["NOT", ["PROP", "P"]],
          ["NOT", ["PROP", "Q"]],
          ["TOP"],
        ],
        stack: [],
        skip: [],
        props: { "P": { 0: true }, "Q": { 0: true } },
        junction: null,
        prev: [],
      },
    ],
    prev: [],
  };
  assertEquals(actual, expected);
});

Deno.test("evalFormula:P∧Q", () => {
  const expected: PropFormula[] = [["PROP", "P"], ["PROP", "Q"]];
  assertEquals(
    evalFormula(["AND", ["PROP", "P"], ["PROP", "Q"]]),
    expected,
  );
});
Deno.test("evalFormula:¬(P∧Q)", () => {
  const expected: PropFormula[] = [["OR", ["NOT", ["PROP", "P"]], ["NOT", ["PROP", "Q"]]]];
  assertEquals(
    evalFormula(["NOT", ["AND", ["PROP", "P"], ["PROP", "Q"]]]),
    expected,
  );
});
Deno.test("evalFormula:¬(P∨Q)", () => {
  const expected: PropFormula[] = [["NOT", ["PROP", "P"]], ["NOT", ["PROP", "Q"]]];
  assertEquals(
    evalFormula(["NOT", ["OR", ["PROP", "P"], ["PROP", "Q"]]]),
    expected,
  );
});
Deno.test("evalFormula:¬¬P", () => {
  const expected: PropFormula[] = [["PROP", "P"]];
  assertEquals(
    evalFormula(["NOT", ["NOT", ["PROP", "P"]]]),
    expected,
  );
});
Deno.test("evalFormula:error:¬P", () => {
  assertThrows(() => evalFormula(["NOT", ["PROP", "P"]]));
});
