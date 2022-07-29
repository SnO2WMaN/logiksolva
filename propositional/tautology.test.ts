import { assertEquals } from "https://deno.land/std@0.118.0/testing/asserts.ts";
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
  assertEquals(true, check(associativeAnd));
});
Deno.test("propositional:tautology:associativeOr", () => {
  assertEquals(true, check(associativeOr));
});

Deno.test("propositional:tautology:commutativeAnd", () => {
  assertEquals(true, check(commutativeAnd));
});
Deno.test("propositional:tautology:commutativeOr", () => {
  assertEquals(true, check(commutativeOr));
});

Deno.test("propositional:tautology:absorptiveAndOr", () => {
  assertEquals(true, check(absorptiveAndOr));
});
Deno.test("propositional:tautology:absorptiveOrAnd", () => {
  assertEquals(true, check(absorptiveOrAnd));
});

Deno.test("propositional:tautology:idempotentAnd", () => {
  assertEquals(true, check(idempotentAnd));
});
Deno.test("propositional:tautology:idempotentOr", () => {
  assertEquals(true, check(idempotentOr));
});

Deno.test("propositional:tautology:simplificationLeft", () => {
  assertEquals(true, check(simplificationLeft));
});
Deno.test("propositional:tautology:simplificationRight", () => {
  assertEquals(true, check(simplificationRight));
});

Deno.test("propositional:tautology:additionLeft", () => {
  assertEquals(true, check(additionLeft));
});
Deno.test("propositional:tautology:additionRight", () => {
  assertEquals(true, check(additionRight));
});

Deno.test("propositional:tautology:distributiveAndOr", () => {
  assertEquals(true, check(distributiveAndOr));
});
Deno.test("propositional:tautology:distributiveOrAnd", () => {
  assertEquals(true, check(distributiveOrAnd));
});

Deno.test("propositional:tautology:transitive", () => {
  assertEquals(true, check(distributiveAndOr));
});

Deno.test("propositional:tautology:identity", () => {
  assertEquals(true, check(distributiveAndOr));
});

Deno.test("propositional:tautology:contraposition", () => {
  assertEquals(true, check(contraposition));
});

Deno.test("propositional:tautology:doubleNegation", () => {
  assertEquals(true, check(doubleNegation));
});

Deno.test("propositional:tautology:excludeMiddle", () => {
  assertEquals(true, check(excludeMiddle));
});

Deno.test("propositional:tautology:nonContradiction", () => {
  assertEquals(true, check(nonContradiction));
});

Deno.test("propositional:tautology:importation", () => {
  assertEquals(true, check(importation));
});

Deno.test("propositional:tautology:exportation", () => {
  assertEquals(true, check(exportation));
});

Deno.test("propositional:tautology:demorganAndOr", () => {
  assertEquals(true, check(demorganAndOr));
});
Deno.test("propositional:tautology:demorganOrAnd", () => {
  assertEquals(true, check(demorganOrAnd));
});

Deno.test("propositional:tautology:modusPonens", () => {
  assertEquals(true, check(modusPonens));
});

Deno.test("propositional:tautology:disjunctiveSyllogism", () => {
  assertEquals(true, check(disjunctiveSyllogism));
});

Deno.test("propositional:tautology:disjunctiveSyllogism", () => {
  assertEquals(true, check(disjunctiveSyllogism));
});

Deno.test("propositional:tautology:constructiveDilemma", () => {
  assertEquals(true, check(constructiveDilemma));
});
