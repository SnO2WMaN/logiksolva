import { lengthTerm } from "./terms.ts";
import { Not, PredFormula } from "./types.ts";
import { showFormula } from "./show.ts";

export const lengthFormula = (f: PredFormula): number => {
  switch (f[0]) {
    case "PRED":
      return 1 + lengthTerm(f[2]);
    case "TOP":
    case "BOT":
      return 1;
    case "NOT":
      return 1 + lengthFormula(f[1]);
    case "AND":
    case "OR":
    case "IMP":
    case "EQ":
      return 1 + lengthFormula(f[1]) + lengthFormula(f[2]);
    case "FORALL":
    case "EXISTS":
      return 1 + lengthTerm(f[1]) + lengthFormula(f[2]);
  }
};

export const toCNF = (f: PredFormula): PredFormula => {
  switch (f[0]) {
    case "PRED":
      return f;
    case "NOT":
      return toCNFNot(f);
    case "OR":
      return f;
    case "AND":
      return ["OR", ["NOT", f[1]], ["NOT", f[2]]];
    case "IMP":
      return ["OR", ["NOT", f[1]], f[2]];
    case "EQ":
      return ["OR", ["AND", f[1], f[2]], ["AND", ["NOT", f[1]], ["NOT", f[2]]]];
  }
};

export const toCNFNot = (f: Not): PredFormula => {
  switch (f[1][0]) {
    case "PRED":
      return f;
    case "TOP":
      return ["TOP"];
    case "BOT":
      return ["TOP"];
    case "NOT":
      return f[1][1];
    case "AND":
      return ["OR", ["NOT", f[1][1]], ["NOT", f[1][2]]];
    case "OR":
      return ["AND", toCNFNot(["NOT", f[1][1]]), toCNFNot(["NOT", f[1][2]])];
    case "IMP":
      return ["AND", f[1][1], ["NOT", f[1][2]]];
    case "EQ":
      return [
        "AND",
        ["OR", f[1][1], f[1][2]],
        ["OR", ["NOT", f[1][1]], ["NOT", f[1][2]]],
      ];
    case "FORALL":
      return ["EXISTS", f[1][1], ["NOT", f[1][2]]];
    case "EXISTS":
      return ["FORALL", f[1][1], ["NOT", f[1][2]]];
  }
};

console.dir(
  toCNFNot([
    "NOT",
    [
      "AND",
      ["PRED", "P", ["NAME", "a"]],
      ["PRED", "Q", ["NAME", "a"]],
    ],
  ]),
  { depth: Number.MAX_SAFE_INTEGER },
);

console.log(showFormula(
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
    ["PRED", "N", ["OP", "s", ["OP", "s", ["NAME", "0"]]]],
  ],
));
