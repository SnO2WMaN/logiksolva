import { PropFormula } from "./types.ts";

// 後件肯定
// ⊭ ((Φ → Ψ) ∧ Ψ) → Φ
export const mkAffirmingConsequent = (
  phi: PropFormula,
  psi: PropFormula,
): PropFormula => ({
  type: "IMPLICT",
  left: { type: "AND", left: { type: "IMPLICT", left: phi, right: psi }, right: psi },
  right: phi,
});
export const affirmingConsequent: PropFormula = mkAffirmingConsequent(
  { type: "PROP", id: "P" },
  { type: "PROP", id: "Q" },
);

// 前件否定
// ⊭ ((Φ → Ψ) ∧ ¬Φ) → ¬Ψ
export const mkDenyingAntecedent = (
  phi: PropFormula,
  psi: PropFormula,
): PropFormula => ({
  type: "IMPLICT",
  left: { type: "AND", left: { type: "IMPLICT", left: phi, right: psi }, right: { type: "NOT", in: phi } },
  right: { type: "NOT", in: psi },
});
export const denyingAntecedent: PropFormula = mkDenyingAntecedent(
  { type: "PROP", id: "P" },
  { type: "PROP", id: "Q" },
);

// 選言肯定
// ⊭ ((Φ ∨ Ψ) ∧ Φ) → ¬Ψ
export const mkAffirmingDisjunct = (
  phi: PropFormula,
  psi: PropFormula,
): PropFormula => ({
  type: "IMPLICT",
  left: { type: "AND", left: { type: "OR", left: phi, right: psi }, right: phi },
  right: { type: "NOT", in: psi },
});
export const affirmingDisjunct: PropFormula = mkAffirmingDisjunct(
  { type: "PROP", id: "P" },
  { type: "PROP", id: "Q" },
);

// 誤謬の誤謬
// ⊭ ((Φ → Ψ) ∧ ¬Φ) → ¬Ψ
export const mkFallancyFallancy = (
  phi: PropFormula,
  psi: PropFormula,
): PropFormula => ({
  type: "IMPLICT",
  left: {
    type: "AND",
    left: { type: "IMPLICT", left: phi, right: psi },
    right: { type: "NOT", in: phi },
  },
  right: { type: "NOT", in: psi },
});
export const fallancyFallancy: PropFormula = mkFallancyFallancy(
  { type: "PROP", id: "P" },
  { type: "PROP", id: "Q" },
);
