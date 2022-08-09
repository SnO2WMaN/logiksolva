import { assertEquals } from "std/testing/asserts.ts";
import { evalTableau, hasTop } from "../tableau.ts";
import { PropFormula } from "../types.ts";
import { affirmingConsequent, affirmingDisjunct, denyingAntecedent, fallancyFallancy } from "./fallancy.ts";

const isNotValid = (f: PropFormula) =>
  (hasTop(evalTableau({ stack: [["NOT", f]], nodes: [], skip: [], junction: null, prev: [] }))) === true;

Deno.test("fallancy:affirmingConsequent", () => {
  assertEquals(isNotValid(affirmingConsequent), true);
});

Deno.test("fallancy:denyingAntecedent", () => {
  assertEquals(isNotValid(denyingAntecedent), true);
});

Deno.test("fallancy:affirmingDisjunct", () => {
  assertEquals(isNotValid(affirmingDisjunct), true);
});

Deno.test("fallancy:fallancyFallancy", () => {
  assertEquals(isNotValid(fallancyFallancy), true);
});
