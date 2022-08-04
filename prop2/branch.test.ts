import { assertEquals, assertThrows } from "std/testing/asserts.ts";
import { Branch, evalBranch, evalFormula } from "./branch.ts";
import { PropFormula } from "./types.ts";

Deno.test("evalBranch:stack:P", () => {
  const actual = evalBranch({
    stack: [["PROP", "P"]],
    skip: [],
    props: {},
    junction: null,
  });
  const expected: Branch = {
    stack: [],
    skip: [],
    props: { "P": { 1: true } },
    junction: null,
  };
  assertEquals(actual, expected);
});
Deno.test("evalBranch:stack:¬P", () => {
  const actual = evalBranch({
    stack: [["NOT", ["PROP", "P"]]],
    skip: [],
    props: {},
    junction: null,
  });
  const expected: Branch = {
    stack: [],
    skip: [],
    props: { "P": { 0: true } },
    junction: null,
  };
  assertEquals(actual, expected);
});
Deno.test("evalBranch:stack:¬¬P", () => {
  const actual = evalBranch({
    stack: [["NOT", ["NOT", ["PROP", "P"]]]],
    skip: [],
    props: {},
    junction: null,
  });
  const expected: Branch = {
    stack: [["PROP", "P"]],
    skip: [],
    props: {},
    junction: null,
  };
  assertEquals(actual, expected);
});
Deno.test("evalBranch:stack:P∧Q", () => {
  const actual = evalBranch({
    stack: [["AND", ["PROP", "P"], ["PROP", "Q"]]],
    skip: [],
    props: {},
    junction: null,
  });
  const expected: Branch = {
    stack: [["PROP", "P"], ["PROP", "Q"]],
    skip: [],
    props: {},
    junction: null,
  };
  assertEquals(actual, expected);
});
Deno.test("evalBranch:stack:P∨Q", () => {
  const actual = evalBranch({
    stack: [["OR", ["PROP", "P"], ["PROP", "Q"]]],
    skip: [],
    props: {},
    junction: null,
  });
  const expected: Branch = {
    stack: [],
    skip: [["OR", ["PROP", "P"], ["PROP", "Q"]]],
    props: {},
    junction: null,
  };
  assertEquals(actual, expected);
});
Deno.test("evalBranch:stack:¬(P∧Q)", () => {
  const actual = evalBranch({
    stack: [["NOT", ["AND", ["PROP", "P"], ["PROP", "Q"]]]],
    skip: [],
    props: {},
    junction: null,
  });
  const expected: Branch = {
    stack: [["OR", ["PROP", "P"], ["PROP", "Q"]]],
    skip: [],
    props: {},
    junction: null,
  };
  assertEquals(actual, expected);
});
Deno.test("evalBranch:stack:¬(P∨Q)", () => {
  const actual = evalBranch({
    stack: [["NOT", ["OR", ["PROP", "P"], ["PROP", "Q"]]]],
    skip: [],
    props: {},
    junction: null,
  });
  const expected: Branch = {
    stack: [["PROP", "P"], ["PROP", "Q"]],
    skip: [],
    props: {},
    junction: null,
  };
  assertEquals(actual, expected);
});

Deno.test("evalBranch:skip:P∨Q", () => {
  const actual = evalBranch({
    stack: [],
    skip: [["OR", ["PROP", "P"], ["PROP", "Q"]]],
    props: {},
    junction: null,
  });
  const expected: Branch = {
    stack: [],
    skip: [],
    props: {},
    junction: [
      { stack: [], skip: [], props: { "P": { 1: true } }, junction: null },
      { stack: [], skip: [], props: { "Q": { 1: true } }, junction: null },
    ],
  };
  assertEquals(actual, expected);
});
Deno.test("evalBranch:skip:P∨Q", () => {
  const actual = evalBranch({
    stack: [],
    skip: [["OR", ["PROP", "P"], ["PROP", "Q"]]],
    props: {},
    junction: null,
  });
  const expected: Branch = {
    stack: [],
    skip: [],
    props: {},
    junction: [
      { stack: [], skip: [], props: { "P": { 1: true } }, junction: null },
      { stack: [], skip: [], props: { "Q": { 1: true } }, junction: null },
    ],
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
  const expected: PropFormula[] = [["OR", ["PROP", "P"], ["PROP", "Q"]]];
  assertEquals(
    evalFormula(["NOT", ["AND", ["PROP", "P"], ["PROP", "Q"]]]),
    expected,
  );
});
Deno.test("evalFormula:¬(P∨Q)", () => {
  const expected: PropFormula[] = [["PROP", "P"], ["PROP", "Q"]];
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
