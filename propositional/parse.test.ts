import { assertEquals } from "std/testing/asserts.ts";
import { parseFormula, parseImplict, parseNot, parseProp, removeParen } from "./parse.ts";
import { Implict, Not, PropFormula } from "./types.ts";

Deno.test("propositional:parse:removeParen:1", () => {
  assertEquals(removeParen("P"), "P");
});
Deno.test("propositional:parse:removeParen:2", () => {
  assertEquals(removeParen("(P)"), "P");
});
Deno.test("propositional:parse:removeParen:3", () => {
  assertEquals(removeParen("((P))"), "P");
});
Deno.test("propositional:parse:removeParen:4", () => {
  assertEquals(removeParen("(P→Q)"), "P→Q");
});

Deno.test("propositional:parse:prop:1", () => {
  assertEquals(parseProp("P"), { type: "PROP", id: "P" });
});
Deno.test("propositional:parse:prop:1", () => {
  assertEquals(parseProp("(P)"), { type: "PROP", id: "P" });
});

Deno.test("propositional:parse:not:1", () => {
  const expected: Not = { type: "NOT", in: { type: "PROP", id: "P" } };
  assertEquals(parseNot("¬P"), expected);
});

Deno.test("propositional:parse:not:2", () => {
  const expected: Not = { type: "NOT", in: { type: "PROP", id: "P" } };
  assertEquals(parseNot("¬(P)"), expected);
});

Deno.test("propositional:parse:not:3", () => {
  const expected: Not = {
    type: "NOT",
    in: {
      type: "IMPLICT",
      left: { type: "PROP", id: "P" },
      right: { type: "PROP", id: "Q" },
    },
  };
  assertEquals(parseNot("¬(P→Q)"), expected);
});

Deno.test("propositional:parse:implict:1", () => {
  const expected: Implict = {
    type: "IMPLICT",
    left: { type: "PROP", id: "P" },
    right: { type: "PROP", id: "Q" },
  };
  assertEquals(parseImplict("P→Q"), expected);
});
Deno.test("propositional:parse:implict:2", () => {
  const expected: Implict = {
    type: "IMPLICT",
    left: { type: "PROP", id: "P" },
    right: { type: "PROP", id: "Q" },
  };
  assertEquals(parseImplict("(P→Q)"), expected);
});
Deno.test("propositional:parse:implict:3", () => {
  const expected: Implict = {
    type: "IMPLICT",
    left: {
      type: "IMPLICT",
      left: { type: "PROP", id: "P" },
      right: { type: "PROP", id: "Q" },
    },
    right: { type: "PROP", id: "Q" },
  };
  assertEquals(parseImplict("(P→Q)→Q"), expected);
});
Deno.test("propositional:parse:implict:4", () => {
  const expected: Implict = {
    type: "IMPLICT",
    left: {
      type: "IMPLICT",
      left: { type: "PROP", id: "P" },
      right: { type: "PROP", id: "Q" },
    },
    right: { type: "NOT", in: { type: "PROP", id: "Q" } },
  };
  assertEquals(parseImplict("(P→Q)→¬Q"), expected);
});

Deno.test("propositional:parse:formula:1", () => {
  const expected: PropFormula = {
    type: "IMPLICT",
    left: { type: "PROP", id: "P" },
    right: { type: "PROP", id: "Q" },
  };
  assertEquals(parseFormula("P→Q"), expected);
});
Deno.test("propositional:parse:formula:2", () => {
  const expected: PropFormula = {
    type: "IMPLICT",
    left: { type: "NOT", in: { type: "PROP", id: "P" } },
    right: { type: "PROP", id: "Q" },
  };
  assertEquals(parseFormula("¬P→Q"), expected);
});
Deno.test("propositional:parse:formula:3", () => {
  const expected: PropFormula = {
    type: "IMPLICT",
    left: {
      type: "AND",
      left: { type: "PROP", id: "P" },
      right: { type: "PROP", id: "Q" },
    },
    right: { type: "PROP", id: "R" },
  };
  assertEquals(parseFormula("P∧Q→R"), expected);
});
Deno.test("propositional:parse:formula:4", () => {
  const expected: PropFormula = {
    type: "IMPLICT",
    left: {
      type: "OR",
      left: { type: "PROP", id: "P" },
      right: { type: "PROP", id: "Q" },
    },
    right: { type: "PROP", id: "R" },
  };
  assertEquals(parseFormula("P∨Q→R"), expected);
});
Deno.test("propositional:parse:formula:5", () => {
  const expected: PropFormula = {
    type: "EQ",
    left: {
      type: "IMPLICT",
      left: { type: "PROP", id: "P" },
      right: { type: "PROP", id: "Q" },
    },
    right: { type: "PROP", id: "R" },
  };
  assertEquals(parseFormula("P→Q↔R"), expected);
});
Deno.test("propositional:parse:formula:6", () => {
  const expected: PropFormula = {
    type: "IMPLICT",
    left: {
      type: "AND",
      left: { type: "PROP", id: "P" },
      right: { type: "PROP", id: "Q" },
    },
    right: { type: "PROP", id: "Q" },
  };
  assertEquals(parseFormula("(P∧Q)→Q"), expected);
});
