import { Variable } from "./types.ts";
import { getFreeVariablesFromFormula, getFreeVariablesFromTerm, uniqVariables } from "./variables.ts";
import { assertEquals } from "std/testing/asserts.ts";

Deno.test("uniqVariables:name", () => {
  const actual = uniqVariables([["VAR", "x"], ["VAR", "x"]]);
  const expected: Variable[] = [["VAR", "x"]];
  assertEquals(actual, expected);
});

Deno.test("getFreeVariablesFromTerm:name", () => {
  const actual = getFreeVariablesFromTerm(["NAME", "a"]);
  const expected: Variable[] = [];
  assertEquals(actual, expected);
});

Deno.test("getFreeVariablesFromTerm:varibale", () => {
  const actual = getFreeVariablesFromTerm(["VAR", "x"]);
  const expected: Variable[] = [["VAR", "x"]];
  assertEquals(actual, expected);
});

Deno.test("getFreeVariablesFromTerm:op_name", () => {
  const actual = getFreeVariablesFromTerm(["OP", "f", ["NAME", "a"]]);
  const expected: Variable[] = [];
  assertEquals(actual, expected);
});

Deno.test("getFreeVariablesFromTerm:op_varibale", () => {
  const actual = getFreeVariablesFromTerm(["OP", "f", ["VAR", "x"]]);
  const expected: Variable[] = [["VAR", "x"]];
  assertEquals(actual, expected);
});

Deno.test("getFreeVariablesFromFormula:forall", () => {
  // fv("∀x.F(x)") = {}
  const actual = getFreeVariablesFromFormula(["FORALL", ["VAR", "x"], ["PRED", "F", ["VAR", "x"]]]);
  const expected: Variable[] = [];
  assertEquals(actual, expected);
});

Deno.test("getFreeVariablesFromFormula:any", () => {
  // fv("∃x.F(x)") = {}
  const actual = getFreeVariablesFromFormula(["ANY", ["VAR", "x"], ["PRED", "F", ["VAR", "x"]]]);
  const expected: Variable[] = [];
  assertEquals(actual, expected);
});
