import { PropFormula } from "../types.ts";

// 結合律
// ⊨ (Φ ∧ Ψ) ∧ χ ↔ Φ ∧ (Ψ ∧ χ)
// ⊨ (Φ ∨ Ψ) ∨ χ ↔ Φ ∨ (Ψ ∨ χ)
export const mkAssociative = (
  type: "AND" | "OR",
  phi: PropFormula,
  psi: PropFormula,
  xi: PropFormula,
): PropFormula => ["EQ", [type, phi, [type, psi, xi]], [type, [type, phi, psi], xi]];
export const associativeAnd: PropFormula = mkAssociative(
  "AND",
  ["PROP", "P"],
  ["PROP", "Q"],
  ["PROP", "R"],
);
export const associativeOr: PropFormula = mkAssociative(
  "OR",
  ["PROP", "P"],
  ["PROP", "Q"],
  ["PROP", "R"],
);

// 交換律
// ⊨ (Φ ∧ Ψ) ↔ (Ψ ∧ Φ)
// ⊨ (Φ ∨ Ψ) ↔ (Ψ ∨ Φ)
export const mkCommutative = (
  type: "AND" | "OR",
  phi: PropFormula,
  psi: PropFormula,
): PropFormula => ["EQ", [type, phi, psi], [type, psi, phi]];
export const commutativeAnd: PropFormula = mkCommutative(
  "AND",
  ["PROP", "P"],
  ["PROP", "Q"],
);
export const commutativeOr: PropFormula = mkCommutative(
  "OR",
  ["PROP", "P"],
  ["PROP", "Q"],
);

// 吸収律
// ⊨ Φ ∧ (Φ ∨ Ψ) ↔ Φ
// ⊨ Φ ∨ (Φ ∧ Ψ) ↔ Φ
export const mkAbsorptive = (
  type: ["AND", "OR"] | ["OR", "AND"],
  phi: PropFormula,
  psi: PropFormula,
): PropFormula => ["EQ", [type[0], phi, [type[1], phi, psi]], phi];
export const absorptiveAndOr: PropFormula = mkAbsorptive(
  ["AND", "OR"],
  ["PROP", "P"],
  ["PROP", "Q"],
);
export const absorptiveOrAnd: PropFormula = mkAbsorptive(
  ["OR", "AND"],
  ["PROP", "P"],
  ["PROP", "Q"],
);

// 冪等律
// ⊨ Φ ∧ Φ ↔ Φ
// ⊨ Φ ∨ Φ ↔ Φ
export const mkIdempotent = (
  type: "AND" | "OR",
  phi: PropFormula,
): PropFormula => ["EQ", [type, phi, phi], phi];
export const idempotentAnd: PropFormula = mkIdempotent("AND", ["PROP", "P"]);
export const idempotentOr: PropFormula = mkIdempotent("OR", ["PROP", "P"]);

// 縮小律
// ⊨ Φ ∧ Ψ → Φ
// ⊨ Φ ∧ Ψ → Ψ
export const mkSimplification = (
  type: "LEFT" | "RIGHT",
  phi: PropFormula,
  psi: PropFormula,
): PropFormula => ["IMP", ["AND", phi, psi], type === "LEFT" ? phi : psi];
export const simplificationLeft: PropFormula = mkSimplification(
  "LEFT",
  ["PROP", "P"],
  ["PROP", "Q"],
);
export const simplificationRight: PropFormula = mkSimplification(
  "RIGHT",
  ["PROP", "P"],
  ["PROP", "Q"],
);

// 拡大律
// ⊨ Φ → Φ ∨ Ψ
// ⊨ Ψ → Φ ∨ Ψ
export const mkAddition = (
  type: "LEFT" | "RIGHT",
  phi: PropFormula,
  psi: PropFormula,
): PropFormula => ["IMP", type === "LEFT" ? phi : psi, ["OR", phi, psi]];
export const additionLeft: PropFormula = mkAddition("LEFT", ["PROP", "P"], ["PROP", "Q"]);
export const additionRight: PropFormula = mkAddition("RIGHT", ["PROP", "P"], ["PROP", "Q"]);

// 分配律
// ⊨ Φ ∧ (Ψ ∨ χ) ↔ (Φ ∧ Ψ) ∨ (Φ ∧ χ)
// ⊨ Φ ∨ (Ψ ∧ χ) ↔ (Φ ∨ Ψ) ∧ (Φ ∨ χ)
export const mkDistributive = (
  type: ["AND", "OR"] | ["OR", "AND"],
  phi: PropFormula,
  psi: PropFormula,
  xi: PropFormula,
): PropFormula => ["EQ", [type[0], phi, [type[1], psi, xi]], [type[1], [type[0], phi, psi], [type[0], phi, xi]]];
export const distributiveAndOr: PropFormula = mkDistributive(
  ["AND", "OR"],
  ["PROP", "P"],
  ["PROP", "Q"],
  ["PROP", "R"],
);
export const distributiveOrAnd: PropFormula = mkDistributive(
  ["OR", "AND"],
  ["PROP", "P"],
  ["PROP", "Q"],
  ["PROP", "R"],
);

