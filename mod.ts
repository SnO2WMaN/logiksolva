import { assertEquals } from "std/testing/asserts.ts";

type FormulaPart =
  | { type: "PROP"; id: string }
  | { type: "NOT"; include: FormulaPart }
  | { type: "AND"; left: FormulaPart; right: FormulaPart }
  | { type: "OR"; left: FormulaPart; right: FormulaPart }
  | { type: "IMPLICT"; left: FormulaPart; right: FormulaPart };

type TransformResult =
  | { transformed: true; to: FormulaPart }
  | { transformed: false };

const formula: FormulaPart = {
  type: "NOT",
  include: {
    type: "PROP",
    id: "P",
  },
};

// !!P = P
const notnot = (f: FormulaPart): TransformResult => {
  if (f.type === "NOT" && f.include.type === "NOT") return { transformed: true, to: f.include.include };
  return { transformed: false };
};

Deno.test("propositional:notnot:1", () => {
  // !!P = P
  const actual = notnot({ type: "NOT", include: { type: "NOT", include: { type: "PROP", id: "P" } } });
  const expected: TransformResult = {
    transformed: true,
    to: { type: "PROP", id: "P" },
  };
  assertEquals(
    actual,
    expected,
  );
});

Deno.test("propositional:notnot:2", () => {
  // !P nothing change
  const actual = notnot({ type: "NOT", include: { type: "PROP", id: "P" } });
  const expected: TransformResult = { transformed: false };
  assertEquals(
    actual,
    expected,
  );
});

// P -> Q = !P || Q
const convertImplict = (f: FormulaPart): TransformResult => {
  if (f.type === "IMPLICT") {
    return { transformed: true, to: { type: "OR", left: { type: "NOT", include: f.left }, right: f.right } };
  }
  return { transformed: false };
};

Deno.test("propositional:convertImplict:1", () => {
  // P -> Q = !P || Q
  const actual = convertImplict({
    type: "IMPLICT",
    left: { type: "PROP", id: "P" },
    right: { type: "PROP", id: "Q" },
  });
  const expected: TransformResult = {
    transformed: true,
    to: {
      type: "OR",
      left: { type: "NOT", include: { type: "PROP", id: "P" } },
      right: { type: "PROP", id: "Q" },
    },
  };
  assertEquals(
    actual,
    expected,
  );
});

// !(P && Q) = !P || !Q
const expandNotOr = (f: FormulaPart): TransformResult => {
  if (f.type === "NOT" && f.include.type === "AND") {
    return {
      transformed: true,
      to: {
        type: "OR",
        left: { type: "NOT", include: f.include.left },
        right: { type: "NOT", include: f.include.right },
      },
    };
  }
  return { transformed: false };
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
  const expected: TransformResult = {
    transformed: true,
    to: {
      type: "OR",
      left: { type: "NOT", include: { type: "PROP", id: "P" } },
      right: { type: "NOT", include: { type: "PROP", id: "Q" } },
    },
  };
  assertEquals(
    actual,
    expected,
  );
});

// !(P || Q) = !P && !Q
const expandNotAnd = (f: FormulaPart): TransformResult => {
  if (f.type === "NOT" && f.include.type === "OR") {
    return {
      transformed: true,
      to: {
        type: "AND",
        left: { type: "NOT", include: f.include.left },
        right: { type: "NOT", include: f.include.right },
      },
    };
  }
  return { transformed: false };
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
  const expected: TransformResult = {
    transformed: true,
    to: {
      type: "AND",
      left: { type: "NOT", include: { type: "PROP", id: "P" } },
      right: { type: "NOT", include: { type: "PROP", id: "Q" } },
    },
  };
  assertEquals(
    actual,
    expected,
  );
});
