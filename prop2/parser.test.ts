import { assertEquals } from "std/testing/asserts.ts";
import { parseE1, parseE2, parseE3, parseE4, parseFormula, parsePr, PropFormula } from "./parser.ts";

Deno.test("parseE1:P↔Q", () => {
  const actual = parseE1("P↔Q");
  const expected: PropFormula = ["EQ", ["PROP", "P"], ["PROP", "Q"]];
  assertEquals(actual, expected);
});
Deno.test("parseE1:P↔¬Q", () => {
  const actual = parseE1("P↔¬Q");
  const expected: PropFormula = ["EQ", ["PROP", "P"], ["NOT", ["PROP", "Q"]]];
  assertEquals(actual, expected);
});
Deno.test("parseE1:¬P↔Q", () => {
  const actual = parseE1("¬P↔Q");
  const expected: PropFormula = ["EQ", ["NOT", ["PROP", "P"]], ["PROP", "Q"]];
  assertEquals(actual, expected);
});
Deno.test("parseE1:P↔Q↔R", () => {
  const actual = parseE1("P↔Q↔R");
  const expected: PropFormula = ["EQ", ["PROP", "P"], ["EQ", ["PROP", "Q"], ["PROP", "R"]]];
  assertEquals(actual, expected);
});
Deno.test("parseE1:(P↔Q)↔(R↔S)", () => {
  const actual = parseE1("(P↔Q)↔(R↔S)");
  const expected: PropFormula = ["EQ", ["EQ", ["PROP", "P"], ["PROP", "Q"]], ["EQ", ["PROP", "R"], ["PROP", "S"]]];
  assertEquals(actual, expected);
});

Deno.test("parseE2:P→Q", () => {
  const actual = parseE2("P→Q");
  const expected: PropFormula = ["IMP", ["PROP", "P"], ["PROP", "Q"]];
  assertEquals(actual, expected);
});
Deno.test("parseE2:P→¬Q", () => {
  const actual = parseE2("P→¬Q");
  const expected: PropFormula = ["IMP", ["PROP", "P"], ["NOT", ["PROP", "Q"]]];
  assertEquals(actual, expected);
});
Deno.test("parseE2:¬P→Q", () => {
  const actual = parseE2("¬P→Q");
  const expected: PropFormula = ["IMP", ["NOT", ["PROP", "P"]], ["PROP", "Q"]];
  assertEquals(actual, expected);
});
Deno.test("parseE2:P→Q→R", () => {
  const actual = parseE2("P→Q→R");
  const expected: PropFormula = ["IMP", ["PROP", "P"], ["IMP", ["PROP", "Q"], ["PROP", "R"]]];
  assertEquals(actual, expected);
});
Deno.test("parseE2:(P→Q)→(R→S)", () => {
  const actual = parseE2("(P→Q)→(R→S)");
  const expected: PropFormula = ["IMP", ["IMP", ["PROP", "P"], ["PROP", "Q"]], ["IMP", ["PROP", "R"], ["PROP", "S"]]];
  assertEquals(actual, expected);
});

Deno.test("parseE3:P∨Q", () => {
  const actual = parseE3("P∨Q");
  const expected: PropFormula = ["OR", ["PROP", "P"], ["PROP", "Q"]];
  assertEquals(actual, expected);
});
Deno.test("parseE3:P∨¬Q", () => {
  const actual = parseE3("P∨¬Q");
  const expected: PropFormula = ["OR", ["PROP", "P"], ["NOT", ["PROP", "Q"]]];
  assertEquals(actual, expected);
});
Deno.test("parseE3:¬P∨Q", () => {
  const actual = parseE3("¬P∨Q");
  const expected: PropFormula = ["OR", ["NOT", ["PROP", "P"]], ["PROP", "Q"]];
  assertEquals(actual, expected);
});
Deno.test("parseE3:P∨Q∨R", () => {
  const actual = parseE3("P∨Q∨R");
  const expected: PropFormula = ["OR", ["PROP", "P"], ["OR", ["PROP", "Q"], ["PROP", "R"]]];
  assertEquals(actual, expected);
});
Deno.test("parseE3:(P∨Q)∨(R∨S)", () => {
  const actual = parseE3("(P∨Q)∨(R∨S)");
  const expected: PropFormula = ["OR", ["OR", ["PROP", "P"], ["PROP", "Q"]], ["OR", ["PROP", "R"], ["PROP", "S"]]];
  assertEquals(actual, expected);
});

