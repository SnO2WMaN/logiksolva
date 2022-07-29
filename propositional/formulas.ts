// 数理論理学(戸次) p.38による

import { PropFormula } from "./types.ts";

// 結合律 TODO:
// ⊨ (Φ ∧ Ψ) ∧ χ ↔ Φ ∧ (Ψ ∧ χ)
// ⊨ (Φ ∨ Ψ) ∨ χ ↔ Φ ∨ (Ψ ∨ χ)
export const mkAssociative = (
  type: "AND" | "OR",
  phi: PropFormula,
  psi: PropFormula,
  xi: PropFormula,
): PropFormula => ({
  type: "IMPLICT",
  left: { type: type, left: phi, right: { type: type, left: psi, right: xi } },
  right: { type: type, left: { type: type, left: phi, right: psi }, right: xi },
});
export const associativeAnd: PropFormula = mkAssociative(
  "AND",
  { type: "PROP", id: "P" },
  { type: "PROP", id: "Q" },
  { type: "PROP", id: "R" },
);
export const associativeOr: PropFormula = mkAssociative(
  "OR",
  { type: "PROP", id: "P" },
  { type: "PROP", id: "Q" },
  { type: "PROP", id: "R" },
);

// 交換律 TODO:
// ⊨ (Φ ∧ Ψ) ↔ (Ψ ∧ Φ)
// ⊨ (Φ ∨ Ψ) ↔ (Ψ ∨ Φ)
export const mkCommutative = (type: "AND" | "OR", phi: PropFormula, psi: PropFormula): PropFormula => ({
  type: "IMPLICT",
  left: {
    type: type,
    left: phi,
    right: psi,
  },
  right: {
    type: type,
    left: psi,
    right: phi,
  },
});
export const commutativeAnd: PropFormula = mkCommutative(
  "AND",
  { type: "PROP", id: "P" },
  { type: "PROP", id: "Q" },
);
export const commutativeOr: PropFormula = mkCommutative(
  "OR",
  { type: "PROP", id: "P" },
  { type: "PROP", id: "Q" },
);

// 吸収律 TODO:
// ⊨ Φ ∧ (Φ ∨ Ψ) ↔ Φ
// ⊨ Φ ∨ (Φ ∧ Ψ) ↔ Φ
export const mkAbsorptive = (
  type: ["AND", "OR"] | ["OR", "AND"],
  phi: PropFormula,
  psi: PropFormula,
): PropFormula => ({
  type: "IMPLICT",
  left: { type: type[0], left: phi, right: { type: type[1], left: phi, right: psi } },
  right: phi,
});
export const absorptiveAndOr: PropFormula = mkAbsorptive(
  ["AND", "OR"],
  { type: "PROP", id: "P" },
  { type: "PROP", id: "Q" },
);
export const absorptiveOrAnd: PropFormula = mkAbsorptive(
  ["OR", "AND"],
  { type: "PROP", id: "P" },
  { type: "PROP", id: "Q" },
);

// 冪等律 TODO:
// ⊨ Φ ∧ Φ ↔ Φ
// ⊨ Φ ∨ Φ ↔ Φ
export const mkIdempotent = (
  type: "AND" | "OR",
  phi: PropFormula,
): PropFormula => ({
  type: "IMPLICT",
  left: { type: type, left: phi, right: phi },
  right: phi,
});
export const idempotentAnd: PropFormula = mkIdempotent("AND", { type: "PROP", id: "P" });
export const idempotentOr: PropFormula = mkIdempotent("OR", { type: "PROP", id: "P" });

// 縮小律
// ⊨ Φ ∧ Ψ → Φ
// ⊨ Φ ∧ Ψ → Ψ
export const mkSimplification = (
  type: "LEFT" | "RIGHT",
  phi: PropFormula,
  psi: PropFormula,
): PropFormula => ({
  type: "IMPLICT",
  left: {
    type: "AND",
    left: phi,
    right: psi,
  },
  right: type === "LEFT" ? phi : psi,
});
export const simplificationLeft: PropFormula = mkSimplification(
  "LEFT",
  { type: "PROP", id: "P" },
  { type: "PROP", id: "Q" },
);
export const simplificationRight: PropFormula = mkSimplification(
  "RIGHT",
  { type: "PROP", id: "P" },
  { type: "PROP", id: "Q" },
);

// 拡大律
// ⊨ Φ → Φ ∨ Ψ
// ⊨ Ψ → Φ ∨ Ψ
export const mkAddition = (
  type: "LEFT" | "RIGHT",
  phi: PropFormula,
  psi: PropFormula,
): PropFormula => ({
  type: "IMPLICT",
  left: type === "LEFT" ? phi : psi,
  right: {
    type: "OR",
    left: phi,
    right: psi,
  },
});
export const additionLeft: PropFormula = mkAddition("LEFT", { type: "PROP", id: "P" }, { type: "PROP", id: "Q" });
export const additionRight: PropFormula = mkAddition("RIGHT", { type: "PROP", id: "P" }, { type: "PROP", id: "Q" });

