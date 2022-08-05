import { assertEquals } from "std/testing/asserts.ts";
import { affirmingConsequent, affirmingDisjunct, denyingAntecedent, fallancyFallancy } from "./fallancy.ts";
import { isValid } from "./is_valid.ts";

Deno.test("fallancy:affirmingConsequent", () => {
  assertEquals(isValid(affirmingConsequent), false);
});

Deno.test("fallancy:denyingAntecedent", () => {
  assertEquals(isValid(denyingAntecedent), false);
});

Deno.test("fallancy:affirmingDisjunct", () => {
  assertEquals(isValid(affirmingDisjunct), false);
});

Deno.test("fallancy:fallancyFallancy", () => {
  assertEquals(isValid(fallancyFallancy), false);
});
