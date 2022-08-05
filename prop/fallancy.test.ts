import { assertEquals } from "std/testing/asserts.ts";
import { evalBranch } from "./branch.ts";
import { affirmingConsequent, affirmingDisjunct, denyingAntecedent, fallancyFallancy } from "./fallancy.ts";
import { findTopOrBot } from "./find_top_or_bot.ts";
import { PropFormula } from "./types.ts";

const isNotValid = (f: PropFormula) =>
  (findTopOrBot(evalBranch({ stack: [["NOT", f]], nodes: [], skip: [], props: {}, junction: null }))) === true;

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
