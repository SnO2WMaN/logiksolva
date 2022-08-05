import { evalBranch } from "./branch.ts";
import { PropFormula } from "./types.ts";

// 後件肯定
// ⊭ ((Φ → Ψ) ∧ Ψ) → Φ
export const mkAffirmingConsequent = (
  phi: PropFormula,
  psi: PropFormula,
): PropFormula => ["IMP", ["AND", ["IMP", phi, psi], psi], phi];
export const affirmingConsequent: PropFormula = mkAffirmingConsequent(["PROP", "P"], ["PROP", "Q"]);

// 前件否定
// ⊭ ((Φ → Ψ) ∧ ¬Φ) → ¬Ψ
export const mkDenyingAntecedent = (
  phi: PropFormula,
  psi: PropFormula,
): PropFormula => ["IMP", ["AND", ["IMP", phi, psi], psi], phi];
export const denyingAntecedent: PropFormula = mkDenyingAntecedent(["PROP", "P"], ["PROP", "Q"]);

// 選言肯定
// ⊭ ((Φ ∨ Ψ) ∧ Φ) → ¬Ψ
export const mkAffirmingDisjunct = (
  phi: PropFormula,
  psi: PropFormula,
): PropFormula => ["IMP", ["AND", ["OR", phi, psi], phi], ["NOT", psi]];
export const affirmingDisjunct: PropFormula = mkAffirmingDisjunct(["PROP", "P"], ["PROP", "Q"]);

// 誤謬の誤謬
// ⊭ ((Φ → Ψ) ∧ ¬Φ) → ¬Ψ
export const mkFallancyFallancy = (
  phi: PropFormula,
  psi: PropFormula,
): PropFormula => ["IMP", ["AND", ["IMP", phi, psi], ["NOT", phi]], ["NOT", psi]];
export const fallancyFallancy: PropFormula = mkFallancyFallancy(["PROP", "P"], ["PROP", "Q"]);

console.dir(
  evalBranch({
    stack: [["NOT", affirmingConsequent]],
    nodes: [],
    skip: [],
    props: {},
    junction: null,
  }),
  {
    depth: Number.MAX_SAFE_INTEGER,
  },
);
