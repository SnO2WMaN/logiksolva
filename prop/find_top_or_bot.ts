import { Branch } from "./branch.ts";

export const findTopOrBot = (b: Branch): boolean | undefined => {
  if (b.junction !== null) {
    return findTopOrBot(b.junction[0]) || findTopOrBot(b.junction[1]);
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
