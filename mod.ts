import { assertEquals } from "std/testing/asserts.ts";
import { deepMerge } from "std/collections/mod.ts";

type FormulaPart =
  | { type: "PROP"; id: string }
  | { type: "NOT"; include: FormulaPart }
  | { type: "AND"; left: FormulaPart; right: FormulaPart }
  | { type: "OR"; left: FormulaPart; right: FormulaPart }
  | { type: "IMPLICT"; left: FormulaPart; right: FormulaPart };

type TransformResult =
  | { transformed: true; to: FormulaPart }
  | { transformed: false };

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

// !(P -> Q) = P && !Q
const expandNotImplict = (f: FormulaPart): TransformResult => {
  if (f.type === "NOT" && f.include.type === "IMPLICT") {
    return {
      transformed: true,
      to: {
        type: "AND",
        left: f.include.left,
        right: { type: "NOT", include: f.include.right },
      },
    };
  }
  return { transformed: false };
};

const show = (f: FormulaPart): string => {
  switch (f.type) {
    case "PROP":
      return f.id;
    case "NOT":
      return `¬${show(f.include)}`;
    case "AND":
      return `(${show(f.left)}∧${show(f.right)})`;
    case "OR":
      return `(${show(f.left)}∨${show(f.right)})`;
    case "IMPLICT":
      return `(${show(f.left)}→${show(f.right)})`;
  }
};

type TransformStep =
  | { type: "SERIAL"; formula: FormulaPart }
  | { type: "PARARELL"; leftF: TransformStep[]; rightF: TransformStep[] };
const step = (f: FormulaPart, steps: TransformStep[]): TransformStep[] => {
  const nn = notnot(f);
  if (nn.transformed) {
    return step(nn.to, [
      ...steps,
      { type: "SERIAL", formula: f },
    ]);
  }
  const exImpl = convertImplict(f);
  if (exImpl.transformed) {
    return step(exImpl.to, [
      ...steps,
      { type: "SERIAL", formula: f },
    ]);
  }

  const exnotand = expandNotAnd(f);
  if (exnotand.transformed) {
    return step(exnotand.to, [
      ...steps,
      { type: "SERIAL", formula: f },
    ]);
  }

  const exnotor = expandNotOr(f);
  if (exnotor.transformed) {
    return step(exnotor.to, [
      ...steps,
      { type: "SERIAL", formula: f },
    ]);
  }
  const exnotimpl = expandNotImplict(f);
  if (exnotimpl.transformed) {
    return step(exnotimpl.to, [
      ...steps,
      { type: "SERIAL", formula: f },
    ]);
  }

  switch (f.type) {
    case "AND":
    case "OR":
    case "IMPLICT":
      return [
        ...steps,
        {
          type: "SERIAL",
          formula: f,
        },
        {
          type: "PARARELL",
          leftF: step(f.left, []),
          rightF: step(f.right, []),
        },
      ];
    default:
      return [
        ...steps,
        { type: "SERIAL", formula: f },
      ];
  }
};

// (P /\ (P -> Q)) -> Q
const formula: FormulaPart = {
  type: "IMPLICT",
  left: {
    type: "AND",
    left: { type: "PROP", id: "P" },
    right: {
      type: "IMPLICT",
      left: { type: "PROP", id: "P" },
      right: { type: "PROP", id: "Q" },
    },
  },
  right: { type: "NOT", include: { type: "NOT", include: { type: "PROP", id: "Q" } } },
};
// (P || (Q && R)) -> ((P||Q)&&(P||R))
const formula2: FormulaPart = {
  type: "IMPLICT",
  left: {
    type: "OR",
    left: { type: "PROP", id: "P" },
    right: {
      type: "AND",
      left: { type: "PROP", id: "Q" },
      right: { type: "PROP", id: "R" },
    },
  },
  right: {
    type: "AND",
    left: { type: "OR", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "Q" } },
    right: { type: "OR", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "R" } },
  },
};

const showSerial = (steps: TransformStep[], nest: number) => {
  steps.forEach((step, i) => {
    switch (step.type) {
      case "SERIAL":
        console.log([
          "│".repeat(nest),
          steps.length === 1 ? "└" : "├",
          `${nest + 1}-${i + 1}: ${show(step.formula)}`,
        ].join(""));
        break;
      case "PARARELL":
        showSerial(step.leftF, nest + 1);
        showSerial(step.rightF, nest + 1);
        break;
    }
  });
};
showSerial(step({ type: "NOT", include: formula2 }, []), 0);

const getProps = (steps: TransformStep[]): Record<string, unknown> => {
  const ls = steps.at(-1);
  if (!ls) return {};
  switch (ls.type) {
    case "PARARELL":
      return deepMerge(getProps(ls.leftF), getProps(ls.rightF));
    case "SERIAL":
      if (ls.formula.type === "PROP") {
        return { [ls.formula.id]: { t: true } };
      }
      if (ls.formula.type === "NOT" && ls.formula.include.type === "PROP") {
        return { [ls.formula.include.id]: { b: true } };
      }
      return {};
  }
};
console.dir(getProps(step({ type: "NOT", include: formula2 }, [])));
