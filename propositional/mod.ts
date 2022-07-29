import { bold } from "std/fmt/colors.ts";
import { generatePropsTable, generateTableau } from "./tableaux.ts";
import { PropFormula, Tableau } from "./types.ts";
export { generateTableau } from "./tableaux.ts";

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

const showSerial = (steps: Tableau, nest = 0) => {
  steps.map((step, i) => {
    console.log(`${" ".repeat(nest)}${i}:${show(step.formula)}`);
    if (step.type === "PARARELL") {
      showSerial(step.left, nest + 1);
      console.log(`${" ".repeat(nest + 1)}-`);
      showSerial(step.right, nest + 1);
    }
  });
};

export const check = (f: PropFormula) => {
  return generatePropsTable(generateTableau({ type: "NOT", in: f }), {})
    .every((t) => Object.values(t).some(({ t, b }) => t && b));
};
export const print = (f: PropFormula) => {
  console.log(`${check(f) ? "⊨" : "⊭"} ${bold(show(f))}`);
  // showSerial(generateTableau({ type: "NOT", in: f }));
};
