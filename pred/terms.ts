import { Term } from "./types.ts";

export const lengthTerm = (t: Term): number => {
  switch (t[0]) {
    case "NAME":
      return 1;
    case "VAR":
      return 1;
    case "OP":
      return 1 + lengthTerm(t[2]);
  }
};
