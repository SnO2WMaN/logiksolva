import { isDeepStrictEqual } from "std/node/util.ts";
import { And, Eq, Imp, Not, Or, PropFormula } from "./types.ts";

export type Tableau = {
  nodes: PropFormula[];
  stack: PropFormula[];
  // skip: (Or | Imp | Eq)[];
  // props: PropsTable;
  junction: null | [Tableau, Tableau];
  prev: PropFormula[];
  skip: Or[];
};

export const isSameFormula = (f1: PropFormula, f2: PropFormula): boolean => {
  if (
    (f1[0] === "AND" && f2[0] === "AND") ||
    (f1[0] === "OR" && f2[0] === "OR") ||
    (f1[0] === "EQ" && f2[0] === "EQ")
  ) {
    return (isSameFormula(f1[1], f2[1]) && isSameFormula(f1[2], f2[2])) ||
      (isSameFormula(f1[1], f2[2]) && isSameFormula(f1[2], f2[1]));
  } /* ¬¬f1 = f1として再評価 */
  else if (f1[0] === "NOT" && f1[1][0] === "NOT") return isSameFormula(f1[1][1], f2);
  /* ¬¬f2 = f2として再評価 */
  else if (f2[0] === "NOT" && f2[1][0] === "NOT") return isSameFormula(f1, f2[1][1]);
  else return isDeepStrictEqual(f1, f2);
};

export const hasContract = (list: PropFormula[], check: PropFormula[]): boolean => {
  return check.findIndex((sf) =>
    list.findIndex(
      (nf) => isSameFormula(sf, ["NOT", nf]) || isSameFormula(["NOT", sf], nf),
    ) !== -1
  ) !== -1;
};

export const hasTop = (b: Tableau): boolean | undefined => {
  if (b.junction !== null) {
    const left = hasTop(b.junction[0]);
    const right = hasTop(b.junction[1]);
    if (left === undefined || right === undefined) return undefined;
    return left || right;
  }

  const lastNode = b.nodes.at(-1);
  if (!lastNode) return undefined;
  if (lastNode[0] !== "TOP" && lastNode[0] !== "BOT") return undefined;
  else return lastNode[0] === "TOP";
};

export const evalTableau = (t: Tableau): Tableau => {
  if (hasContract([...t.prev, ...t.nodes], t.nodes)) return { ...t, nodes: [...t.nodes, ["BOT"]] };

  if (0 < t.stack.length) {
    const [head, ...rest] = t.stack;
    switch (head[0]) {
      case "PROP":
        return evalTableau({ ...t, nodes: [...t.nodes, head], stack: rest });
      case "TOP":
      case "BOT":
        return { ...t, nodes: [...t.nodes, head], stack: [] };
      case "NOT":
        return evalNot(t, head, rest);
      case "AND":
        return evalAnd(t, head, rest);
      case "OR":
        return evalOr(t, head, rest);
      case "IMP":
        return evalImp(t, head, rest);
      case "EQ":
        return evalEq(t, head, rest);
    }
  } else if (0 < t.skip.length) {
    const [head, ...rest] = t.skip;
    return ({
      ...t,
      junction: [
        evalTableau({ nodes: [], stack: [head[1]], skip: rest, prev: [...t.prev, ...t.nodes, head], junction: null }),
        evalTableau({ nodes: [], stack: [head[2]], skip: rest, prev: [...t.prev, ...t.nodes, head], junction: null }),
      ],
    });
  } else {
    return ({ ...t, nodes: [...t.nodes, ["TOP"]] });
  }
};

export const evalAnd = (t: Tableau, head: And, rest: PropFormula[], as?: PropFormula): Tableau =>
  evalTableau({
    ...t,
    nodes: as ? [...t.nodes, as] : [...t.nodes, head],
    stack: [...rest, head[1], head[2]],
  });

export const evalOr = (t: Tableau, head: Or, rest: PropFormula[], as?: PropFormula): Tableau =>
  evalTableau({ ...t, nodes: as ? [...t.nodes, as] : [...t.nodes, head], stack: rest, skip: [...t.skip, head] });

export const evalImp = (t: Tableau, head: Imp, rest: PropFormula[]): Tableau =>
  evalOr(t, ["OR", ["NOT", head[1]], head[2]], rest, head);

export const evalEq = (t: Tableau, head: Eq, rest: PropFormula[]): Tableau =>
  evalOr(t, ["OR", ["AND", head[1], head[2]], ["AND", ["NOT", head[1]], ["NOT", head[2]]]], rest, head);

export const evalNot = (t: Tableau, head: Not, rest: PropFormula[]): Tableau => {
  switch (head[1][0]) {
    case "PROP":
      return evalTableau({ ...t, nodes: [...t.nodes, head], stack: rest });
    case "TOP":
      return ({ ...t, nodes: [...t.nodes, head, ["BOT"]], stack: [] });
    case "BOT":
      return ({ ...t, nodes: [...t.nodes, head, ["TOP"]], stack: [] });
    case "NOT":
      return evalTableau({ ...t, nodes: [...t.nodes, head], stack: [...rest, head[1][1]] });
    case "AND":
      return evalOr(t, ["OR", ["NOT", head[1][1]], ["NOT", head[1][2]]], rest, head);
    case "OR":
      return evalAnd(t, ["AND", ["NOT", head[1][1]], ["NOT", head[1][2]]], rest, head);
    case "IMP":
      return evalAnd(t, ["AND", head[1][1], ["NOT", head[1][2]]], rest, head);
    case "EQ":
      return evalAnd(
        t,
        ["AND", ["OR", head[1][1], head[1][2]], ["OR", ["NOT", head[1][1]], ["NOT", head[1][2]]]],
        rest,
        head,
      );
  }
};

export type SlimTableau = { nodes: PropFormula[]; junction: null | [SlimTableau, SlimTableau] };
export const makeSlimTableau = ({ nodes, junction }: Tableau): SlimTableau => {
  if (junction !== null) return { nodes, junction: [makeSlimTableau(junction[0]), makeSlimTableau(junction[1])] };
  return { nodes: nodes, junction: null };
};
