import { isDeepStrictEqual } from "std/node/util.ts";
import { showFormula } from "./show.ts";
import { And, Eq, Exists, ForAll, Formula, Imp, Not, NotPredicate, Or, Predicate, Term, Variable } from "./types.ts";
import { getFreeVariablesFromFormula, substituteToFormula } from "./variables.ts";

export type Tableau = {
  nodes: Formula[];
  stack: Formula[];
  junction: null | [Tableau, Tableau];
  prev: [] | Formula[];
  ps: (Predicate | NotPredicate)[];
  qs: (ForAll | Exists)[];
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
    case "EXISTS":
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
  if (next === undefined) return ["VAR", `ζ0`];
  return ["VAR", `ζ${next + 1}`];
};

export const evalTableau = (t: Tableau): Tableau => {
  const contract = t.stack.find(
    (sf) => t.prev.findIndex((nf) => isSameFormula(sf, ["NOT", nf])) !== -1,
  );
  if (contract) {
    return { ...t, nodes: [...t.nodes, contract, ["BOT"]] };
  }

  if (0 < t.stack.length) {
    const [head, ...rest] = t.stack;
    switch (head[0]) {
      case "PRED":
        return evalTableau({ ...t, nodes: [...t.nodes, head], stack: rest, ps: [head] });
      case "FORALL":
      case "EXISTS":
        return evalTableau({ ...t, nodes: [...t.nodes, head], stack: rest, qs: [head] });
      // return evalTableau({
      //   nodes: [...t.nodes, head],
      //   stack: [...rest, substituteToFormula(head[2], head[1], makeAnyVariable(t.nodes))],
      //   junction: null,
      //   prev: [],
      // });
      case "TOP":
      case "BOT":
        return ({ ...t, nodes: [...t.nodes, head], stack: [] });
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
  } else if (t.junction === null) {
    return evalTableau({ ...t, stack: [["TOP"]] });
  }
  return t;
};

export const evalNot = (t: Tableau, head: Not, rest: Formula[]): Tableau => {
  switch (head[1][0]) {
    case "PRED":
      return evalTableau({ nodes: [...t.nodes, head], stack: [...rest], junction: null, prev: [] });
    case "FORALL":
      return evalTableau({ nodes: [...t.nodes, head], stack: [...rest], junction: null, prev: [] });
      // return evalTableau({
    //   nodes: [...t.nodes, head],
    //   stack: [...rest, substituteToFormula(head[1][2], head[1][1], makeUniqueVariable(t.nodes))],
    //   junction: null,
    //   prev: [],
    // });
    case "EXISTS":
      return evalTableau({ nodes: [...t.nodes, head], stack: [...rest], junction: null, prev: [] });
      // return evalTableau({
    //   nodes: [...t.nodes, head],
    //   stack: [...rest, substituteToFormula(head[1][2], head[1][1], makeAnyVariable(t.nodes))],
    //   junction: null,
    //   prev: [],
    // });
    case "TOP":
      return evalTableau({ nodes: [...t.nodes, head, ["BOT"]], stack: [], junction: null, prev: [] });
    case "BOT":
      return evalTableau({ nodes: [...t.nodes, head, ["TOP"]], stack: [], junction: null, prev: [] });
    case "NOT":
      return evalTableau({ nodes: [...t.nodes, head], stack: [...rest, head[1][1]], junction: null, prev: [] });
    case "AND":
      return evalOr(t, ["OR", ["NOT", head[1][1]], ["NOT", head[1][2]]], rest);
    case "OR":
      return evalAnd(t, ["AND", ["NOT", head[1][1]], ["NOT", head[1][2]]], rest);
    case "IMP":
      return evalAnd(t, ["AND", head[1][1], ["NOT", head[1][2]]], rest);
    case "EQ":
      return evalAnd(
        t,
        ["AND", ["OR", head[1][1], head[1][2]], ["OR", ["NOT", head[1][1]], ["NOT", head[1][2]]]],
        rest,
      );
  }
};

export const evalAnd = (t: Tableau, head: And, rest: Formula[]): Tableau =>
  evalTableau({
    nodes: [...t.nodes, head],
    stack: [...rest, head[1], head[2]],
    junction: null,
    prev: [],
  });

export const evalOr = (t: Tableau, head: Or, rest: Formula[]): Tableau =>
  evalTableau({
    nodes: [...t.nodes, head],
    stack: [...rest],
    junction: [
      evalTableau({ nodes: [], stack: [head[1]], junction: null, prev: [...t.prev, ...t.nodes] }),
      evalTableau({ nodes: [], stack: [head[2]], junction: null, prev: [...t.prev, ...t.nodes] }),
    ],
    prev: [],
  });

export const evalImp = (t: Tableau, head: Imp, rest: Formula[]): Tableau =>
  evalOr(t, ["OR", ["NOT", head[1]], head[2]], rest);

export const evalEq = (t: Tableau, head: Eq, rest: Formula[]): Tableau =>
  evalOr(t, ["OR", ["AND", head[1], head[2]], ["AND", ["NOT", head[1]], ["NOT", head[2]]]], rest);

console.log(showFormula([
  "IMP",
  [
    "AND",
    ["PRED", "N", ["NAME", "0"]],
    [
      "FORALL",
      ["VAR", "i"],
      [
        "IMP",
        ["PRED", "N", ["VAR", "i"]],
        ["PRED", "N", ["OP", "s", ["VAR", "i"]]],
      ],
    ],
  ],
  ["PRED", "N", ["OP", "s", ["OP", "s", ["NAME", "0"]]]],
]));
console.dir(
  evalTableau({
    nodes: [],
    stack: [
      [
        "NOT",
        [
          "IMP",
          [
            "AND",
            ["PRED", "N", ["NAME", "0"]],
            [
              "FORALL",
              ["VAR", "i"],
              [
                "IMP",
                ["PRED", "N", ["VAR", "i"]],
                ["PRED", "N", ["OP", "s", ["VAR", "i"]]],
              ],
            ],
          ],
          ["PRED", "S", ["OP", "s", ["OP", "s", ["NAME", "0"]]]],
        ],
      ],
    ],
    junction: null,
    prev: [],
    ps: [],
    qs: [],
  }),
  {
    depth: Number.MAX_SAFE_INTEGER,
  },
);
