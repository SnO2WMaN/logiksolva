import { showFormula } from "./show.ts";

console.log(showFormula(
  [
    "FORALL",
    ["VAR", "x"],
    [
      "IMP",
      ["PRED", "F", ["VAR", "x"]],
      ["PRED", "G", ["VAR", "x"]],
    ],
  ],
));

console.log(showFormula(
  ["NOT", [
    "EXISTS",
    ["VAR", "x"],
    [
      "OR",
      ["PRED", "F", ["VAR", "x"]],
      [
        "IMP",
        ["FORALL", ["VAR", "y"], ["PRED", "F", ["VAR", "y"]]],
        ["PRED", "F", ["VAR", "y"]],
      ],
    ],
  ]],
));
