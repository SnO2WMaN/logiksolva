import { And, Eq, Implict, Not, Or, Prop, PropFormula } from "./types.ts";

export const removeParen = (raw: string): string => {
  const match = /^\((.*)\)$/.exec(raw);
  if (match !== null) return removeParen(match[1]);
  return raw;
};

export const parseFormula = (raw: string): PropFormula | null => {
  const eq = parseEq(raw);
  if (eq !== null) return eq;

  const implict = parseImplict(raw);
  if (implict !== null) return implict;

  const and = parseAnd(raw);
  if (and !== null) return and;

  const or = parseOr(raw);
  if (or !== null) return or;

  const not = parseNot(raw);
  if (not !== null) return not;

  return parseProp(raw);
};

export const parseProp = (raw: string): Prop | null => {
  const rmParen = removeParen(raw);
  if (rmParen.includes("(") || rmParen.includes(")")) return null;

  const expected: Prop = { type: "PROP", id: rmParen };
  return expected;
};

export const parseNot = (raw: string): Not | null => {
  const match = /^¬(.*)$/.exec(raw);
  if (match === null) return null;

  const inner = parseFormula(match[1]);
  if (inner === null) return null;
  return { type: "NOT", in: inner };
};

export const parseAnd = (raw: string): And | null => {
  const match = /^(.*)∧(.*)$/.exec(removeParen(raw));
  if (match === null) return null;

  const left = parseFormula(match[1]);
  const right = parseFormula(match[2]);
  if (left === null || right === null) return null;
  return { type: "AND", left, right };
};

export const parseOr = (raw: string): Or | null => {
  const match = /^(.*)∨(.*)$/.exec(removeParen(raw));
  if (match === null) return null;

  const left = parseFormula(match[1]);
  const right = parseFormula(match[2]);
  if (left === null || right === null) return null;
  return { type: "OR", left, right };
};

export const parseImplict = (raw: string): Implict | null => {
  const match = /^(.*)→(.*)$/.exec(removeParen(raw));
  if (match === null) return null;

  const left = parseFormula(match[1]);
  const right = parseFormula(match[2]);
  if (left === null || right === null) return null;
  return { type: "IMPLICT", left, right };
};

export const parseEq = (raw: string): Eq | null => {
  const match = /^(.*)↔(.*)$/.exec(removeParen(raw));
  if (match === null) return null;
  const left = parseFormula(match[1]);
  const right = parseFormula(match[2]);
  if (left === null || right === null) return null;
  return { type: "EQ", left, right };
};
