import { Not, Or, Prop, PropFormula } from "./types.ts";

// |= (P /\ (P -> Q)) -> Q
export const modasponens: PropFormula = {
  type: "IMPLICT",
  left: {
    type: "AND",
    left: { type: "PROP", id: "P" },
    right: {
      type: "IMPLICT",
      left: { type: "PROP", id: "P" },
      right: { type: "PROP", id: "Q" },
    },
  },
  right: { type: "PROP", id: "Q" },
};

// |= (P || (Q && R)) -> ((P||Q)&&(P||R))
export const distributive1: PropFormula = {
  type: "IMPLICT",
  left: {
    type: "OR",
    left: { type: "PROP", id: "P" },
    right: {
      type: "AND",
      left: { type: "PROP", id: "Q" },
      right: { type: "PROP", id: "R" },
    },
  },
  right: {
    type: "AND",
    left: { type: "OR", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "Q" } },
    right: { type: "OR", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "R" } },
  },
};

// |= (P || (Q && R)) -> ((P||Q)&&(P||R))
export const distributive2: PropFormula = {
  type: "IMPLICT",
  left: {
    type: "AND",
    left: { type: "PROP", id: "P" },
    right: {
      type: "OR",
      left: { type: "PROP", id: "Q" },
      right: { type: "PROP", id: "R" },
    },
  },
  right: {
    type: "OR",
    left: { type: "AND", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "Q" } },
    right: { type: "AND", left: { type: "PROP", id: "P" }, right: { type: "PROP", id: "R" } },
  },
};

// |= (A -> B) -> ((B -> C) -> (A -> C))
export const transitive: PropFormula = {
  type: "IMPLICT",
  left: {
    type: "IMPLICT",
    left: { type: "PROP", id: "A" },
    right: { type: "PROP", id: "B" },
  },
  right: {
    type: "IMPLICT",
    left: {
      type: "IMPLICT",
      left: { type: "PROP", id: "B" },
      right: { type: "PROP", id: "C" },
    },
    right: {
      type: "IMPLICT",
      left: { type: "PROP", id: "A" },
      right: { type: "PROP", id: "C" },
    },
  },
};

// |/= ((A -> B) /\ B) -> A
export const invalidFormula1: PropFormula = {
  type: "IMPLICT",
  left: {
    type: "AND",
    left: {
      type: "IMPLICT",
      left: { type: "PROP", id: "A" },
      right: { type: "PROP", id: "B" },
    },
    right: {
      type: "PROP",
      id: "B",
    },
  },
  right: {
    type: "PROP",
    id: "A",
  },
};