Deno.test("parseE4:P∧Q", () => {
  const actual = parseE4("P∧Q");
  const expected: PropFormula = ["AND", ["PROP", "P"], ["PROP", "Q"]];
  assertEquals(actual, expected);
});
Deno.test("parseE4:P∧¬Q", () => {
  const actual = parseE4("P∧¬Q");
  const expected: PropFormula = ["AND", ["PROP", "P"], ["NOT", ["PROP", "Q"]]];
  assertEquals(actual, expected);
});
Deno.test("parseE4:¬P∧Q", () => {
  const actual = parseE4("¬P∧Q");
  const expected: PropFormula = ["AND", ["NOT", ["PROP", "P"]], ["PROP", "Q"]];
  assertEquals(actual, expected);
});
Deno.test("parseE4:P∧Q∧R", () => {
  const actual = parseE4("P∧Q∧R");
  const expected: PropFormula = ["AND", ["PROP", "P"], ["AND", ["PROP", "Q"], ["PROP", "R"]]];
  assertEquals(actual, expected);
});
Deno.test("parseE4:(P∧Q)∧(R∧S)", () => {
  const actual = parseE4("(P∧Q)∧(R∧S)");
  const expected: PropFormula = ["AND", ["AND", ["PROP", "P"], ["PROP", "Q"]], ["AND", ["PROP", "R"], ["PROP", "S"]]];
  assertEquals(actual, expected);
});

Deno.test("parsePr:P", () => {
  const actual = parsePr("P");
  const expected: PropFormula = ["PROP", "P"];
  assertEquals(actual, expected);
});
Deno.test("parsePr:¬P", () => {
  const actual = parsePr("¬P");
  const expected: PropFormula = ["NOT", ["PROP", "P"]];
  assertEquals(actual, expected);
});
Deno.test("parsePr:(P↔Q)", () => {
  const actual = parsePr("(P↔Q)");
  const expected: PropFormula = ["EQ", ["PROP", "P"], ["PROP", "Q"]];
  assertEquals(actual, expected);
});

Deno.test("parse:P∧(P→Q)→Q", () => {
  const actual = parseFormula("P∧(P→Q)→Q");
  const expected: PropFormula = ["IMP", ["AND", ["PROP", "P"], ["IMP", ["PROP", "P"], ["PROP", "Q"]]], ["PROP", "Q"]];
  assertEquals(actual, expected);
});
Deno.test("parse:(P∧(P→Q))→Q", () => {
  const actual = parseFormula("(P∧(P→Q))→Q");
  const expected: PropFormula = ["IMP", ["AND", ["PROP", "P"], ["IMP", ["PROP", "P"], ["PROP", "Q"]]], ["PROP", "Q"]];
  assertEquals(actual, expected);
});

Deno.test("parse:(P∧(P→Q)→Q)∧(R→R)", () => {
  const actual = parseFormula("(P∧(P→Q)→Q)∧(R→R)");
  const expected: PropFormula = [
    "AND",
    ["IMP", ["AND", ["PROP", "P"], ["IMP", ["PROP", "P"], ["PROP", "Q"]]], ["PROP", "Q"]],
    ["IMP", ["PROP", "R"], ["PROP", "R"]],
  ];
  assertEquals(actual, expected);
});
Deno.test("parse:(P∧(P→Q)→Q)∧(R→R)", () => {
  const actual = parseFormula("(P∧(P→Q)→Q)∧(R→R)");
  const expected: PropFormula = [
    "AND",
    ["IMP", ["AND", ["PROP", "P"], ["IMP", ["PROP", "P"], ["PROP", "Q"]]], ["PROP", "Q"]],
    ["IMP", ["PROP", "R"], ["PROP", "R"]],
  ];
  assertEquals(actual, expected);
});
Deno.test("parse:(P∧Q)∧R↔P∧(Q∧R)", () => {
  const actual = parseFormula("(P∧Q)∧R↔P∧(Q∧R)");
  const expected: PropFormula = [
    "EQ",
    ["AND", ["AND", ["PROP", "P"], ["PROP", "Q"]], ["PROP", "R"]],
    ["AND", ["PROP", "P"], ["AND", ["PROP", "Q"], ["PROP", "R"]]],
  ];
  assertEquals(actual, expected);
});
