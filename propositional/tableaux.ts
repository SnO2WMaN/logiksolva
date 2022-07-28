import { deepMerge } from "std/collections/mod.ts";
import { assertEquals } from "std/testing/asserts.ts";
import { Not, Or, PararellStep, Prop, PropFormula, SerialStep, Tableau, TransformStep } from "./types.ts";

type TransformResult =
  | { transformed: true; to: PropFormula }
  | { transformed: false };

// !!P = P
const removeNotNot = (f: PropFormula): TransformResult =>
  f.type === "NOT" && f.in.type === "NOT" ? { transformed: true, to: f.in.in } : { transformed: false };

Deno.test("propositional:notnot:1", () => {
  // !!P = P
  const actual = removeNotNot({ type: "NOT", in: { type: "NOT", in: { type: "PROP", id: "P" } } });
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
  const actual = removeNotNot({ type: "NOT", in: { type: "PROP", id: "P" } });
  const expected: TransformResult = { transformed: false };
  assertEquals(
    actual,
    expected,
  );
});

// P -> Q = !P || Q
const removeImplict = (f: PropFormula): TransformResult =>
  f.type === "IMPLICT"
    ? { transformed: true, to: { type: "OR", left: { type: "NOT", in: f.left }, right: f.right } }
    : { transformed: false };

Deno.test("propositional:convertImplict:1", () => {
  // P -> Q = !P || Q
  const actual = removeImplict({
    type: "IMPLICT",
    left: { type: "PROP", id: "P" },
    right: { type: "PROP", id: "Q" },
  });
  const expected: TransformResult = {
    transformed: true,
    to: {
      type: "OR",
      left: { type: "NOT", in: { type: "PROP", id: "P" } },
      right: { type: "PROP", id: "Q" },
    },
  };
  assertEquals(
    actual,
    expected,
  );
});

// !(P && Q) = !P || !Q
const expandNotOr = (f: PropFormula): TransformResult => {
  return f.type === "NOT" && f.in.type === "AND"
    ? {
      transformed: true,
      to: {
        type: "OR",
        left: { type: "NOT", in: f.in.left },
        right: { type: "NOT", in: f.in.right },
      },
    }
    : { transformed: false };
};
Deno.test("propositional:expandNotOr:1", () => {
  // !(P && Q) = !P || !Q
  const actual = expandNotOr({
    type: "NOT",
    in: {
      type: "AND",
      left: { type: "PROP", id: "P" },
      right: { type: "PROP", id: "Q" },
    },
  });
  const expected: TransformResult = {
    transformed: true,
    to: {
      type: "OR",
      left: { type: "NOT", in: { type: "PROP", id: "P" } },
      right: { type: "NOT", in: { type: "PROP", id: "Q" } },
    },
  };
  assertEquals(actual, expected);
});

// !(P || Q) = !P && !Q
const expandNotAnd = (f: PropFormula): TransformResult => {
  return f.type === "NOT" && f.in.type === "OR"
    ? {
      transformed: true,
      to: {
        type: "AND",
        left: { type: "NOT", in: f.in.left },
        right: { type: "NOT", in: f.in.right },
      },
    }
    : { transformed: false };
};
Deno.test("propositional:expandNotAnd:1", () => {
  // !(P || Q) => !P && !Q
  const actual = expandNotAnd({
    type: "NOT",
    in: {
      type: "OR",
      left: { type: "PROP", id: "P" },
      right: { type: "PROP", id: "Q" },
    },
  });
  const expected: TransformResult = {
    transformed: true,
    to: {
      type: "AND",
      left: { type: "NOT", in: { type: "PROP", id: "P" } },
      right: { type: "NOT", in: { type: "PROP", id: "Q" } },
    },
  };
  assertEquals(
    actual,
    expected,
  );
});

// !(P -> Q) = P && !Q
const expandNotImplict = (f: PropFormula): TransformResult => {
  if (f.type === "NOT" && f.in.type === "IMPLICT") {
    return {
      transformed: true,
      to: {
        type: "AND",
        left: f.in.left,
        right: { type: "NOT", in: f.in.right },
      },
    };
  }
  return { transformed: false };
};

const mkSerial = (f: PropFormula, steps: TransformStep[] = []): TransformStep[] => {
  const notAnd = expandNotAnd(f);
  if (notAnd.transformed) {
    return mkSerial(
      notAnd.to,
      [...steps, { type: "SERIAL", formula: f }],
    );
  }
  const notOr = expandNotOr(f);
  if (notOr.transformed) {
    return mkSerial(
      notOr.to,
      [...steps, { type: "SERIAL", formula: f }],
    );
  }
  const notImpl = expandNotImplict(f);
  if (notImpl.transformed) {
    return mkSerial(
      notImpl.to,
      [...steps, { type: "SERIAL", formula: f }],
    );
  }
  const nn = removeNotNot(f);
  if (nn.transformed) {
    return mkSerial(
      nn.to,
      [...steps, { type: "SERIAL", formula: f }],
    );
  }
  const impl = removeImplict(f);
  if (impl.transformed) {
    return mkSerial(
      impl.to,
      [...steps, { type: "SERIAL", formula: f }],
    );
  }
  switch (f.type) {
    case "AND":
      return [...steps, { type: "SERIAL", formula: f }, ...mkSerial(f.left, []), ...mkSerial(f.right, [])];
    default:
      return [...steps, { type: "SERIAL", formula: f }];
  }
};
const mkPararell = (l: TransformStep[]): TransformStep[] => {
  const notOrs = l.filter((v): v is TransformStep<Exclude<PropFormula, Or>> => v.formula.type !== "OR");
  const ors = l.filter((v): v is TransformStep<Or> => v.formula.type === "OR");

  const [firstOr, ...orRest] = ors;
  if (!firstOr) return [...notOrs];

  return [
    ...notOrs,
    {
      type: "PARARELL",
      formula: firstOr.formula,
      left: [...mkSerial(firstOr.formula.left, []), ...mkPararell(orRest)],
      right: [...mkSerial(firstOr.formula.right, []), ...mkPararell(orRest)],
    },
  ];
};
export const generateTableau = (f: PropFormula): Tableau => mkPararell(mkSerial(f));

export type PropsTable = Record<string, { t?: true; b?: true }>;
export const generatePropsTable = (p: TransformStep[], prev: PropsTable): PropsTable[] => {
  const props = p.filter((step): step is SerialStep<Prop | Not> =>
    step.type === "SERIAL" &&
    (step.formula.type === "PROP" || (step.formula.type === "NOT" && step.formula.in.type === "PROP"))
  ).map(({ formula }) =>
    formula.type === "NOT"
      ? { [(formula.in as Prop).id]: { b: true as const } }
      : { [formula.id]: { t: true as const } }
  ).reduce((p: PropsTable, c) => deepMerge(p, c), {} as PropsTable);
  const prl = p.find((step): step is PararellStep => step.type === "PARARELL");
  if (prl) {
    return [
      ...generatePropsTable(prl.right, deepMerge(prev, props)),
      ...generatePropsTable(prl.left, deepMerge(prev, props)),
    ];
  }

  return [deepMerge(prev, props)];
};
