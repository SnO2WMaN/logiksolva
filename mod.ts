import { assertEquals } from "std/testing/asserts.ts";
import { deepMerge } from "std/collections/mod.ts";
import { bold } from "std/fmt/colors.ts";

type PropFormula = { type: "PROP"; id: string };
type NotFormula = { type: "NOT"; include: FormulaPart };
type AndFormula = { type: "AND"; left: FormulaPart; right: FormulaPart };
type ImplictFormula = { type: "IMPLICT"; left: FormulaPart; right: FormulaPart };
type OrFormula = { type: "OR"; left: FormulaPart; right: FormulaPart };

type FormulaPart =
  | PropFormula
  | NotFormula
  | AndFormula
  | OrFormula
  | ImplictFormula;

type TransformResult =
  | { transformed: true; to: FormulaPart }
  | { transformed: false };

// !!P = P
const removeNotNot = (f: FormulaPart): TransformResult => {
  if (f.type === "NOT" && f.include.type === "NOT") return { transformed: true, to: f.include.include };
  return { transformed: false };
};

Deno.test("propositional:notnot:1", () => {
  // !!P = P
  const actual = removeNotNot({ type: "NOT", include: { type: "NOT", include: { type: "PROP", id: "P" } } });
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
  const actual = removeNotNot({ type: "NOT", include: { type: "PROP", id: "P" } });
  const expected: TransformResult = { transformed: false };
  assertEquals(
    actual,
    expected,
  );
});

// P -> Q = !P || Q
const removeImplict = (f: FormulaPart): TransformResult => {
  if (f.type === "IMPLICT") {
    return { transformed: true, to: { type: "OR", left: { type: "NOT", include: f.left }, right: f.right } };
  }
  return { transformed: false };
};

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

type SerialStep<f extends FormulaPart = FormulaPart> = {
  type: "SERIAL";
  formula: f;
};
type PararellStep<f extends FormulaPart = FormulaPart> = {
  type: "PARARELL";
  formula: f;
  left: TransformStep[];
  right: TransformStep[];
};

type TransformStep<f extends FormulaPart = FormulaPart> =
  | SerialStep<f>
  | PararellStep<f>;
const mkSerial = (f: FormulaPart, steps: TransformStep[] = []): TransformStep[] => {
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

// showSerial(step({ type: "NOT", include: formula2 }, []), 0);

// const getProps = (steps: TransformStep[]) => {
//   const [first, ...rest] = steps;
//   console.dir(first);
//   console.dir(rest);
//   if (first.type === "SERIAL" && first.formula.type === "PROP") {
//     return ({ [first.formula.id]: { t: true } });
//   }
// };
// console.dir(getProps(step({ type: "NOT", include: formula2 }, [])));

const mkPararell = (l: TransformStep[]): TransformStep[] => {
  const notOrs = l.filter((v): v is TransformStep<Exclude<FormulaPart, OrFormula>> => v.formula.type !== "OR");
  const ors = l.filter((v): v is TransformStep<OrFormula> => v.formula.type === "OR");

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

const showSerial = (steps: TransformStep[], nest = 0) => {
  steps.map((step, i) => {
    console.log(`${" ".repeat(nest)}${i}:${show(step.formula)}`);
    if (step.type === "PARARELL") {
      showSerial(step.left, nest + 1);
      console.log(`${" ".repeat(nest + 1)}-`);
      showSerial(step.right, nest + 1);
    }
  });
};

type PropsTable = Record<string, { t?: true; b?: true }>;
const generatePropsTable = (p: TransformStep[], prev: PropsTable): PropsTable[] => {
  const props = p.filter((step): step is SerialStep<PropFormula | NotFormula> =>
    step.type === "SERIAL" &&
    (step.formula.type === "PROP" || (step.formula.type === "NOT" && step.formula.include.type === "PROP"))
  ).map(({ formula }) =>
    formula.type === "NOT"
      ? { [(formula.include as PropFormula).id]: { b: true as const } }
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

const check = (f: FormulaPart) => {
  return generatePropsTable(mkPararell(mkSerial({ type: "NOT", include: f })), {})
    .every((t) => Object.values(t).some(({ t, b }) => t && b));
};
const print = (f: FormulaPart) => {
  console.log(`${bold(show(f))} is ${check(f) ? "valid" : "invalid"}`);
  showSerial(mkPararell(mkSerial({ type: "NOT", include: f })));
};

// |= (P && (P -> Q)) -> !!Q
print({
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
});
print(
  // |= (P || (Q && R)) -> ((P||Q)&&(P||R))
  {
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
  },
);
print(
  // |= (A -> B) -> ((B -> C) -> (A -> C))
  {
    type: "IMPLICT",
    left: {
      type: "IMPLICT",
      left: { type: "PROP", id: "A" },
      right: { type: "PROP", id: "B" },
    },
    right: {
      type: "IMPLICT",
      left: {
        type: "IMPLICT",
        left: { type: "PROP", id: "B" },
        right: { type: "PROP", id: "C" },
      },
      right: {
        type: "IMPLICT",
        left: { type: "PROP", id: "A" },
        right: { type: "PROP", id: "C" },
      },
    },
  },
);
print(
  // |= (A -> B) -> ((B -> C) -> (A -> C))
  {
    type: "IMPLICT",
    left: {
      type: "IMPLICT",
      left: {
        type: "IMPLICT",
        left: { type: "PROP", id: "A" },
        right: { type: "PROP", id: "B" },
      },
      right: {
        type: "PROP",
        id: "B",
      },
    },
    right: {
      type: "PROP",
      id: "A",
    },
  },
);
