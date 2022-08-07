import { isDeepStrictEqual } from "std/node/util.ts";
import { Formula } from "./types.ts";

export type Tableau = {
  nodes: Formula[];
  stack: Formula[];
  junction: null | [Tableau, Tableau];
};

export const isSameFormula = (f1: Formula, f2: Formula): boolean => isDeepStrictEqual(f1, f2);

export const evalTableau = (t: Tableau): Tableau => {
  const contract = t.stack.find((sf) => t.nodes.findIndex((nf) => isSameFormula(sf, ["NOT", nf])) !== -1);
  if (contract) {
    return { stack: [], nodes: [...t.nodes, contract, ["BOT"]], junction: t.junction };
  } else if (0 < t.stack.length) {
    const [head, ...rest] = t.stack;
    switch (head[0]) {
      case "PRED":
        return evalTableau({
          nodes: [...t.nodes, head],
          stack: rest,
          junction: null,
        });
      case "TOP":
      case "BOT":
        return t;
      case "NOT":
        return evalTableau({
          nodes: [...t.nodes, head],
          stack: [...rest, head[1]],
          junction: null,
        });
      case "AND":
        return evalTableau({
          nodes: [...t.nodes, head],
          stack: [...rest, head[1], head[2]],
          junction: null,
        });
      case "OR":
        return evalTableau({
          nodes: [...t.nodes, head],
          stack: [...rest],
          junction: [
            evalTableau({
              nodes: [],
              stack: [head[1]],
              junction: null,
            }),
            evalTableau({
              nodes: [],
              stack: [head[2]],
              junction: null,
            }),
          ],
        });
      case "IMP":
        return evalTableau({
          nodes: [...t.nodes, head],
          stack: [...rest, ["OR", ["NOT", head[1]], head[2]]],
          junction: null,
        });
      case "EQ":
        return evalTableau({
          nodes: [...t.nodes, head],
          stack: [
            ...rest,
            ["AND", head[1], head[2]],
            ["AND", ["NOT", head[1]], ["NOT", head[2]]],
          ],
          junction: null,
        });
    }
  } else if (!t.junction) {
    return {
      stack: [],
      nodes: [...t.nodes, ["TOP"]],
      junction: null,
    };
  }
  return t;
};
