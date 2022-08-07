import { evalTableau, Tableau } from "./tableau.ts";
import { assertEquals } from "std/testing/asserts.ts";

Deno.test("evalTableau:stack:F(x)", () => {
  const actual = evalTableau({
    nodes: [],
    stack: [
      ["PRED", "F", ["VAR", "x"]],
    ],
    junction: null,
  });
  const expected: Tableau = {
    nodes: [
      ["PRED", "F", ["VAR", "x"]],
      ["TOP"],
    ],
    stack: [],
    junction: null,
  };
  assertEquals(actual, expected);
});

Deno.test("evalTableau:stack:¬F(x)", () => {
  const actual = evalTableau({
    nodes: [],
    stack: [
      ["NOT", ["PRED", "F", ["VAR", "x"]]],
    ],
    junction: null,
  });
  const expected: Tableau = {
    nodes: [
      [
        "NOT",
        ["PRED", "F", ["VAR", "x"]],
      ],
      ["PRED", "F", ["VAR", "x"]],
      ["TOP"],
    ],
    stack: [],
    junction: null,
  };
  assertEquals(actual, expected);
});

Deno.test("evalTableau:stack:F(x)∧G(x)", () => {
  const actual = evalTableau({
    nodes: [],
    stack: [
      [
        "AND",
        ["PRED", "F", ["VAR", "x"]],
        ["PRED", "G", ["VAR", "x"]],
      ],
    ],
    junction: null,
  });
  const expected: Tableau = {
    nodes: [["AND", ["PRED", "F", ["VAR", "x"]], ["PRED", "G", ["VAR", "x"]]], ["PRED", "F", ["VAR", "x"]], [
      "PRED",
      "G",
      ["VAR", "x"],
    ], ["TOP"]],
    stack: [],
    junction: null,
  };
  assertEquals(actual, expected);
});

Deno.test("evalTableau:stack:F(x)∨G(x)", () => {
  const actual = evalTableau({
    nodes: [],
    stack: [
      [
        "OR",
        ["PRED", "F", ["VAR", "x"]],
        ["PRED", "G", ["VAR", "x"]],
      ],
    ],
    junction: null,
  });
  const expected: Tableau = {
    nodes: [
      [
        "OR",
        ["PRED", "F", ["VAR", "x"]],
        ["PRED", "G", ["VAR", "x"]],
      ],
    ],
    stack: [],
    junction: [{
      nodes: [["PRED", "F", ["VAR", "x"]], ["TOP"]],
      stack: [],
      junction: null,
    }, {
      nodes: [["PRED", "G", ["VAR", "x"]], ["TOP"]],
      stack: [],
      junction: null,
    }],
  };
  assertEquals(actual, expected);
});

Deno.test("evalTableau:stack:F(x),¬F(x)", () => {
  const actual = evalTableau({
    nodes: [],
    stack: [
      ["PRED", "F", ["VAR", "x"]],
      ["NOT", ["PRED", "F", ["VAR", "x"]]],
    ],
    junction: null,
  });
  const expected: Tableau = {
    nodes: [
      ["PRED", "F", ["VAR", "x"]],
      ["NOT", ["PRED", "F", ["VAR", "x"]]],
      ["BOT"],
    ],
    stack: [],
    junction: null,
  };
  assertEquals(actual, expected);
});

Deno.test("evalTableau:stack:∀x.F(x)", () => {
  const actual = evalTableau({
    nodes: [],
    stack: [
      ["FORALL", ["VAR", "x"], ["PRED", "F", ["VAR", "x"]]],
    ],
    junction: null,
  });
  const expected: Tableau = {
    nodes: [
      ["FORALL", ["VAR", "x"], ["PRED", "F", ["VAR", "x"]]],
    ],
    stack: [],
    junction: null,
  };
  assertEquals(actual, expected);
});
Deno.test("evalTableau:stack:∃x.F(x)", () => {
  const actual = evalTableau({
    nodes: [],
    stack: [
      ["ANY", ["VAR", "x"], ["PRED", "F", ["VAR", "x"]]],
    ],
    junction: null,
  });
  const expected: Tableau = {
    nodes: [
      ["ANY", ["VAR", "x"], ["PRED", "F", ["VAR", "x"]]],
    ],
    stack: [],
    junction: null,
  };
  assertEquals(actual, expected);
});
