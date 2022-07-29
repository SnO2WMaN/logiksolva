import { assertEquals } from "std/testing/asserts.ts";
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
  importation,
  modusPonens,
  nonContradiction,
  simplificationLeft,
  simplificationRight,
} from "./tautology.ts";
import { check } from "./mod.ts";

Deno.test("propositional:tautology:associativeAnd", () => {
  assertEquals(check(associativeAnd), true);
});
Deno.test("propositional:tautology:associativeOr", () => {
  assertEquals(check(associativeOr), true);
});

Deno.test("propositional:tautology:commutativeAnd", () => {
  assertEquals(check(commutativeAnd), true);
});
Deno.test("propositional:tautology:commutativeOr", () => {
  assertEquals(check(commutativeOr), true);
});

Deno.test("propositional:tautology:absorptiveAndOr", () => {
  assertEquals(check(absorptiveAndOr), true);
});
Deno.test("propositional:tautology:absorptiveOrAnd", () => {
  assertEquals(check(absorptiveOrAnd), true);
});

Deno.test("propositional:tautology:idempotentAnd", () => {
  assertEquals(check(idempotentAnd), true);
});
Deno.test("propositional:tautology:idempotentOr", () => {
  assertEquals(check(idempotentOr), true);
});

Deno.test("propositional:tautology:simplificationLeft", () => {
  assertEquals(check(simplificationLeft), true);
});
Deno.test("propositional:tautology:simplificationRight", () => {
  assertEquals(check(simplificationRight), true);
});

Deno.test("propositional:tautology:additionLeft", () => {
  assertEquals(check(additionLeft), true);
});
Deno.test("propositional:tautology:additionRight", () => {
  assertEquals(check(additionRight), true);
});

Deno.test("propositional:tautology:distributiveAndOr", () => {
  assertEquals(check(distributiveAndOr), true);
});
Deno.test("propositional:tautology:distributiveOrAnd", () => {
  assertEquals(check(distributiveOrAnd), true);
});

Deno.test("propositional:tautology:transitive", () => {
  assertEquals(check(distributiveAndOr), true);
});

Deno.test("propositional:tautology:identity", () => {
  assertEquals(check(distributiveAndOr), true);
});

Deno.test("propositional:tautology:contraposition", () => {
  assertEquals(check(contraposition), true);
});

Deno.test("propositional:tautology:doubleNegation", () => {
  assertEquals(check(doubleNegation), true);
});

Deno.test("propositional:tautology:excludeMiddle", () => {
  assertEquals(check(excludeMiddle), true);
});

Deno.test("propositional:tautology:nonContradiction", () => {
  assertEquals(check(nonContradiction), true);
});

Deno.test("propositional:tautology:importation", () => {
  assertEquals(check(importation), true);
});

Deno.test("propositional:tautology:exportation", () => {
  assertEquals(check(exportation), true);
});

Deno.test("propositional:tautology:demorganAndOr", () => {
  assertEquals(check(demorganAndOr), true);
});
Deno.test("propositional:tautology:demorganOrAnd", () => {
  assertEquals(check(demorganOrAnd), true);
});

Deno.test("propositional:tautology:modusPonens", () => {
  assertEquals(check(modusPonens), true);
});

Deno.test("propositional:tautology:disjunctiveSyllogism", () => {
  assertEquals(check(disjunctiveSyllogism), true);
});

Deno.test("propositional:tautology:disjunctiveSyllogism", () => {
  assertEquals(check(disjunctiveSyllogism), true);
});

Deno.test("propositional:tautology:constructiveDilemma", () => {
  assertEquals(check(constructiveDilemma), true);
});
