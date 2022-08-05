import { assertEquals } from "std/testing/asserts.ts";
import { evalBranch } from "./branch.ts";
import { findTB } from "./find_top_or_bot.ts";
import {
  absorptiveAndOr,
  absorptiveOrAnd,
  additionLeft,
  additionRight,
  associativeAnd,
  associativeOr,
  commutativeAnd,
  commutativeOr,
  constructiveDilemma,
  contraposition,
  demorganAndOr,
  demorganOrAnd,
  disjunctiveSyllogism,
  distributiveAndOr,
  distributiveOrAnd,
  doubleNegation,
  excludeMiddle,
  exportation,
  idempotentAnd,
  idempotentOr,
  identity,
  importation,
  modusPonens,
  nonContradiction,
  simplificationLeft,
  simplificationRight,
  transitive,
} from "./tautology.ts";
import { PropFormula } from "./types.ts";

const isValid = (f: PropFormula) =>
  findTB(evalBranch({ stack: [["NOT", f]], nodes: [], skip: [], props: {}, junction: null }), "TOP") === true;

Deno.test("tautology:associativeAnd", () => {
  assertEquals(isValid(associativeAnd), true);
});
Deno.test("tautology:associativeOr", () => {
  assertEquals(isValid(associativeOr), true);
});

Deno.test("tautology:commutativeAnd", () => {
  assertEquals(isValid(commutativeAnd), true);
});
Deno.test("tautology:commutativeOr", () => {
  assertEquals(isValid(commutativeOr), true);
});

Deno.test("tautology:absorptiveAndOr", () => {
  assertEquals(isValid(absorptiveAndOr), true);
});
Deno.test("tautology:absorptiveOrAnd", () => {
  assertEquals(isValid(absorptiveOrAnd), true);
});

Deno.test("tautology:idempotentAnd", () => {
  assertEquals(isValid(idempotentAnd), true);
});
Deno.test("tautology:idempotentOr", () => {
  assertEquals(isValid(idempotentOr), true);
});

Deno.test("tautology:simplificationLeft", () => {
  assertEquals(isValid(simplificationLeft), true);
});
Deno.test("tautology:simplificationRight", () => {
  assertEquals(isValid(simplificationRight), true);
});

Deno.test("tautology:additionLeft", () => {
  assertEquals(isValid(additionLeft), true);
});
Deno.test("tautology:additionRight", () => {
  assertEquals(isValid(additionRight), true);
});

Deno.test("tautology:distributiveAndOr", () => {
  assertEquals(isValid(distributiveAndOr), true);
});
Deno.test("tautology:distributiveOrAnd", () => {
  assertEquals(isValid(distributiveOrAnd), true);
});

Deno.test("tautology:transitive", () => {
  assertEquals(isValid(transitive), true);
});

Deno.test("tautology:identity", () => {
  assertEquals(isValid(identity), true);
});

Deno.test("tautology:contraposition", () => {
  assertEquals(isValid(contraposition), true);
});

Deno.test("tautology:doubleNegation", () => {
  assertEquals(isValid(doubleNegation), true);
});

Deno.test("tautology:excludeMiddle", () => {
  assertEquals(isValid(excludeMiddle), true);
});

Deno.test("tautology:nonContradiction", () => {
  assertEquals(isValid(nonContradiction), true);
});

Deno.test("tautology:importation", () => {
  assertEquals(isValid(importation), true);
});

Deno.test("tautology:exportation", () => {
  assertEquals(isValid(exportation), true);
});

Deno.test("tautology:demorganAndOr", () => {
  assertEquals(isValid(demorganAndOr), true);
});
Deno.test("tautology:demorganOrAnd", () => {
  assertEquals(isValid(demorganOrAnd), true);
});

Deno.test("tautology:modusPonens", () => {
  assertEquals(isValid(modusPonens), true);
});

Deno.test("tautology:disjunctiveSyllogism", () => {
  assertEquals(isValid(disjunctiveSyllogism), true);
});

Deno.test("tautology:disjunctiveSyllogism", () => {
  assertEquals(isValid(disjunctiveSyllogism), true);
});

Deno.test("tautology:constructiveDilemma", () => {
  assertEquals(isValid(constructiveDilemma), true);
});