// 分配律 TODO:
// ⊨ Φ ∧ (Ψ ∨ χ) ↔ (Φ ∧ Ψ) ∨ (Φ ∧ χ)
// ⊨ Φ ∨ (Ψ ∧ χ) ↔ (Φ ∨ Ψ) ∧ (Φ ∨ χ)
export const mkDistributive = (
  type: ["AND", "OR"] | ["OR", "AND"],
  phi: PropFormula,
  psi: PropFormula,
  xi: PropFormula,
): PropFormula => ({
  type: "IMPLICT",
  left: {
    type: type[0],
    left: phi,
    right: { type: type[1], left: psi, right: xi },
  },
  right: {
    type: type[1],
    left: { type: type[0], left: phi, right: psi },
    right: { type: type[0], left: phi, right: xi },
  },
});
export const distributiveAndOr: PropFormula = mkDistributive(
  ["AND", "OR"],
  { type: "PROP", id: "P" },
  { type: "PROP", id: "Q" },
  { type: "PROP", id: "R" },
);
export const distributiveOrAnd: PropFormula = mkDistributive(
  ["OR", "AND"],
  { type: "PROP", id: "P" },
  { type: "PROP", id: "Q" },
  { type: "PROP", id: "R" },
);

// 推移律
// ⊨ (Φ → Ψ) ∧ (Ψ → χ) → (Φ → χ)
export const mkTransitive = (
  phi: PropFormula,
  psi: PropFormula,
  xi: PropFormula,
): PropFormula => ({
  type: "IMPLICT",
  left: {
    type: "AND",
    left: {
      type: "IMPLICT",
      left: phi,
      right: psi,
    },
    right: {
      type: "IMPLICT",
      left: psi,
      right: xi,
    },
  },
  right: {
    type: "IMPLICT",
    left: phi,
    right: xi,
  },
});
export const transitive: PropFormula = mkTransitive(
  { type: "PROP", id: "P" },
  { type: "PROP", id: "Q" },
  { type: "PROP", id: "R" },
);

// 同一律
// ⊨ Φ → Φ
export const mkIdentity = (phi: PropFormula): PropFormula => ({
  type: "IMPLICT",
  left: phi,
  right: phi,
});
export const identity: PropFormula = mkIdentity(
  { type: "PROP", id: "P" },
);

// 対偶律 TODO:
// ⊨ Φ ↔ Ψ ↔ ¬Ψ ↔ ¬Φ
export const mkContraposition = (
  phi: PropFormula,
  psi: PropFormula,
): PropFormula => ({
  type: "IMPLICT",
  left: ({
    type: "IMPLICT",
    left: phi,
    right: psi,
  }),
  right: ({
    type: "IMPLICT",
    left: { type: "NOT", in: psi },
    right: { type: "NOT", in: phi },
  }),
});
export const contraposition: PropFormula = mkContraposition(
  { type: "PROP", id: "P" },
  { type: "PROP", id: "Q" },
);

// 二重否定律 TODO:
// ⊨ Φ ↔ ¬¬Φ
export const mkDoubleNegation = (phi: PropFormula): PropFormula => ({
  type: "IMPLICT",
  left: phi,
  right: ({
    type: "NOT",
    in: { type: "NOT", in: phi },
  }),
});
export const doubleNegation: PropFormula = mkDoubleNegation({ type: "PROP", id: "P" });

// 排中律
// ⊨ ¬(Φ ∧ ¬Φ)
export const mkExcludedMiddle = (phi: PropFormula): PropFormula => ({
  type: "OR",
  left: phi,
  right: {
    type: "NOT",
    in: phi,
  },
});
export const excludeMiddle: PropFormula = mkExcludedMiddle({ type: "PROP", id: "P" });

// 矛盾律
// ⊨ ¬(Φ ∧ ¬Φ)
export const mkNonContradiction = (phi: PropFormula): PropFormula => ({
  type: "NOT",
  in: {
    type: "AND",
    left: phi,
    right: {
      type: "NOT",
      in: phi,
    },
  },
});
export const nonContradiction: PropFormula = mkNonContradiction({ type: "PROP", id: "P" });

