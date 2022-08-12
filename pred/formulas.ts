import { lengthTerm } from "./terms.ts";
import { PredFormula } from "./types.ts";

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
