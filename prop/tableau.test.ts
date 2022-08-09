import { assert, assertFalse } from "std/testing/asserts.ts";
import { hasContract, isSameFormula } from "./tableau.ts";

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
