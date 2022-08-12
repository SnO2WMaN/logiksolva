import { isDeepStrictEqual } from "std/node/util.ts";
import { And, Eq, Exists, ForAll, Imp, Not, Or, PredFormula, Term, Variable } from "./types.ts";
import { getFreeVariablesFromFormula, substituteToFormula } from "./variables.ts";
import { sortBy } from "std/collections/sort_by.ts";
import { lengthTerm } from "./terms.ts";

export type QTPair = [(ForAll | Exists), Term];

export type Tableau = {
  nodes: PredFormula[];
  stack: PredFormula[];
  junction: null | [Tableau, Tableau];
  prev: [] | PredFormula[];
  skip: Or[];

  ts: Term[];
  qs: (ForAll | Exists)[];
  qtpairs2: [QTPair, boolean][];
};

// TODO: ∧, ∨の順序を考慮した同一性チェック
export const isSameFormula = (f1: PredFormula, f2: PredFormula): boolean => isDeepStrictEqual(f1, f2);

// fsの中の論理式φに存在する適当な項，存在しないならτ
export const makeAnyVariable = (fs: PredFormula[]): Term => {
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
export const makeUniqueVariable = (fs: PredFormula[]): Variable => {
  const next = fs
    .map((f) => getFreeVariablesFromFormula(f))
    .reduce((p, c) => [...p, ...c], [])
    .filter(([, vi]) => /^ζ\d+$/.test(vi))
    .map(([, vi]) => parseInt(vi.substring(1)))
    .at(-1);
  if (next === undefined) return ["VAR", `ζ0`];
  return ["VAR", `ζ${next + 1}`];
};

export const hasContract = (list: PredFormula[], check: PredFormula[]): boolean => {
  return check.findIndex((sf) =>
    list.findIndex(
      (nf) => isSameFormula(sf, ["NOT", nf]) || isSameFormula(["NOT", sf], nf),
    ) !== -1
  ) !== -1;
};

export const isSameTerm = (t1: Term, t2: Term) => isDeepStrictEqual(t1, t2);

export const isIncludeQTPair = (pair: QTPair, pairs: QTPair[]) => {
  return pairs.findIndex((v) => isSameFormula(v[0], pair[0]) && isSameTerm(v[1], pair[1])) === -1;
};

export const mergeQTPairs = (tgt: [QTPair, boolean][], ps: QTPair[]): [QTPair, boolean][] => {
  return [
    ...tgt,
    ...ps
      .filter((p) => (tgt.find(([t]) => isSameFormula(t[0], p[0]) && isSameTerm(t[1], p[1])))?.[1] !== true)
      .map<[QTPair, boolean]>((p) => [p, false]),
  ];
};

export const evalTableau = (t: Tableau): Tableau => {
  if (hasContract([...t.prev, ...t.nodes], t.nodes)) return { ...t, nodes: [...t.nodes, ["BOT"]] };

  if (0 < t.stack.length) {
    const [head, ...rest] = t.stack;
    switch (head[0]) {
      case "PRED": {
        return evalTableau({
          ...t,
          nodes: [...t.nodes, head],
          stack: rest,
          ts: sortBy([...t.ts, head[2]], (t) => lengthTerm(t)),
          qtpairs2: mergeQTPairs(t.qtpairs2, t.qs.map<QTPair>((qu) => [qu, head[2]])),
        });
      }
      case "FORALL":
      case "EXISTS":
        return evalTableau({
          ...t,
          nodes: [...t.nodes, head],
          stack: rest,
          qs: [...t.qs, head],
          qtpairs2: mergeQTPairs(t.qtpairs2, t.ts.map<QTPair>((tm) => [head, tm])),
        });
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
  }
  if (0 < t.skip.length) {
    const [head, ...rest] = t.skip;
    return ({
      ...t,
      junction: [
        evalTableau({
          ...t,
          nodes: [],
          stack: [head[1]],
          skip: rest,
          prev: [...t.prev, ...t.nodes, head],
          junction: null,
        }),
        evalTableau({
          ...t,
          nodes: [],
          stack: [head[2]],
          skip: rest,
          prev: [...t.prev, ...t.nodes, head],
          junction: null,
        }),
      ],
    });
  }
  if (t.qtpairs2.findIndex(([, q]) => !q) !== -1) {
    const usedPs = t.qtpairs2.filter(([, used]) => used);
    const unusedPs = t.qtpairs2.filter(([, used]) => !used);
    const [unused, ...unusedRest] = unusedPs;
    const [[qu, tm]] = unused;

    const substituded = substituteToFormula(qu[2], qu[1], tm);

    return ({
      ...t,
      stack: [substituded],
      qtpairs2: [...usedPs, [unused[0], true], ...unusedRest],
    });
    //  const [head, ...rest] = t.qtpairs2.filter(([, used]) => !used);
    //  const [qu, tm] = head;
    //  const substituded = substituteToFormula(qu[2], qu[1], tm);
    //  const already = [...t.prev, ...t.nodes].findIndex((f) => isSameFormula(f, substituded)) !== -1;
    //  console.dir([...t.prev, ...t.nodes], { depth: Number.MAX_SAFE_INTEGER });
    //  console.dir(substituded, { depth: Number.MAX_SAFE_INTEGER });
    //  // console.log(already);
    //  // console.dir(t, { depth: Number.MAX_SAFE_INTEGER });
    //  // console.dir(substituteToFormula(qu[2], qu[1], tm), { depth: Number.MAX_SAFE_INTEGER });
    //  return evalTableau({ ...t, stack: true ? [] : [substituteToFormula(qu[2], qu[1], tm)], qtpairs: [...rest] });
  } else {
    return evalTableau({ ...t, stack: [["TOP"]] });
  }
};

export const evalAnd = (t: Tableau, head: And, rest: PredFormula[], as?: PredFormula): Tableau =>
  evalTableau({ ...t, nodes: as ? [...t.nodes, as] : [...t.nodes, head], stack: [...rest, head[1], head[2]] });

export const evalOr = (t: Tableau, head: Or, rest: PredFormula[], as?: PredFormula): Tableau =>
  evalTableau({ ...t, nodes: as ? [...t.nodes, as] : [...t.nodes, head], stack: rest, skip: [...t.skip, head] });

export const evalImp = (t: Tableau, head: Imp, rest: PredFormula[]): Tableau =>
  evalOr(t, ["OR", ["NOT", head[1]], head[2]], rest, head);

export const evalEq = (t: Tableau, head: Eq, rest: PredFormula[]): Tableau =>
  evalOr(t, ["OR", ["AND", head[1], head[2]], ["AND", ["NOT", head[1]], ["NOT", head[2]]]], rest, head);

export const evalNot = (t: Tableau, head: Not, rest: PredFormula[]): Tableau => {
  switch (head[1][0]) {
    case "PRED": {
      return evalTableau({
        ...t,
        nodes: [...t.nodes, head],
        stack: [...rest],
        junction: null,
        ts: sortBy([...t.ts, head[1][2]], (t) => lengthTerm(t)),
        qtpairs2: mergeQTPairs(t.qtpairs2, t.qs.map<QTPair>((qu) => [qu, head[1][2] as Term])),
      });
    }
    case "FORALL":
      // ¬∀ (TODO:)
      return evalTableau({ ...t, nodes: [...t.nodes, head], stack: [...rest], junction: null, prev: [] });
    case "EXISTS":
      // ¬∃ (TODO:)
      return evalTableau({ ...t, nodes: [...t.nodes, head], stack: [...rest], junction: null, prev: [] });
    case "TOP":
      return evalTableau({ ...t, nodes: [...t.nodes, head, ["BOT"]], stack: [] });
    case "BOT":
      return evalTableau({ ...t, nodes: [...t.nodes, head, ["TOP"]], stack: [] });
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

/*
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
*/

/*
const evalued = evalTableau({
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
  skip: [],
  ts: [],
  qs: [],
  qtpairs: [],
  qtpairs2: [],
});
console.dir(evalued, { depth: Number.MAX_SAFE_INTEGER });
*/

console.dir(
  evalTableau({
    "nodes": [["PRED", "N", ["OP", "s", ["NAME", "0"]]]],
    "stack": [
      [
        "IMP",
        ["PRED", "N", ["OP", "s", ["OP", "s", ["NAME", "0"]]]],
        ["PRED", "N", ["OP", "s", ["OP", "s", ["OP", "s", ["NAME", "0"]]]]],
      ],
    ],
    "junction": null,
    "prev": [
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
      ["NOT", ["PRED", "S", ["OP", "s", ["OP", "s", ["NAME", "0"]]]]],
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
      [
        "IMP",
        ["PRED", "N", ["NAME", "0"]],
        ["PRED", "N", ["OP", "s", ["NAME", "0"]]],
      ],
      [
        "OR",
        ["NOT", ["PRED", "N", ["NAME", "0"]]],
        ["PRED", "N", ["OP", "s", ["NAME", "0"]]],
      ],
    ],
    "skip": [],
    "ts": [
      ["NAME", "0"],
      ["OP", "s", ["NAME", "0"]],
      ["OP", "s", ["OP", "s", ["NAME", "0"]]],
    ],
    "qs": [
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
    "qtpairs2": [
      [
        [
          [
            "FORALL",
            ["VAR", "i"],
            [
              "IMP",
              ["PRED", "N", ["VAR", "i"]],
              ["PRED", "N", ["OP", "s", ["VAR", "i"]]],
            ],
          ],
          ["NAME", "0"],
        ],
        true,
      ],
      [
        [
          [
            "FORALL",
            ["VAR", "i"],
            [
              "IMP",
              ["PRED", "N", ["VAR", "i"]],
              ["PRED", "N", ["OP", "s", ["VAR", "i"]]],
            ],
          ],
          ["OP", "s", ["OP", "s", ["NAME", "0"]]],
        ],
        true,
      ],
      [
        [
          [
            "FORALL",
            ["VAR", "i"],
            [
              "IMP",
              ["PRED", "N", ["VAR", "i"]],
              ["PRED", "N", ["OP", "s", ["VAR", "i"]]],
            ],
          ],
          ["OP", "s", ["NAME", "0"]],
        ],
        false,
      ],
    ],
  }),
  {
    depth: Number.MAX_SAFE_INTEGER,
  },
);
