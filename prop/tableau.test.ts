import { assert, assertEquals, assertFalse, assertNotEquals } from "std/testing/asserts.ts";
import { evalTableau, hasContract, isSameFormula, Tableau as Branch } from "./tableau.ts";

Deno.test("isSameFormula:P=P", () => {
  assert(isSameFormula(["PROP", "P"], ["PROP", "P"]));
});

Deno.test("isSameFormula:P≠Q", () => {
  assertFalse(isSameFormula(["PROP", "P"], ["PROP", "Q"]));
});

Deno.test("isSameFormula:¬P=¬P", () => {
  assert(isSameFormula(
    ["NOT", ["PROP", "P"]],
    ["NOT", ["PROP", "P"]],
  ));
});

Deno.test("isSameFormula:P∧Q=Q∧P", () => {
  assert(isSameFormula(
    ["AND", ["PROP", "P"], ["PROP", "Q"]],
    ["AND", ["PROP", "Q"], ["PROP", "P"]],
  ));
});

Deno.test("isSameFormula:P∨Q=Q∨P", () => {
  assert(isSameFormula(
    ["OR", ["PROP", "P"], ["PROP", "Q"]],
    ["OR", ["PROP", "Q"], ["PROP", "P"]],
  ));
});

Deno.test("isSameFormula:P⇔Q=Q⇔P", () => {
  assert(isSameFormula(
    ["EQ", ["PROP", "P"], ["PROP", "Q"]],
    ["EQ", ["PROP", "Q"], ["PROP", "P"]],
  ));
});

Deno.test("hasContract:P:¬P", () => {
  assert(hasContract(
    [["PROP", "P"]],
    [["NOT", ["PROP", "P"]]],
  ));
});

Deno.test("hasContract:P∧Q:¬(P∧Q)", () => {
  assert(hasContract(
    [["AND", ["PROP", "P"], ["PROP", "Q"]]],
    [["NOT", ["AND", ["PROP", "P"], ["PROP", "Q"]]]],
  ));
});

Deno.test("hasContract:P∧Q:¬(Q∧P)", () => {
  assert(hasContract(
    [["AND", ["PROP", "P"], ["PROP", "Q"]]],
    [["NOT", ["AND", ["PROP", "Q"], ["PROP", "P"]]]],
  ));
});

Deno.test("hasContract:not:P:Q", () => {
  assertFalse(hasContract(
    [["PROP", "P"]],
    [["PROP", "Q"]],
  ));
});

Deno.test("evalTableau:stack:P", () => {
  const actual = evalTableau({
    nodes: [],
    stack: [["PROP", "P"]],
    skip: [],
    junction: null,
    prev: [],
  });
  const expected: Branch = {
    nodes: [["PROP", "P"], ["TOP"]],
    stack: [],
    skip: [],
    junction: null,
    prev: [],
  };
  assertEquals(actual, expected);
});
Deno.test("evalTableau:stack:¬P", () => {
  const actual = evalTableau({
    nodes: [],
    stack: [["NOT", ["PROP", "P"]]],
    skip: [],
    junction: null,
    prev: [],
  });
  const expected: Branch = {
    nodes: [["NOT", ["PROP", "P"]], ["TOP"]],
    stack: [],
    skip: [],
    junction: null,
    prev: [],
  };
  assertEquals(actual, expected);
});
Deno.test("evalTableau:stack:⊤", () => {
  const actual = evalTableau({
    nodes: [],
    stack: [["TOP"]],
    skip: [],
    junction: null,
    prev: [],
  });
  const expected: Branch = {
    nodes: [["TOP"]],
    stack: [],
    skip: [],
    junction: null,
    prev: [],
  };
  assertEquals(actual, expected);
});
Deno.test("evalTableau:stack:⊥", () => {
  const actual = evalTableau({
    nodes: [],
    stack: [["BOT"]],
    skip: [],
    junction: null,
    prev: [],
  });
  const expected: Branch = {
    nodes: [["BOT"]],
    stack: [],
    skip: [],
    junction: null,
    prev: [],
  };
  assertEquals(actual, expected);
});
Deno.test("evalTableau:stack:¬⊤", () => {
  const actual = evalTableau({
    nodes: [],
    stack: [["NOT", ["TOP"]]],
    skip: [],
    junction: null,
    prev: [],
  });
  const expected: Branch = {
    nodes: [["NOT", ["TOP"]], ["BOT"]],
    stack: [],
    skip: [],
    junction: null,
    prev: [],
  };
  assertEquals(actual, expected);
});
Deno.test("evalTableau:stack:¬⊥", () => {
  const actual = evalTableau({
    nodes: [],
    stack: [["NOT", ["BOT"]]],
    skip: [],
    junction: null,
    prev: [],
  });
  const expected: Branch = {
    nodes: [["NOT", ["BOT"]], ["TOP"]],
    stack: [],
    skip: [],
    junction: null,
    prev: [],
  };
  assertEquals(actual, expected);
});
Deno.test("evalTableau:stack:¬¬P", () => {
  const actual = evalTableau({
    nodes: [],
    stack: [["NOT", ["NOT", ["PROP", "P"]]]],
    skip: [],
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
    junction: null,
    prev: [],
  };
  assertEquals(actual, expected);
});
Deno.test("evalTableau:stack:P∧Q", () => {
  const actual = evalTableau({
    nodes: [],
    stack: [["AND", ["PROP", "P"], ["PROP", "Q"]]],
    skip: [],
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
    junction: null,
    prev: [],
  };
  assertEquals(actual, expected);
});
Deno.test("evalTableau:stack:P∨Q", () => {
  const actual = evalTableau({
    nodes: [],
    stack: [["OR", ["PROP", "P"], ["PROP", "Q"]]],
    skip: [],
    junction: null,
    prev: [],
  });
  assertEquals(actual.nodes, [["OR", ["PROP", "P"], ["PROP", "Q"]]]);

  assertNotEquals(actual.junction, null);
  assertEquals(((actual.junction as [Branch, Branch])[0]).nodes, [["PROP", "P"], ["TOP"]]);
  assertEquals(((actual.junction as [Branch, Branch])[0]).junction, null);

  assertEquals(((actual.junction as [Branch, Branch])[1]).nodes, [["PROP", "Q"], ["TOP"]]);
  assertEquals(((actual.junction as [Branch, Branch])[1]).junction, null);
});
Deno.test("evalTableau:stack:¬(P∧Q)", () => {
  const actual = evalTableau({
    nodes: [],
    stack: [["NOT", ["AND", ["PROP", "P"], ["PROP", "Q"]]]],
    skip: [],
    junction: null,
    prev: [],
  });
  assertEquals(actual.nodes, [
    ["NOT", ["AND", ["PROP", "P"], ["PROP", "Q"]]],
  ]);

  assertNotEquals(actual.junction, null);
  assertEquals(((actual.junction as [Branch, Branch])[0]).nodes, [["NOT", ["PROP", "P"]], ["TOP"]]);
  assertEquals(((actual.junction as [Branch, Branch])[0]).junction, null);

  assertEquals(((actual.junction as [Branch, Branch])[1]).nodes, [["NOT", ["PROP", "Q"]], ["TOP"]]);
  assertEquals(((actual.junction as [Branch, Branch])[1]).junction, null);
});
Deno.test("evalTableau:stack:¬(P∨Q)", () => {
  const actual = evalTableau({
    nodes: [],
    stack: [["NOT", ["OR", ["PROP", "P"], ["PROP", "Q"]]]],
    skip: [],
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
    junction: null,
    prev: [],
  };
  assertEquals(actual, expected);
});
