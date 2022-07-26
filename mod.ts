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

// !!P = P
const notnot = (f: FormulaPart): FormulaPart => {
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

// P -> Q = !P || Q
const convertImplict = (f: FormulaPart): FormulaPart => {
  if (f.type === "IMPLICT") return { type: "OR", left: { type: "NOT", include: f.left }, right: f.right };
  return f;
};

Deno.test("propositional:convertImplict:1", () => {
  // P -> Q = !P || Q
  const actual = convertImplict({
    type: "IMPLICT",
    left: { type: "PROP", id: "P" },
    right: { type: "PROP", id: "Q" },
  });
  const expected: FormulaPart = {
    type: "OR",
    left: { type: "NOT", include: { type: "PROP", id: "P" } },
    right: { type: "PROP", id: "Q" },
  };
  assertEquals(
    actual,
    expected,
  );
});

// !(P && Q) = !P || !Q
const expandNotOr = (f: FormulaPart): FormulaPart => {
  if (f.type === "NOT" && f.include.type === "AND") {
    return {
      type: "OR",
      left: { type: "NOT", include: f.include.left },
      right: { type: "NOT", include: f.include.right },
    };
  }
  return f;
};
Deno.test("propositional:expandNotOr:1", () => {
  // !(P && Q) = !P || !Q
  const actual = expandNotOr({
    type: "NOT",
    include: {
      type: "AND",
      left: { type: "PROP", id: "P" },
      right: { type: "PROP", id: "Q" },
    },
  });
  const expected: FormulaPart = {
    type: "OR",
    left: { type: "NOT", include: { type: "PROP", id: "P" } },
    right: { type: "NOT", include: { type: "PROP", id: "Q" } },
  };
  assertEquals(
    actual,
    expected,
  );
});

// !(P || Q) = !P && !Q
const expandNotAnd = (f: FormulaPart): FormulaPart => {
  if (f.type === "NOT" && f.include.type === "OR") {
    return {
      type: "AND",
      left: { type: "NOT", include: f.include.left },
      right: { type: "NOT", include: f.include.right },
    };
  }
  return f;
};
Deno.test("propositional:expandNotAnd:1", () => {
  // !(P || Q) = !P && !Q
  const actual = expandNotAnd({
    type: "NOT",
    include: {
      type: "OR",
      left: { type: "PROP", id: "P" },
      right: { type: "PROP", id: "Q" },
    },
  });
  const expected: FormulaPart = {
    type: "AND",
    left: { type: "NOT", include: { type: "PROP", id: "P" } },
    right: { type: "NOT", include: { type: "PROP", id: "Q" } },
  };
  assertEquals(
    actual,
    expected,
  );
});
