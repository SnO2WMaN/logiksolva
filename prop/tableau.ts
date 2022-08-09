import { isDeepStrictEqual } from "std/node/util.ts";
import { PropFormula } from "./types.ts";

export type Tableau = {
  nodes: PropFormula[];
  stack: PropFormula[];
  // skip: (Or | Imp | Eq)[];
  // props: PropsTable;
  junction: null | [Tableau, Tableau];
  prev: PropFormula[];
};

export const isSameFormula = (f1: PropFormula, f2: PropFormula): boolean => {
  return isDeepStrictEqual(f1, f2);
  // if (f1[0] !== f2[0]) return false;
  // switch (f1[0]) {
  //   case "AND":
  //   case "OR":
  //   case "EQ":
  //     return (isSameFormula(f1[1], (f2 as And | Or | Eq)[1]) && isSameFormula(f1[2], (f2 as And | Or | Eq)[2])) ||
  //       (isSameFormula(f1[1], (f2 as And | Or | Eq)[2]) && isSameFormula(f1[2], (f2 as And | Or | Eq)[1]));
  //   default:
  //     return isDeepStrictEqual(f1, f2);
  // }
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
        return evalTableau({ ...t, nodes: [...t.nodes, head], stack: [] });
      // deno-lint-ignore no-fallthrough
      case "NOT": {
        switch (head[1][0]) {
          case "PROP":
            return evalTableau({ ...t, nodes: [...t.nodes, head], stack: rest });
          case "TOP":
            return evalTableau({ ...t, nodes: [...t.nodes, head, ["BOT"]], stack: [] });
          case "BOT":
            return evalTableau({ ...t, nodes: [...t.nodes, head, ["TOP"]], stack: [] });
          case "NOT":
            return evalTableau({ ...t, nodes: [...t.nodes, head], stack: [...rest, head[1][1]] });
          case "AND":
            return evalTableau({
              ...t,
              nodes: [...t.nodes, head],
              stack: [...rest, ["OR", ["NOT", head[1][1]], ["NOT", head[1][2]]]],
            });
          case "OR":
            return evalTableau({
              ...t,
              nodes: [...t.nodes, head],
              stack: [...rest, ["AND", ["NOT", head[1][1]], ["NOT", head[1][2]]]],
            });
          case "IMP":
            return evalTableau({
              ...t,
              nodes: [...t.nodes, head],
              stack: [...rest, ["AND", head[1][1], ["NOT", head[1][2]]]],
            });
          case "EQ":
            return evalTableau({
              ...t,
              nodes: [...t.nodes, head],
              stack: [
                ...rest,
                [
                  "AND",
                  ["OR", head[1][1], head[1][2]],
                  ["OR", ["NOT", head[1][1]], ["NOT", head[1][2]]],
                ],
              ],
            });
        }
      }
      case "AND":
        return evalTableau({
          ...t,
          nodes: [...t.nodes, head],
          stack: [...rest, head[1], head[2]],
        });
      case "OR":
        return ({
          ...t,
          nodes: [...t.nodes, head],
          stack: rest,
          junction: [
            evalTableau({
              nodes: [],
              stack: [...rest, head[1]],
              prev: [...t.prev, ...t.nodes, head],
              junction: null,
            }),
            evalTableau({
              nodes: [],
              stack: [...rest, head[2]],
              prev: [...t.prev, ...t.nodes, head],
              junction: null,
            }),
          ],
        });
      case "IMP":
        return evalTableau({
          ...t,
          nodes: [...t.nodes, head],
          stack: [...rest, ["OR", ["NOT", head[1]], head[2]]],
        });
      case "EQ":
        return evalTableau({
          ...t,
          nodes: [...t.nodes, head],
          stack: [...rest, ["OR", ["AND", head[1], head[2]], ["AND", ["NOT", head[1]], ["NOT", head[2]]]]],
        });
    }
  }
  return t;
};

console.log(
  !hasTop(evalTableau(
    {
      stack: [["NOT", ["IMP", ["AND", ["PROP", "P"], ["IMP", ["PROP", "P"], ["PROP", "Q"]]], ["PROP", "Q"]]]],
      junction: null,
      nodes: [],
      prev: [],
    },
  )),
);

console.log(
  !hasTop(evalTableau(
    {
      stack: [
        [
          "NOT",
          [
            "IMP",
            ["AND", ["IMP", ["PROP", "P"], ["PROP", "R"]], ["IMP", ["PROP", "Q"], ["PROP", "R"]]],
            ["IMP", ["OR", ["PROP", "P"], ["PROP", "Q"]], ["PROP", "R"]],
          ],
        ],
      ],
      junction: null,
      nodes: [],
      prev: [],
    },
  )),
);

export type SlimTableau = { nodes: PropFormula[]; junction: null | [SlimTableau, SlimTableau] };
export const makeSlimTableau = ({ nodes, junction }: Tableau): SlimTableau => {
  if (junction !== null) return { nodes, junction: [makeSlimTableau(junction[0]), makeSlimTableau(junction[1])] };
  return { nodes: nodes, junction: null };
};
