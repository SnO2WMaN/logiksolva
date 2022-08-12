import { assertEquals } from "std/testing/asserts.ts";
import { toCNF, toCNFNot } from "./formulas.ts";
import { PredFormula } from "./types.ts";

Deno.test("toCNFNot:¬P(a)", () => {
  // ¬P(a) = ¬P(a)
  const actual = toCNF(["NOT", ["PRED", "P", ["NAME", "a"]]]);
  const expected: PredFormula = ["NOT", ["PRED", "P", ["NAME", "a"]]];
  assertEquals(actual, expected);
});

Deno.test("toCNFNot:¬¬P(a)", () => {
  // ¬¬P(a) = P(a)
  const actual = toCNF(["NOT", ["NOT", ["PRED", "P", ["NAME", "a"]]]]);
  const expected: PredFormula = ["PRED", "P", ["NAME", "a"]];
  assertEquals(actual, expected);
});

Deno.test("toCNFNot:¬(P(a)∧Q(a))", () => {
  // ¬(P(a) ∧ Q(a)) = ¬P(a) ∨ ¬Q(a)
  const actual = toCNFNot([
    "NOT",
    [
      "AND",
      ["PRED", "P", ["NAME", "a"]],
      ["PRED", "Q", ["NAME", "a"]],
    ],
  ]);
  const expected: PredFormula = [
    "OR",
    ["NOT", ["PRED", "P", ["NAME", "a"]]],
    ["NOT", ["PRED", "Q", ["NAME", "a"]]],
  ];
  assertEquals(actual, expected);
});

Deno.test("toCNFNot:¬(P(a)∨Q(a))", () => {
  // ¬(P(a) ∨ Q(a)) = ¬P(a) ∧ ¬Q(a)
  const actual = toCNFNot([
    "NOT",
    [
      "OR",
      ["PRED", "P", ["NAME", "a"]],
      ["PRED", "Q", ["NAME", "a"]],
    ],
  ]);
  const expected: PredFormula = [
    "AND",
    ["NOT", ["PRED", "P", ["NAME", "a"]]],
    ["NOT", ["PRED", "Q", ["NAME", "a"]]],
  ];
  assertEquals(actual, expected);
});

Deno.test("toCNFNot:¬(P(a)→Q(a))", () => {
  // ¬(P(a) → Q(a)) = P(a) ∧ ¬Q(a)
  const actual = toCNFNot([
    "NOT",
    [
      "IMP",
      ["PRED", "P", ["NAME", "a"]],
      ["PRED", "Q", ["NAME", "a"]],
    ],
  ]);
  const expected: PredFormula = [
    "AND",
    ["PRED", "P", ["NAME", "a"]],
    ["NOT", ["PRED", "Q", ["NAME", "a"]]],
  ];
  assertEquals(actual, expected);
});

Deno.test("toCNF:P(a)", () => {
  // P(a) = P(a)
  const actual = toCNF(["PRED", "P", ["NAME", "a"]]);
  const expected: PredFormula = ["PRED", "P", ["NAME", "a"]];
  assertEquals(actual, expected);
});

Deno.test("toCNF:P(a)→Q(a)", () => {
  const actual = toCNF(
    [
      "IMP",
      ["PRED", "P", ["NAME", "a"]],
      ["PRED", "Q", ["NAME", "a"]],
    ],
  );
  const expected: PredFormula = [
    "OR",
    ["NOT", ["PRED", "P", ["NAME", "a"]]],
    ["PRED", "Q", ["NAME", "a"]],
  ];
  assertEquals(actual, expected);
});

Deno.test("toCNF:(P(a)∧Q(a))∨R(a)", () => {
  // (P(a) ∧ Q(a)) ∨ R(a) = (P(a) ∨ R(a)) ∧ (Q(a) ∨ R(a))
  const actual = toCNF(
    [
      "OR",
      [
        "AND",
        ["PRED", "P", ["NAME", "a"]],
        ["PRED", "Q", ["NAME", "b"]],
      ],
      ["PRED", "R", ["NAME", "a"]],
    ],
  );
  const expected: PredFormula = [
    "AND",
    [
      "OR",
      ["PRED", "P", ["NAME", "a"]],
      ["PRED", "R", ["NAME", "a"]],
    ],
    [
      "OR",
      ["PRED", "Q", ["NAME", "a"]],
      ["PRED", "R", ["NAME", "a"]],
    ],
  ];
  assertEquals(actual, expected);
});

Deno.test("toCNF:(N(0)∧∀i.(N(i)→N(i+1)))→N(1+1+0)", () => {
  // ((N(0)∧∀i.(N(i)→N(s(i))))→N(s(s(0)))) = ∀i.(N(0)∨(N(i)→N(i+1)∨ N(1+1+0))
  const actual = toCNF(
    [
      "IMP",
      [
        "AND",
        ["PRED", "N", ["NAME", "0"]],
        [
          "FORALL",
          ["VAR", "i"],
          [
            "IMP",
            ["PRED", "N", ["VAR", "i"]],
            ["PRED", "N", ["OP", "s", ["VAR", "i"]]],
          ],
        ],
      ],
      ["PRED", "N", ["OP", "s", ["OP", "s", ["NAME", "0"]]]],
    ],
  );
  const expected: PredFormula = [
    "FORALL",
    ["VAR", "i"],
    [
      "OR",
      ["PRED", "N", ["NAME", "0"]],
      [
        "OR",
        ["PRED", "N", ["OP", "s", ["OP", "s", ["NAME", "0"]]]],
      ],
    ],
    /*
    [
      "OR",
      ["PRED", "N", ["NAME", "0"]],
      [
        "OR",
        [
          "IMP",
          ["PRED", "N", ["VAR", "i"]],
          ["PRED", "N", ["OP", "s", ["VAR", "i"]]],
        ],
        ["PRED", "N", ["OP", "s", ["OP", "s", ["NAME", "0"]]]],
      ],
    ],
    */
  ];
  assertEquals(actual, expected);
});