// 移入律
// ⊨ (Φ → Ψ → χ) → (Φ ∧ Ψ → χ)
export const mkImportation = (
  phi: PropFormula,
  psi: PropFormula,
  xi: PropFormula,
): PropFormula => ({
  type: "IMPLICT",
  left: {
    type: "IMPLICT",
    left: phi,
    right: { type: "IMPLICT", left: psi, right: xi },
  },
  right: {
    type: "IMPLICT",
    left: { type: "AND", left: phi, right: psi },
    right: xi,
  },
});
export const importation: PropFormula = mkImportation(
  { type: "PROP", id: "P" },
  { type: "PROP", id: "Q" },
  { type: "PROP", id: "R" },
);

// 移出律
// ⊨ (Φ ∧ Ψ → χ) → (Φ → Ψ → χ)
export const mkExportation = (
  phi: PropFormula,
  psi: PropFormula,
  xi: PropFormula,
): PropFormula => ({
  type: "IMPLICT",
  left: {
    type: "IMPLICT",
    left: { type: "AND", left: phi, right: psi },
    right: xi,
  },
  right: {
    type: "IMPLICT",
    left: phi,
    right: { type: "IMPLICT", left: psi, right: xi },
  },
});
export const exportation: PropFormula = mkExportation(
  { type: "PROP", id: "P" },
  { type: "PROP", id: "Q" },
  { type: "PROP", id: "R" },
);

// De Morgan
// ⊨ ¬(Φ ∧ Ψ) ↔ ¬Φ ∨ ¬Ψ
// ⊨ ¬(Φ ∨ Ψ) ↔ ¬Φ ∧ ¬Ψ
export const mkDeMorgan = (
  type: ["AND", "OR"] | ["OR", "AND"],
  phi: PropFormula,
  psi: PropFormula,
): PropFormula => ({
  type: "IMPLICT",
  left: {
    type: "NOT",
    in: { type: type[0], left: phi, right: psi },
  },
  right: {
    type: type[1],
    left: { type: "NOT", in: phi },
    right: { type: "NOT", in: psi },
  },
});
export const demorganAndOr: PropFormula = mkDeMorgan(
  ["AND", "OR"],
  { type: "PROP", id: "P" },
  { type: "PROP", id: "Q" },
);
export const demorganOrAnd: PropFormula = mkDeMorgan(
  ["OR", "AND"],
  { type: "PROP", id: "P" },
  { type: "PROP", id: "Q" },
);

// モーダスポネンス
// ⊨ Φ ∧ (Φ → Ψ) → Ψ
export const mkModusPonens = (
  phi: PropFormula,
  psi: PropFormula,
): PropFormula => ({
  type: "IMPLICT",
  left: {
    type: "AND",
    left: phi,
    right: {
      type: "IMPLICT",
      left: phi,
      right: psi,
    },
  },
  right: psi,
});
export const modusPonens: PropFormula = mkModusPonens(
  { type: "PROP", id: "P" },
  { type: "PROP", id: "Q" },
);

// 選言的三段論法
// ⊨ ¬Φ ∧ (Φ ∨ Ψ) → Ψ
export const mkDisjunctiveSyllogism = (
  phi: PropFormula,
  psi: PropFormula,
): PropFormula => ({
  type: "IMPLICT",
  left: {
    type: "AND",
    left: { type: "NOT", in: phi },
    right: {
      type: "OR",
      left: phi,
      right: psi,
    },
  },
  right: psi,
});
export const disjunctiveSyllogism: PropFormula = mkDisjunctiveSyllogism(
  { type: "PROP", id: "P" },
  { type: "PROP", id: "Q" },
);

// 構成的両刃論法
// ⊨ (Φ → χ) → ((Ψ → χ) → (Φ ∨ Ψ → χ))
export const mkConstructiveDilemma = (
  phi: PropFormula,
  psi: PropFormula,
  xi: PropFormula,
): PropFormula => ({
  type: "IMPLICT",
  left: {
    type: "IMPLICT",
    left: phi,
    right: xi,
  },
  right: {
    type: "IMPLICT",
    left: {
      type: "IMPLICT",
      left: psi,
      right: xi,
    },
    right: {
      type: "IMPLICT",
      left: { type: "OR", left: phi, right: psi },
      right: xi,
    },
  },
});
export const constructiveDilemma: PropFormula = mkConstructiveDilemma(
  { type: "PROP", id: "P" },
  { type: "PROP", id: "Q" },
  { type: "PROP", id: "R" },
);

// |/= ((A -> B) /\ B) -> A
export const invalidFormula1: PropFormula = {
  type: "IMPLICT",
  left: {
    type: "AND",
    left: { type: "IMPLICT", left: { type: "PROP", id: "A" }, right: { type: "PROP", id: "B" } },
    right: { type: "PROP", id: "B" },
  },
  right: { type: "PROP", id: "A" },
};
