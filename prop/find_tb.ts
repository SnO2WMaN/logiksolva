import { Branch } from "./branch.ts";

export const findTB = (b: Branch, which: "TOP" | "BOT"): boolean | undefined => {
  if (b.junction !== null) {
    const left = findTB(b.junction[0], which);
    const right = findTB(b.junction[1], which);
    if (left === undefined || right === undefined) return undefined;
    return left || right;
  }

  const lastNode = b.nodes.at(-1);
  if (!lastNode) return undefined;

  if (lastNode[0] !== "TOP" && lastNode[0] !== "BOT") return undefined;
  else return lastNode[0] === which;
};
