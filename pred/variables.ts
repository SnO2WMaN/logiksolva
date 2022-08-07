import { Formula, Term, Variable } from "./types.ts";

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

export const getFreeVariablesFromFormula = (f: Formula): Variable[] => {
  switch (f[0]) {
    case "PRED":
      return uniqVariables([...getFreeVariablesFromTerm(f[2])]);
    case "NOT":
      return uniqVariables([...getFreeVariablesFromFormula(f[1])]);
    case "AND":
    case "OR":
    case "IMP":
    case "EQ":
      return uniqVariables([...getFreeVariablesFromFormula(f[1]), ...getFreeVariablesFromFormula(f[2])]);
    case "FORALL":
    case "ANY":
      // fv(∀x.φ) = fv(φ) - {x}, ∃の場合も同様
      return uniqVariables([...getFreeVariablesFromFormula(f[2])].filter(([, id]) => id !== f[1][1]));
  }
};

export const getBoundVariablesFromTerm = (_: Term): Variable[] => [];
export const getBoundVariablesFromFormula = (f: Formula): Variable[] => {
  switch (f[0]) {
    case "PRED":
      return [];
    case "NOT":
      return uniqVariables([...getBoundVariablesFromFormula(f[1])]);
    case "AND":
    case "OR":
    case "IMP":
    case "EQ":
      return uniqVariables([...getBoundVariablesFromFormula(f[1]), ...getBoundVariablesFromFormula(f[2])]);
    case "FORALL":
    case "ANY":
      // bv(∀x.φ) = bv(φ) + {x}, ∃の場合も同様
      return uniqVariables([...getBoundVariablesFromFormula(f[2]), f[1]]);
  }
};
