import { deepMerge } from "std/collections/mod.ts";
import { Eq, Imp, Or, Prop, PropFormula } from "./types.ts";

export type PropsTable = Record<string, { 0?: true; 1?: true }>;
export type Branch = {
  nodes: PropFormula[];
  stack: PropFormula[];
  skip: (Or | Imp | Eq)[];
  props: PropsTable;
  junction: null | [Branch, Branch];
};

export const evalBranch = (b: Branch): Branch => {
  if (0 < b.stack.length) {
    const [f, ...rest] = b.stack;
    if (f[0] === "PROP") {
      // P
      return evalBranch({
        nodes: [...b.nodes, f],
        stack: rest,
        skip: b.skip,
        props: deepMerge(b.props, { [f[1]]: { 1: true } }),
        junction: null,
      });
    } else if (f[0] === "NOT" && f[1][0] === "PROP") {
      // ¬P
      return evalBranch({
        nodes: [...b.nodes, f],
        stack: rest,
        skip: b.skip,
        props: deepMerge(b.props, { [f[1][1]]: { 0: true } }),
        junction: null,
      });
    } else if (f[0] === "TOP" || f[0] === "BOT") {
      // ⊤, ⊥
      return evalBranch({
        nodes: [...b.nodes, f],
        stack: rest,
        skip: b.skip,
        props: b.props,
        junction: null,
      });
    } else if (f[0] === "OR" || f[0] === "IMP" || f[0] === "EQ") {
      // P∨Q, P→Q(=¬P∨Q), P↔Q(=(P∧Q)∨(¬P∨¬Q))
      return evalBranch({
        nodes: [...b.nodes, f],
        stack: rest,
        skip: [...b.skip, f],
        props: b.props,
        junction: null,
      });
    } else {
      // P∧Q, ¬¬P, ¬(P∧Q), ¬(P∨Q), ¬(P→Q), ¬(P↔Q)
      return evalBranch({
        nodes: [...b.nodes, f],
        stack: [...rest, ...evalFormula(f)],
        skip: b.skip,
        props: b.props,
        junction: null,
      });
    }
  } else if (0 < b.skip.length) {
    // P∨Q
    const [f, ...rest] = b.skip;
    switch (f[0]) {
      case "OR":
        return {
          nodes: b.nodes,
          stack: [],
          skip: [],
          props: b.props,
          junction: [
            evalBranch({ nodes: [], stack: [f[1]], skip: rest, props: b.props, junction: null }),
            evalBranch({ nodes: [], stack: [f[2]], skip: rest, props: b.props, junction: null }),
          ],
        };
      case "IMP":
        return {
          nodes: b.nodes,
          stack: [],
          skip: [],
          props: b.props,
          junction: [
            evalBranch({ nodes: [], stack: [["NOT", f[1]]], skip: rest, props: b.props, junction: null }),
            evalBranch({ nodes: [], stack: [f[2]], skip: rest, props: b.props, junction: null }),
          ],
        };
      case "EQ":
        return {
          nodes: b.nodes,
          stack: [],
          skip: [],
          props: b.props,
          junction: [
            evalBranch({
              nodes: [],
              stack: [["AND", f[1], f[2]]],
              skip: rest,
              props: b.props,
              junction: null,
            }),
            evalBranch({
              nodes: [],
              stack: [["AND", ["NOT", f[1]], ["NOT", f[2]]]],
              skip: rest,
              props: b.props,
              junction: null,
            }),
          ],
        };
    }
  } else {
    const lastNode = b.nodes.at(-1);
    if (lastNode?.[0] === "TOP" || lastNode?.[0] === "BOT") return b;
    return {
      ...b,
      nodes: [
        ...b.nodes,
        // last isn't ⊤ and ⊥, calc from prop table
        Object.values(b.props).some((v) => v?.["0"] === true && v?.["1"] === true) ? ["BOT"] : ["TOP"],
      ],
    };
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
          return [["OR", ["NOT", f[1][1]], ["NOT", f[1][2]]]];
        case "OR":
          return [["NOT", f[1][1]], ["NOT", f[1][2]]];
        case "IMP":
          return [f[1][1], ["NOT", f[1][2]]];
        case "EQ":
          return [
            ["OR", f[1][1], f[1][2]],
            ["OR", ["NOT", f[1][1]], ["NOT", f[1][2]]],
          ];
      }
    }
  }
  throw new Error("Must not be reached");
};
