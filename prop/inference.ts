import { Branch, evalBranch } from "./branch.ts";
import { findTB } from "./find_tb.ts";
import { parseFormula, show } from "./mod.ts";
import { PropInference } from "./types.ts";

export const showInference = (i: PropInference): string => {
  return `${i.premise.map((f) => show(f)).join(",")}⊨${show(i.consequence)}`;
};

export const parseInference = (s: string): PropInference | null => {
  const consequence = parseFormula(s);
  if (!consequence) return null;
  return { premise: [], consequence };
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
