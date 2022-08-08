import { Branch, evalBranch } from "./branch.ts";
import { findTB } from "./find_tb.ts";
import { parseFormula, showFormula } from "./formula.ts";
import { PropFormula, PropInference } from "./types.ts";

export const showInference = (i: PropInference): string => {
  const pr = i.premise.map((f) => showFormula(f)).join(", ");
  const cq = showFormula(i.consequence);
  return `${pr}⊨ ${cq}`;
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

export const checkInference = (i: PropInference): { branch: Branch; valid: boolean } => {
  const branch = evalBranch({
    stack: [...i.premise, ["NOT", i.consequence]],
    nodes: [],
    skip: [],
    props: {},
    junction: null,
  });
  const valid = findTB(branch, "TOP") === false;
  return { branch, valid };
};
