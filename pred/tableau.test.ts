import { evalTableau, makeAnyVariable, makeUniqueVariable, Tableau } from "./tableau.ts";
import { assertEquals } from "std/testing/asserts.ts";

Deno.test("makeAnyVariable:already_exists_variable:1", () => {
  assertEquals(
    makeAnyVariable(
      [
        ["PRED", "F", ["VAR", "x"]],
      ],
    ),
    ["VAR", "x"],
  );
});

Deno.test("makeAnyVariable:already_exists_variable:2", () => {
  assertEquals(
    makeAnyVariable(
      [
        [
          "OR",
          ["PRED", "F", ["VAR", "x"]],
          ["PRED", "G", ["VAR", "y"]],
        ],
      ],
    ),
    ["VAR", "x"],
  );
});

Deno.test("makeAnyVariable:exists_no_variables", () => {
  assertEquals(makeAnyVariable([]), ["VAR", "τ"]);
});

Deno.test("makeUniqueVariable:exists_no_variables", () => {
  assertEquals(makeUniqueVariable([]), ["VAR", "ζ0"]);
});

Deno.test("makeUniqueVariable:not_zeta_in_formulas", () => {
  assertEquals(
    makeUniqueVariable([
      ["PRED", "F", ["VAR", "x"]],
    ]),
    ["VAR", "ζ0"],
  );
});

Deno.test("makeUniqueVariable:zeta_in_formulas:1", () => {
  assertEquals(
    makeUniqueVariable([
      ["PRED", "F", ["VAR", "ζ0"]],
    ]),
    ["VAR", "ζ1"],
  );
});

Deno.test("makeUniqueVariable:zeta_in_formulas:2", () => {
  assertEquals(
    makeUniqueVariable([
      ["PRED", "F", ["VAR", "ζ0"]],
      ["PRED", "G", ["VAR", "ζ1"]],
    ]),
    ["VAR", "ζ2"],
  );
});

Deno.test("evalTableau:F(x)", () => {
  const actual = evalTableau({
    nodes: [],
    stack: [
      ["PRED", "F", ["VAR", "x"]],
    ],
    junction: null,
  });
  const expected: Tableau = {
    nodes: [
      ["PRED", "F", ["VAR", "x"]],
      ["TOP"],
    ],
    stack: [],
    junction: null,
  };
  assertEquals(actual, expected);
});

Deno.test("evalTableau:¬F(x)", () => {
  const actual = evalTableau({
    nodes: [],
    stack: [
      ["NOT", ["PRED", "F", ["VAR", "x"]]],
    ],
    junction: null,
  });
  const expected: Tableau = {
    nodes: [
      [
        "NOT",
        ["PRED", "F", ["VAR", "x"]],
      ],
      ["PRED", "F", ["VAR", "x"]],
      ["TOP"],
    ],
    stack: [],
    junction: null,
  };
  assertEquals(actual, expected);
});

Deno.test("evalTableau:F(x)∧G(x)", () => {
  const actual = evalTableau({
    nodes: [],
    stack: [
      [
        "AND",
        ["PRED", "F", ["VAR", "x"]],
        ["PRED", "G", ["VAR", "x"]],
      ],
    ],
    junction: null,
  });
  const expected: Tableau = {
    nodes: [["AND", ["PRED", "F", ["VAR", "x"]], ["PRED", "G", ["VAR", "x"]]], ["PRED", "F", ["VAR", "x"]], [
      "PRED",
      "G",
      ["VAR", "x"],
    ], ["TOP"]],
    stack: [],
    junction: null,
  };
  assertEquals(actual, expected);
});

Deno.test("evalTableau:F(x)∨G(x)", () => {
  const actual = evalTableau({
    nodes: [],
    stack: [
      [
        "OR",
        ["PRED", "F", ["VAR", "x"]],
        ["PRED", "G", ["VAR", "x"]],
      ],
    ],
    junction: null,
  });
  const expected: Tableau = {
    nodes: [
      [
        "OR",
        ["PRED", "F", ["VAR", "x"]],
        ["PRED", "G", ["VAR", "x"]],
      ],
    ],
    stack: [],
    junction: [{
      nodes: [["PRED", "F", ["VAR", "x"]], ["TOP"]],
      stack: [],
      junction: null,
    }, {
      nodes: [["PRED", "G", ["VAR", "x"]], ["TOP"]],
      stack: [],
      junction: null,
    }],
  };
  assertEquals(actual, expected);
});

