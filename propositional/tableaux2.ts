import { assertEquals } from "std/testing/asserts.ts";
import { deepMerge } from "std/collections/mod.ts";
import { PropFormula } from "./types.ts";

export type TreeNode = { formula: PropFormula; eval: boolean };
export type PropsTable = Record<string, { 0?: true; 1?: true }>;

export const step = (t: TreeNode): {
  next: TreeNode[];
  skip: TreeNode[];
  props: PropsTable;
} => {
  if (t.formula.type === "PROP") {
    return {
      next: [{ ...t, eval: true }],
      skip: [],
      props: { [t.formula.id]: { 1: true } },
    };
  } else if (t.formula.type === "AND") {
    return {
      next: [
        { ...t, eval: true },
        { eval: false, formula: t.formula.left },
        { eval: false, formula: t.formula.right },
      ],
      skip: [],
      props: {},
    };
  } else if (t.formula.type === "OR") {
    return {
      next: [{ ...t, eval: true }],
      skip: [{ eval: false, formula: t.formula }],
      props: {},
    };
  } else if (t.formula.type === "IMPLICT") {
    return {
      next: [{ ...t, eval: true }],
      skip: [{
        eval: false,
        formula: { type: "OR", left: { type: "NOT", in: t.formula.left }, right: t.formula.right },
      }],
      props: {},
    };
  } else if (t.formula.type === "NOT" && t.formula.in.type === "PROP") {
    return {
      next: [{ ...t, eval: true }],
      skip: [],
      props: { [t.formula.in.id]: { 0: true } },
    };
  } else if (t.formula.type === "NOT" && t.formula.in.type === "OR") {
    return {
      next: [
        { ...t, eval: true },
        {
          eval: false,
          formula: {
            type: "AND",
            left: { type: "NOT", in: t.formula.in.left },
            right: { type: "NOT", in: t.formula.in.right },
          },
        },
      ],
      skip: [],
      props: {},
    };
  } else if (t.formula.type === "NOT" && t.formula.in.type === "AND") {
    return {
      next: [{ ...t, eval: true }],
      skip: [{
        eval: false,
        formula: {
          type: "OR",
          left: { type: "NOT", in: t.formula.in.left },
          right: { type: "NOT", in: t.formula.in.right },
        },
      }],
      props: {},
    };
  } else if (t.formula.type === "NOT" && t.formula.in.type === "IMPLICT") {
    return {
      next: [
        { ...t, eval: true },
        {
          eval: false,
          formula: { type: "AND", left: t.formula.in.left, right: { type: "NOT", in: t.formula.in.right } },
        },
      ],
      skip: [],
      props: {},
    };
  } else if (t.formula.type === "NOT" && t.formula.in.type === "NOT") {
    return {
      next: [
        { ...t, eval: true },
        { eval: false, formula: t.formula.in.in },
      ],
      skip: [],
      props: {},
    };
  }

  throw new Error("Something wrong");
};

Deno.test("propositional:tableaux:step:prop", () => {
  const actual = step({ eval: false, formula: { type: "PROP", id: "P" } });
  assertEquals(actual, {
    next: [{ eval: true, formula: { type: "PROP", id: "P" } }],
    skip: [],
    props: { "P": { 1: true } },
  });
});

Deno.test("propositional:tableaux:step:or", () => {
  const actual = step({
    eval: false,
    formula: {
      type: "OR",
      left: { type: "PROP", id: "P" },
      right: { type: "PROP", id: "Q" },
    },
  });
  assertEquals(actual, {
    next: [{ eval: true, formula: { type: "OR", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "Q" } } }],
    skip: [
      {
        eval: false,
        formula: { type: "OR", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "Q" } },
      },
    ],
    props: {},
  });
});

Deno.test("propositional:tableaux:step:and", () => {
  const actual = step({
    eval: false,
    formula: {
      type: "AND",
      left: { type: "PROP", id: "P" },
      right: { type: "PROP", id: "Q" },
    },
  });
  assertEquals(actual, {
    next: [
      { eval: true, formula: { type: "AND", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "Q" } } },
      { eval: false, formula: { type: "PROP", id: "P" } },
      { eval: false, formula: { type: "PROP", id: "Q" } },
    ],
    skip: [],
    props: {},
  });
});

Deno.test("propositional:tableaux:step:not_prop", () => {
  const actual = step({
    eval: false,
    formula: { type: "NOT", in: { type: "PROP", id: "P" } },
  });
  assertEquals(actual, {
    next: [{ eval: true, formula: { type: "NOT", in: { type: "PROP", id: "P" } } }],
    skip: [],
    props: { "P": { 0: true } },
  });
});

Deno.test("propositional:tableaux:step:not_not", () => {
  const actual = step({
    eval: false,
    formula: {
      type: "NOT",
      in: { type: "NOT", in: { type: "PROP", id: "P" } },
    },
  });
  assertEquals(actual, {
    next: [
      { eval: true, formula: { type: "NOT", in: { type: "NOT", in: { type: "PROP", id: "P" } } } },
      { eval: false, formula: { type: "PROP", id: "P" } },
    ],
    skip: [],
    props: {},
  });
});

Deno.test("propositional:tableaux:step:not_and", () => {
  // !(P && Q) => !P || !Q
  const actual = step({
    eval: false,
    formula: {
      type: "NOT",
      in: { type: "AND", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "Q" } },
    },
  });
  assertEquals(actual, {
    next: [{
      eval: true,
      formula: { type: "NOT", in: { type: "AND", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "Q" } } },
    }],
    skip: [
      {
        eval: false,
        formula: {
          type: "OR",
          left: { type: "NOT", in: { type: "PROP", id: "P" } },
          right: { type: "NOT", in: { type: "PROP", id: "Q" } },
        },
      },
    ],
    props: {},
  });
});

