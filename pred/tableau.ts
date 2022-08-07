import { isDeepStrictEqual } from "std/node/util.ts";
import { Formula, Term, Variable } from "./types.ts";
import { getFreeVariablesFromFormula, substituteToFormula } from "./variables.ts";

export type Tableau = {
  nodes: Formula[];
  stack: Formula[];
  junction: null | [Tableau, Tableau];
};

// TODO: ∧, ∨の順序を考慮した同一性チェック
export const isSameFormula = (f1: Formula, f2: Formula): boolean => isDeepStrictEqual(f1, f2);

// fsの中の論理式φに存在する適当な項，存在しないならτ
export const makeAnyVariable = (fs: Formula[]): Term => {
  if (fs.length === 0) return ["VAR", "τ"];
  const [headFormula, ...restFormulas] = fs;
  switch (headFormula[0]) {
    case "PRED":
      return headFormula[2];
    case "FORALL":
    case "ANY":
      return headFormula[1];
    case "TOP":
    case "BOT":
      return makeAnyVariable(restFormulas);
    case "NOT":
      return makeAnyVariable([headFormula[1], ...restFormulas]);
    case "AND":
    case "OR":
    case "IMP":
    case "EQ":
      return makeAnyVariable([headFormula[1], headFormula[2], ...restFormulas]);
  }
};

// fsの中の論理式φについてζ∉fv(φ)なζを生成
export const makeUniqueVariable = (fs: Formula[]): Variable => {
  const next = fs
    .map((f) => getFreeVariablesFromFormula(f))
    .reduce((p, c) => [...p, ...c], [])
    .filter(([, vi]) => /^ζ\d+$/.test(vi))
    .map(([, vi]) => parseInt(vi.substring(1)))
    .at(-1);
  console.log(next);
  if (next === undefined) return ["VAR", `ζ0`];
  return ["VAR", `ζ${next + 1}`];
};

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
      case "FORALL":
        return evalTableau({
          nodes: [...t.nodes, head],
          stack: [...rest, substituteToFormula(head[2], head[1], makeAnyVariable(t.nodes))],
          junction: null,
        });
      case "ANY":
        return evalTableau({
          nodes: [...t.nodes, head],
          stack: [...rest, substituteToFormula(head[2], head[1], makeUniqueVariable(t.nodes))],
          junction: null,
        });
      case "TOP":
      case "BOT":
        return t;
      case "NOT": {
        switch (head[1][0]) {
          case "FORALL":
            return evalTableau({
              nodes: [...t.nodes, head],
              stack: [...rest, substituteToFormula(head[1][2], head[1][1], makeUniqueVariable(t.nodes))],
              junction: null,
            });
          case "ANY":
            return evalTableau({
              nodes: [...t.nodes, head],
              stack: [...rest, substituteToFormula(head[1][2], head[1][1], makeAnyVariable(t.nodes))],
              junction: null,
            });
          default:
            return evalTableau({
              nodes: [...t.nodes, head],
              stack: [...rest, head[1]],
              junction: null,
            });
        }
      }
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
