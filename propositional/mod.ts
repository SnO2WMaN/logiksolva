import { bold, brightGreen, green, red } from "std/fmt/colors.ts";
import { checkValid, createFirstBranch, toBranch } from "./branch.ts";
import { PropFormula } from "./types.ts";

const show = (f: PropFormula): string => {
  switch (f.type) {
    case "PROP":
      return f.id;
    case "NOT":
      return `¬${show(f.in)}`;
    case "AND":
      return `(${show(f.left)}∧${show(f.right)})`;
    case "OR":
      return `(${show(f.left)}∨${show(f.right)})`;
    case "IMPLICT":
      return `(${show(f.left)}→${show(f.right)})`;
  }
};

export const check = (f: PropFormula) => !checkValid(toBranch(createFirstBranch({ type: "NOT", in: f })));

export const print = (f: PropFormula) => {
  console.log(`${check(f) ? green("⊨") : red("⊭")} ${bold(show(f))}`);
};
