import { PropFormula } from "./types.ts";

export const show = (f: PropFormula): string => {
  switch (f[0]) {
    case "TOP":
      return "⊤";
    case "BOT":
      return "⊥";
    case "PROP":
      return f[1];
    case "NOT":
      return `¬${show(f[1])}`;
    case "AND":
      return `(${show(f[1])}∧${show(f[2])})`;
    case "OR":
      return `(${show(f[1])}∨${show(f[2])})`;
    case "IMP":
      return `(${show(f[1])}→${show(f[2])})`;
    case "EQ":
      return `(${show(f[1])}↔${show(f[2])})`;
  }
};
