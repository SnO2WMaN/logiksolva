import { showInference } from "./inference.ts";
import { assertEquals } from "std/testing/asserts.ts";

Deno.test("showInference:⊨ P", () => {
  const actual = showInference({
    premise: [],
    consequence: ["PROP", "P"],
  });
  assertEquals(actual, "⊨ P");
});

Deno.test("showInference:P ⊨ Q", () => {
  const actual = showInference({
    premise: [
      ["PROP", "P"],
    ],
    consequence: ["PROP", "Q"],
  });
  assertEquals(actual, "P ⊨ Q");
});

Deno.test("showInference:P, P→Q ⊨ Q", () => {
  const actual = showInference({
    premise: [
      ["PROP", "P"],
      ["IMP", ["PROP", "P"], ["PROP", "Q"]],
    ],
    consequence: ["PROP", "Q"],
  });
  assertEquals(actual, "P, (P→Q) ⊨ Q");
});
