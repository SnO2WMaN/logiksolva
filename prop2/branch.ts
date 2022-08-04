import { Implict, Or, Prop, PropFormula } from "./types.ts";
import { deepMerge } from "std/collections/mod.ts";

export type PropsTable = Record<string, { 0?: true; 1?: true }>;
export type Branch = {
  // nodes: PropFormula[];
  stack: PropFormula[];
  skip: (Or | Implict)[];
  props: PropsTable;
  junction: null | [Branch, Branch];
};

export const evalBranch = (b: Branch): Branch => {
  if (0 < b.stack.length) {
    const [f, ...rest] = b.stack;
    if (f[0] === "PROP") {
      // P
      return { stack: rest, skip: b.skip, props: deepMerge(b.props, { [f[1]]: { 1: true } }), junction: null };
    } else if (f[0] === "NOT" && f[1][0] === "PROP") {
      // ¬P
      return { stack: rest, skip: b.skip, props: deepMerge(b.props, { [f[1][1]]: { 0: true } }), junction: null };
    } else if (f[0] === "OR") {
      // P∨Q
      return { stack: rest, skip: [...b.skip, f], props: b.props, junction: null };
    } else {
      // P∧Q, ¬(P∧Q), ¬(P∨Q), ¬¬P
      return { stack: [...rest, ...evalFormula(f)], skip: b.skip, props: b.props, junction: null };
    }
  } else if (0 < b.skip.length) {
    // P∨Q
    const [f, ...rest] = b.skip;
    return {
      stack: [],
      skip: [],
      props: b.props,
      junction: [
        evalBranch({ stack: [f[1]], skip: rest, props: b.props, junction: null }),
        evalBranch({ stack: [f[2]], skip: rest, props: b.props, junction: null }),
      ],
    };
  } else {
    return b;
  }
};

export const evalFormula = (f: Exclude<PropFormula, Prop | Or>): PropFormula[] => {
  switch (f[0]) {
    case "AND":
      return [f[1], f[2]];
    case "NOT": {
      switch (f[1][0]) {
        case "NOT":
          return [f[1][1]];
        case "AND":
          return [["OR", f[1][1], f[1][2]]];
        case "OR":
          return [f[1][1], f[1][2]];
      }
    }
  }
  throw new Error("Must not be reached");
};
