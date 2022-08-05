import { Branch, evalBranch } from "./branch.ts";
import { PropFormula } from "./types.ts";

export const deep = (b: Branch): boolean | undefined => {
  if (b.junction !== null) {
    return deep(b.junction[0]) || deep(b.junction[1]);
  }

  const lastNode = b.nodes.at(-1);
  if (!lastNode) return undefined;

  switch (lastNode[0]) {
    case "TOP":
      return true;
    case "BOT":
      return false;
    default:
      return undefined;
  }
};

export const isValid = (f: PropFormula) =>
  (deep(evalBranch({
    stack: [["NOT", f]],
    nodes: [],
    skip: [],
    props: {},
    junction: null,
  }))) === false;
