import { deepMerge } from "std/collections/mod.ts";
import { Or, PropFormula } from "./types.ts";

export type PropsTable = Record<string, { 0?: true; 1?: true }>;
export type Branch =
  | {
    nodes: PropFormula[];
    stack: PropFormula[];
    skip: (Or)[];
    props: PropsTable;
    valid?: boolean;
    left: null;
    right: null;
  }
  | {
    nodes: PropFormula[];
    stack: [];
    skip: [];
    props: PropsTable;
    valid?: boolean;
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
        valid: b.valid,
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
        valid: b.valid,
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
      valid: b.valid,
      left: toBranch({
        nodes: [],
        stack: [head.left],
        skip: rest,
        props: b.props,
        valid: b.valid,
        left: null,
        right: null,
      }),
      right: toBranch({
        nodes: [],
        stack: [head.right],
        skip: rest,
        props: b.props,
        valid: b.valid,
        left: null,
        right: null,
      }),
    };
  } else {
    return {
      ...b,
      valid: b.valid || Object.values(b.props).every((v) => !v["0"] || !v["1"]),
    };
  }
};

export const disassemblyFormula = (f: Exclude<PropFormula, Or>): { next: PropFormula[]; props: PropsTable } => {
  if (f.type === "AND") {
    return { next: [f.left, f.right], props: {} };
  } else if (f.type === "IMPLICT") {
    return { next: [{ type: "OR", left: { type: "NOT", in: f.left }, right: f.right }], props: {} };
  } else if (f.type === "EQ") {
    return {
      next: [{
        type: "OR",
        left: { type: "AND", left: f.left, right: f.right },
        right: { type: "AND", left: { type: "NOT", in: f.left }, right: { type: "NOT", in: f.right } },
      }],
      props: {},
    };
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
      case "EQ":
        return {
          next: [
            { type: "OR", left: f.in.left, right: f.in.right },
            { type: "OR", left: { type: "NOT", in: f.in.left }, right: { type: "NOT", in: f.in.right } },
          ],
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

export const createFirstBranch = (f: PropFormula) => ({
  stack: [f],
  nodes: [],
  skip: [],
  left: null,
  right: null,
  props: {},
});

export const checkValid = (b: Branch): boolean => {
  if (b.left && b.right) return checkValid(b.left) && checkValid(b.right);
  return b.valid === true;
};
