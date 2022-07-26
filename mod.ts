import { assertEquals } from "std/testing/asserts.ts";

type FormulaPart =
  | { type: "PROP"; id: string }
  | { type: "NOT"; include: FormulaPart }
  | { type: "AND"; left: FormulaPart; right: FormulaPart }
  | { type: "OR"; left: FormulaPart; right: FormulaPart }
  | { type: "IMPLICT"; left: FormulaPart; right: FormulaPart };

const formula: FormulaPart = {
  type: "NOT",
  include: {
    type: "PROP",
    id: "P",
  },
};

const notnot = (f: FormulaPart) => {
  if (f.type === "NOT" && f.include.type === "NOT") return f.include.include;
  return f;
};

Deno.test("propositional:notnot:1", () => {
  // !!P = P
  const actual = notnot({ type: "NOT", include: { type: "NOT", include: { type: "PROP", id: "P" } } });
  const expected: FormulaPart = { type: "PROP", id: "P" };
  assertEquals(
    actual,
    expected,
  );
});

Deno.test("propositional:notnot:2", () => {
  // !P nothing change
  const actual = notnot({ type: "NOT", include: { type: "PROP", id: "P" } });
  const expected: FormulaPart = { type: "NOT", include: { type: "PROP", id: "P" } };
  assertEquals(
    actual,
    expected,
  );
});
