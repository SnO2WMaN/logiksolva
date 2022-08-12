import { PredFormula, Term } from "./types.ts";

export const showTerm = (t: Term): string => {
  switch (t[0]) {
    case "NAME":
      return `${t[1]}`;
    case "VAR":
      return `${t[1]}`;
    case "OP":
      return `${t[1]}(${showTerm(t[2])})`;
  }
};

export const showFormula = (f: PredFormula): string => {
  switch (f[0]) {
    case "PRED":
      return `${f[1]}(${showTerm(f[2])})`;
    case "TOP":
      return "⊤";
    case "BOT":
      return "⊥";
    case "NOT":
      return `¬${showFormula(f[1])}`;
    case "AND":
      return `(${showFormula(f[1])}∧${showFormula(f[2])})`;
    case "OR":
      return `(${showFormula(f[1])}∨${showFormula(f[2])})`;
    case "IMP":
      return `(${showFormula(f[1])}→${showFormula(f[2])})`;
    case "EQ":
      return `(${showFormula(f[1])}↔${showFormula(f[2])})`;
    case "FORALL":
      return `∀${showTerm(f[1])}.${showFormula(f[2])}`;
    case "EXISTS":
      return `∃${showTerm(f[1])}.${showFormula(f[2])}`;
  }
};
