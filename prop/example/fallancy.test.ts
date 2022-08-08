import { assertEquals } from "std/testing/asserts.ts";
import { evalBranch } from "../branch.ts";
import { findTB } from "../find_tb.ts";
import { PropFormula } from "../types.ts";
import { affirmingConsequent, affirmingDisjunct, denyingAntecedent, fallancyFallancy } from "./fallancy.ts";

const isNotValid = (f: PropFormula) =>
  (findTB(evalBranch({ stack: [["NOT", f]], nodes: [], skip: [], props: {}, junction: null }), "TOP")) === true;

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
