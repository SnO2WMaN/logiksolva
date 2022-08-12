import { PredFormula, Term, Variable } from "./types.ts";

export const uniqVariables = (vs: Variable[]): Variable[] =>
  // O(n^2)だが変項は高々10個以内と想定されるので良しとする
  vs.filter(([, vi], i, a) => a.findIndex(([, vi2]) => vi === vi2) === i);

export const getFreeVariablesFromTerm = (t: Term): Variable[] => {
  switch (t[0]) {
    case "NAME":
      return [];
    case "VAR":
      return [t];
    case "OP":
      return uniqVariables([...getFreeVariablesFromTerm(t[2])]);
  }
};

export const getFreeVariablesFromFormula = (f: PredFormula): Variable[] => {
  switch (f[0]) {
    case "PRED":
      return uniqVariables([...getFreeVariablesFromTerm(f[2])]);
    case "TOP":
    case "BOT":
      return [];
    case "NOT":
      return uniqVariables([...getFreeVariablesFromFormula(f[1])]);
    case "AND":
    case "OR":
    case "IMP":
    case "EQ":
      return uniqVariables([...getFreeVariablesFromFormula(f[1]), ...getFreeVariablesFromFormula(f[2])]);
    case "FORALL":
    case "EXISTS":
      // fv(∀x.φ) = fv(φ) - {x}, ∃の場合も同様
      return uniqVariables([...getFreeVariablesFromFormula(f[2])].filter(([, id]) => id !== f[1][1]));
  }
};

export const getBoundVariablesFromTerm = (_: Term): Variable[] => [];
export const getBoundVariablesFromFormula = (f: PredFormula): Variable[] => {
  switch (f[0]) {
    case "PRED":
      return [];
    case "TOP":
    case "BOT":
      return [];
    case "NOT":
      return uniqVariables([...getBoundVariablesFromFormula(f[1])]);
    case "AND":
    case "OR":
    case "IMP":
    case "EQ":
      return uniqVariables([...getBoundVariablesFromFormula(f[1]), ...getBoundVariablesFromFormula(f[2])]);
    case "FORALL":
    case "EXISTS":
      // bv(∀x.φ) = bv(φ) + {x}, ∃の場合も同様
      return uniqVariables([...getBoundVariablesFromFormula(f[2]), f[1]]);
  }
};

export const substituteToTerm = (t: Term, from: Variable, to: Term): Term => {
  switch (t[0]) {
    case "NAME":
      return t;
    case "VAR":
      if (t[1] === from[1]) return to;
      else return t;
    case "OP":
      return ["OP", t[1], substituteToTerm(t[2], from, to)];
  }
};

export const substituteToFormula = (f: PredFormula, from: Variable, to: Term): PredFormula => {
  switch (f[0]) {
    case "PRED":
      return ["PRED", f[1], substituteToTerm(f[2], from, to)];
    case "TOP":
    case "BOT":
      return f;
    case "NOT":
      return [f[0], substituteToFormula(f[1], from, to)];
    case "AND":
    case "OR":
    case "IMP":
    case "EQ":
      return [f[0], substituteToFormula(f[1], from, to), substituteToFormula(f[2], from, to)];
    case "FORALL":
    case "EXISTS":
      if (
        getFreeVariablesFromFormula(f[2]).findIndex(([, vi]) => vi === from[1]) === -1 ||
        getFreeVariablesFromTerm(to).findIndex(([, vi]) => vi === f[1][1]) === -1
      ) {
        return [f[0], f[1], substituteToFormula(f[2], from, to)];
      } else return f;
  }
};