// 推移律
// ⊨ (Φ → Ψ) ∧ (Ψ → χ) → (Φ → χ)
export const mkTransitive = (
  phi: PropFormula,
  psi: PropFormula,
  xi: PropFormula,
): PropFormula => ["IMP", ["AND", ["IMP", phi, psi], ["IMP", psi, xi]], ["IMP", phi, xi]];
export const transitive: PropFormula = mkTransitive(
  ["PROP", "P"],
  ["PROP", "Q"],
  ["PROP", "R"],
);

// 同一律
// ⊨ Φ → Φ
export const mkIdentity = (phi: PropFormula): PropFormula => ["IMP", phi, phi];
export const identity: PropFormula = mkIdentity(["PROP", "P"]);

// 対偶律
// ⊨ Φ → Ψ ↔ ¬Ψ → ¬Φ
export const mkContraposition = (
  phi: PropFormula,
  psi: PropFormula,
): PropFormula => ["EQ", ["IMP", phi, psi], ["IMP", ["NOT", psi], ["NOT", phi]]];
export const contraposition: PropFormula = mkContraposition(["PROP", "P"], ["PROP", "Q"]);

// 二重否定律
// ⊨ Φ ↔ ¬¬Φ
export const mkDoubleNegation = (phi: PropFormula): PropFormula => ["EQ", phi, ["NOT", ["NOT", phi]]];
export const doubleNegation: PropFormula = mkDoubleNegation(["PROP", "P"]);

// 排中律
// ⊨ Φ ∨ ¬Φ
export const mkExcludedMiddle = (phi: PropFormula): PropFormula => ["OR", phi, ["NOT", phi]];
export const excludeMiddle: PropFormula = mkExcludedMiddle(["PROP", "P"]);

// 矛盾律
// ⊨ ¬(Φ ∧ ¬Φ)
export const mkNonContradiction = (phi: PropFormula): PropFormula => ["NOT", ["AND", phi, ["NOT", phi]]];
export const nonContradiction: PropFormula = mkNonContradiction(["PROP", "P"]);

// 移入律
// ⊨ (Φ → Ψ → χ) → (Φ ∧ Ψ → χ)
export const mkImportation = (
  phi: PropFormula,
  psi: PropFormula,
  xi: PropFormula,
): PropFormula => ["IMP", ["IMP", phi, ["IMP", psi, xi]], ["IMP", ["AND", phi, psi], xi]];
export const importation: PropFormula = mkImportation(["PROP", "P"], ["PROP", "Q"], ["PROP", "R"]);

// 移出律
// ⊨ (Φ ∧ Ψ → χ) → (Φ → Ψ → χ)
export const mkExportation = (
  phi: PropFormula,
  psi: PropFormula,
  xi: PropFormula,
): PropFormula => ["IMP", ["IMP", ["AND", phi, psi], xi], ["IMP", phi, ["IMP", psi, xi]]];
export const exportation: PropFormula = mkExportation(["PROP", "P"], ["PROP", "Q"], ["PROP", "R"]);

// De Morgan
// ⊨ ¬(Φ ∧ Ψ) ↔ ¬Φ ∨ ¬Ψ
// ⊨ ¬(Φ ∨ Ψ) ↔ ¬Φ ∧ ¬Ψ
export const mkDeMorgan = (
  type: ["AND", "OR"] | ["OR", "AND"],
  phi: PropFormula,
  psi: PropFormula,
): PropFormula => ["EQ", ["NOT", [type[0], phi, psi]], [type[1], ["NOT", phi], ["NOT", psi]]];
export const demorganAndOr: PropFormula = mkDeMorgan(["AND", "OR"], ["PROP", "P"], ["PROP", "Q"]);
export const demorganOrAnd: PropFormula = mkDeMorgan(["OR", "AND"], ["PROP", "P"], ["PROP", "Q"]);

// モーダスポネンス
// ⊨ Φ ∧ (Φ → Ψ) → Ψ
export const mkModusPonens = (
  phi: PropFormula,
  psi: PropFormula,
): PropFormula => ["IMP", ["AND", phi, ["IMP", phi, psi]], psi];
export const modusPonens: PropFormula = mkModusPonens(["PROP", "P"], ["PROP", "Q"]);

// 選言的三段論法
// ⊨ ¬Φ ∧ (Φ ∨ Ψ) → Ψ
export const mkDisjunctiveSyllogism = (
  phi: PropFormula,
  psi: PropFormula,
): PropFormula => ["IMP", ["AND", ["NOT", phi], ["OR", phi, psi]], psi];
export const disjunctiveSyllogism: PropFormula = mkDisjunctiveSyllogism(["PROP", "P"], ["PROP", "Q"]);

// 構成的両刃論法
// ⊨ (Φ → χ) → (Ψ → χ) → (Φ ∨ Ψ → χ)
export const mkConstructiveDilemma = (
  phi: PropFormula,
  psi: PropFormula,
  xi: PropFormula,
): PropFormula => ["IMP", ["IMP", phi, xi], ["IMP", ["IMP", psi, xi], ["IMP", ["OR", phi, psi], xi]]];
export const constructiveDilemma: PropFormula = mkConstructiveDilemma(
  ["PROP", "P"],
  ["PROP", "Q"],
  ["PROP", "R"],
);