Deno.test("evalTableau:F(x),¬F(x)", () => {
  const actual = evalTableau({
    nodes: [],
    stack: [
      ["PRED", "F", ["VAR", "x"]],
      ["NOT", ["PRED", "F", ["VAR", "x"]]],
    ],
    junction: null,
  });
  const expected: Tableau = {
    nodes: [
      ["PRED", "F", ["VAR", "x"]],
      ["NOT", ["PRED", "F", ["VAR", "x"]]],
      ["BOT"],
    ],
    stack: [],
    junction: null,
  };
  assertEquals(actual, expected);
});

Deno.test("evalTableau:∀x.F(x)", () => {
  const actual = evalTableau({
    nodes: [],
    stack: [
      ["FORALL", ["VAR", "x"], ["PRED", "F", ["VAR", "x"]]],
    ],
    junction: null,
  });
  const expected: Tableau = {
    nodes: [
      ["FORALL", ["VAR", "x"], ["PRED", "F", ["VAR", "x"]]],
      ["PRED", "F", ["VAR", "τ"]],
      ["TOP"],
    ],
    stack: [],
    junction: null,
  };
  assertEquals(actual, expected);
});

Deno.test("evalTableau:¬∀x.F(x)", () => {
  const actual = evalTableau({
    nodes: [],
    stack: [
      ["NOT", ["FORALL", ["VAR", "x"], ["PRED", "F", ["VAR", "x"]]]],
    ],
    junction: null,
  });
  const expected: Tableau = {
    nodes: [
      ["NOT", ["FORALL", ["VAR", "x"], ["PRED", "F", ["VAR", "x"]]]],
      ["PRED", "F", ["VAR", "ζ0"]],
      ["TOP"],
    ],
    stack: [],
    junction: null,
  };
  assertEquals(actual, expected);
});

Deno.test("evalTableau:∃x.F(x)", () => {
  const actual = evalTableau({
    nodes: [],
    stack: [
      ["EXISTS", ["VAR", "x"], ["PRED", "F", ["VAR", "x"]]],
    ],
    junction: null,
  });
  const expected: Tableau = {
    nodes: [
      ["EXISTS", ["VAR", "x"], ["PRED", "F", ["VAR", "x"]]],
      ["PRED", "F", ["VAR", "ζ0"]],
      ["TOP"],
    ],
    stack: [],
    junction: null,
  };
  assertEquals(actual, expected);
});
Deno.test("evalTableau:¬∃x.F(x)", () => {
  const actual = evalTableau({
    nodes: [],
    stack: [
      ["NOT", ["EXISTS", ["VAR", "x"], ["PRED", "F", ["VAR", "x"]]]],
    ],
    junction: null,
  });
  const expected: Tableau = {
    nodes: [
      ["NOT", ["EXISTS", ["VAR", "x"], ["PRED", "F", ["VAR", "x"]]]],
      ["PRED", "F", ["VAR", "τ"]],
      ["TOP"],
    ],
    stack: [],
    junction: null,
  };
  assertEquals(actual, expected);
});

Deno.test("evalTableau:(N(0)∧∀i.(N(i)→N(s(i))))→N(s(s(i)))", () => {
  const actual = evalTableau({
    nodes: [],
    stack: [
      [
        "IMP",
        [
          "AND",
          ["PRED", "N", ["VAR", "0"]],
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
        ["PRED", "S", ["OP", "s", ["OP", "s", ["VAR", "i"]]]],
      ],
    ],
    junction: null,
  });
  const expected: Tableau = {
    nodes: [
      ["NOT", ["EXISTS", ["VAR", "x"], ["PRED", "F", ["VAR", "x"]]]],
      ["PRED", "F", ["VAR", "τ"]],
      ["TOP"],
    ],
    stack: [],
    junction: null,
  };
  assertEquals(actual, expected);
});
