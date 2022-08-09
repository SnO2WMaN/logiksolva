import { parseFormula, showFormula } from "./formula.ts";
import { evalTableau, hasTop, makeSlimTableau, SlimTableau } from "./tableau.ts";
import { PropFormula, PropInference } from "./types.ts";

export const showInference = (i: PropInference): string => {
  const pr = i.premise.map((f) => showFormula(f)).join(", ");
  const cq = showFormula(i.consequence);
  return `${pr}${0 < i.premise.length ? " " : ""}⊨ ${cq}`;
};

export const parseInference = (s: string): PropInference | null => {
  const e = /^([^⊨]*)⊨(.+)$/.exec(s);
  if (!e) return null;

  const [, pr, cq] = e;
  const premise = pr !== "" ? pr.split(",").map((v) => parseFormula(v)) : [];

  if (premise.some((v) => v === null)) return null;

  const consequence = parseFormula(cq);
  if (consequence === null) return null;

  return {
    premise: premise as PropFormula[],
    consequence,
  };
};

export const checkInference = (i: PropInference): { tableau: SlimTableau; valid: boolean } => {
  const tableau = evalTableau({
    stack: [...i.premise, ["NOT", i.consequence]],
    nodes: [],
    junction: null,
    prev: [],
    skip: [],
  });
  const valid = hasTop(tableau) === false;
  return { tableau: makeSlimTableau(tableau), valid };
};