Deno.test("propositional:tableaux:step:not_or", () => {
  const actual = step({
    eval: false,
    formula: {
      type: "NOT",
      in: { type: "OR", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "Q" } },
    },
  });
  assertEquals(actual, {
    next: [
      {
        eval: true,
        formula: {
          type: "NOT",
          in: { type: "OR", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "Q" } },
        },
      },
      {
        eval: false,
        formula: {
          type: "AND",
          left: { type: "NOT", in: { type: "PROP", id: "P" } },
          right: { type: "NOT", in: { type: "PROP", id: "Q" } },
        },
      },
    ],
    skip: [],
    props: {},
  });
});

Deno.test("propositional:tableaux:step:not_impl", () => {
  const actual = step({
    eval: false,
    formula: {
      type: "NOT",
      in: { type: "IMPLICT", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "Q" } },
    },
  });
  assertEquals(actual, {
    next: [
      {
        eval: true,
        formula: {
          type: "NOT",
          in: { type: "IMPLICT", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "Q" } },
        },
      },
      {
        eval: false,
        formula: {
          type: "AND",
          left: { type: "PROP", id: "P" },
          right: { type: "NOT", in: { type: "PROP", id: "Q" } },
        },
      },
    ],
    skip: [],
    props: {},
  });
});

export const serialize = (t: TreeNode): {
  tree: TreeNode[];
  skip: TreeNode[];
  props: PropsTable;
} => {
  const { next, props, skip } = step(t);
  return next.reduce(
    ({ tree: pTree, props: pProps, skip: pSkip }, c) => {
      const { tree: cTree, skip: cSkip, props: cProps } = !c.eval ? serialize(c) : { tree: [c], skip: [], props: {} };
      return ({
        tree: [...pTree, ...cTree],
        skip: [...pSkip, ...cSkip],
        props: deepMerge(pProps, cProps),
      });
    },
    { tree: [] as TreeNode[], skip: skip, props },
  );
};

Deno.test("propositional:tableaux:serialize:and", () => {
  // 1-1. P && Q
  // 1-2. P
  // 1-3. Q
  const actual = serialize(
    { eval: false, formula: { type: "AND", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "Q" } } },
  );
  assertEquals(
    actual,
    {
      tree: [
        { eval: true, formula: { type: "AND", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "Q" } } },
        { eval: true, formula: { type: "PROP", id: "P" } },
        { eval: true, formula: { type: "PROP", id: "Q" } },
      ],
      skip: [],
      props: {
        P: { 1: true },
        Q: { 1: true },
      },
    },
  );
});

Deno.test("propositional:tableaux:serialize:double_and", () => {
  // 1-1. (P && Q) && (R && S)
  // 1-2. (P && Q)
  // 1-2-1. P
  // 1-2-2. Q
  // 1-3. (R && S)
  // 1-3-1. R
  // 1-3-2. S
  const actual = serialize(
    {
      eval: false,
      formula: {
        type: "AND",
        left: { type: "AND", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "Q" } },
        right: { type: "AND", left: { type: "PROP", id: "R" }, right: { type: "PROP", id: "S" } },
      },
    },
  );
  assertEquals(
    actual,
    {
      tree: [
        {
          eval: true,
          formula: {
            type: "AND",
            left: { type: "AND", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "Q" } },
            right: { type: "AND", left: { type: "PROP", id: "R" }, right: { type: "PROP", id: "S" } },
          },
        },
        { eval: true, formula: { type: "AND", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "Q" } } },
        { eval: true, formula: { type: "PROP", id: "P" } },
        { eval: true, formula: { type: "PROP", id: "Q" } },
        { eval: true, formula: { type: "AND", left: { type: "PROP", id: "R" }, right: { type: "PROP", id: "S" } } },
        { eval: true, formula: { type: "PROP", id: "R" } },
        { eval: true, formula: { type: "PROP", id: "S" } },
      ],
      skip: [],
      props: {
        P: { 1: true },
        Q: { 1: true },
        R: { 1: true },
        S: { 1: true },
      },
    },
  );
});

Deno.test("propositional:tableaux:serialize:or", () => {
  // 1-1s. P || Q
  const actual = serialize(
    {
      eval: false,
      formula: { type: "OR", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "Q" } },
    },
  );
  assertEquals(
    actual,
    {
      tree: [
        {
          eval: true,
          formula: { type: "OR", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "Q" } },
        },
      ],
      props: {},
      skip: [
        {
          eval: false,
          formula: { type: "OR", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "Q" } },
        },
      ],
    },
  );
});

Deno.test("propositional:tableaux:serialize:and_or", () => {
  // 1-1. P && (P || Q)
  // 1-2. P
  // 1-3s. P || Q
  const actual = serialize(
    {
      eval: false,
      formula: {
        type: "AND",
        left: { type: "PROP", id: "P" },
        right: { type: "OR", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "Q" } },
      },
    },
  );
  assertEquals(
    actual,
    {
      tree: [
        {
          eval: true,
          formula: {
            type: "AND",
            left: { type: "PROP", id: "P" },
            right: { type: "OR", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "Q" } },
          },
        },
        {
          eval: true,
          formula: { type: "PROP", id: "P" },
        },
        {
          eval: true,
          formula: { type: "OR", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "Q" } },
        },
      ],
      skip: [
        {
          eval: false,
          formula: { type: "OR", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "Q" } },
        },
      ],
      props: {
        P: { 1: true },
      },
    },
  );
});

console.dir(serialize(
  {
    eval: false,
    formula: {
      type: "AND",
      left: { type: "PROP", id: "P" },
      right: { type: "OR", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "Q" } },
    },
  },
));
