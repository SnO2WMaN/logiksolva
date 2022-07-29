import { deepMerge } from "std/collections/mod.ts";
import { Or, PropFormula } from "./types.ts";

export type Branch =
  | {
    nodes: PropFormula[];
    stack: PropFormula[];
    skip: (Or)[];
    props: PropsTable;
    left: null;
    right: null;
  }
  | {
    nodes: PropFormula[];
    stack: [];
    skip: [];
    props: PropsTable;
    left: Branch;
    right: Branch;
  };

export const toBranch = (b: Branch): Branch => {
  if (0 < b.stack.length) {
    const [head, ...rest] = b.stack;
    if (head.type === "OR") {
      return toBranch({
        nodes: [...b.nodes],
        stack: rest,
        skip: [...b.skip, head],
        props: b.props,
        left: null,
        right: null,
      });
    } else {
      const { next, props } = disassemblyFormula(head);
      return toBranch({
        nodes: [...b.nodes, head],
        stack: [...rest, ...next],
        skip: b.skip,
        props: deepMerge(b.props, props),
        left: null,
        right: null,
      });
    }
  } else if (0 < b.skip.length) {
    const [head, ...rest] = b.skip;
    return {
      nodes: [...b.nodes, head],
      stack: [],
      skip: [],
      props: b.props,
      left: toBranch({ nodes: [], stack: [head.left], skip: rest, props: b.props, left: null, right: null }),
      right: toBranch({ nodes: [], stack: [head.right], skip: rest, props: b.props, left: null, right: null }),
    };
  } else {
    return b;
  }
};

export const disassemblyFormula = (f: Exclude<PropFormula, Or>): { next: PropFormula[]; props: PropsTable } => {
  if (f.type === "AND") {
    return { next: [f.left, f.right], props: {} };
  } else if (f.type === "IMPLICT") {
    return { next: [{ type: "OR", left: { type: "NOT", in: f.left }, right: f.right }], props: {} };
  } else if (f.type === "NOT") {
    switch (f.in.type) {
      case "NOT":
        return { next: [f.in.in], props: {} };
      case "OR":
        return {
          next: [{ type: "NOT", in: f.in.left }, { type: "NOT", in: f.in.right }],
          props: {},
        };
      case "AND":
        return {
          next: [{ type: "OR", left: { type: "NOT", in: f.in.left }, right: { type: "NOT", in: f.in.right } }],
          props: {},
        };
      case "IMPLICT":
        return {
          next: [f.in.left, { type: "NOT", in: f.in.right }],
          props: {},
        };
      case "PROP":
        return {
          next: [],
          props: { [f.in.id]: { 0: true } },
        };
    }
  } else {
    return {
      next: [],
      props: { [f.id]: { 1: true } },
    };
  }
};

export type TreeNode<F extends PropFormula = PropFormula> = { eval: boolean; formula: F };
export type PropsTable = Record<string, { 0?: true; 1?: true }>;

export const step = (t: TreeNode): {
  next: TreeNode[];
  skip: TreeNode<Or>[];
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

export const serialize = (t: TreeNode): {
  tree: TreeNode[];
  skip: TreeNode<Or>[];
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

const paral = (f: PropFormula) => {
  const { tree, props, skip } = serialize({ eval: false, formula: f });
  console.dir(skip.map((s) => [
    serialize({ eval: false, formula: s.formula.left }),
    serialize({ eval: false, formula: s.formula.right }),
  ]));
};
paral({
  type: "AND",
  left: { type: "PROP", id: "P" },
  right: { type: "OR", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "Q" } },
});

console.dir(
  toBranch({
    nodes: [],
    stack: [
      {
        type: "AND",
        left: { type: "OR", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "Q" } },
        right: { type: "OR", left: { type: "PROP", id: "R" }, right: { type: "PROP", id: "S" } },
      },
    ],
    skip: [],
    left: null,
    right: null,
    props: {},
  }),
  { depth: Number.MAX_SAFE_INTEGER },
);

console.dir(
  toBranch({
    nodes: [],
    stack: [
      {
        type: "NOT",
        in: {
          type: "AND",
          left: { type: "OR", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "Q" } },
          right: { type: "OR", left: { type: "PROP", id: "R" }, right: { type: "PROP", id: "S" } },
        },
      },
    ],
    skip: [],
    left: null,
    right: null,
    props: {},
  }),
  { depth: Number.MAX_SAFE_INTEGER },
);
