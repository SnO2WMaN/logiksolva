import { assertEquals } from "std/testing/asserts.ts";
import { affirmingConsequent, affirmingDisjunct, denyingAntecedent, fallancyFallancy } from "./fallancy.ts";
import { check } from "./mod.ts";

Deno.test("propositional:fallancy:affirmingConsequent", () => {
  assertEquals(check(affirmingConsequent), false);
});

Deno.test("propositional:fallancy:denyingAntecedent", () => {
  assertEquals(check(denyingAntecedent), false);
});

Deno.test("propositional:fallancy:affirmingDisjunct", () => {
  assertEquals(check(affirmingDisjunct), false);
});

Deno.test("propositional:fallancy:fallancyFallancy", () => {
  assertEquals(check(fallancyFallancy), false);
});
