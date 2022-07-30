import { checkValid, createFirstBranch, toBranch } from "./branch.ts";
import { PropFormula } from "./types.ts";

export const check = (f: PropFormula) => !checkValid(toBranch(createFirstBranch({ type: "NOT", in: f })));
