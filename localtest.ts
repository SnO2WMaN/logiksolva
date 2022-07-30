import { green, red } from "https://deno.land/std@0.118.0/fmt/colors.ts";
import { bold } from "std/fmt/colors.ts";
import {
  affirmingConsequent,
  affirmingDisjunct,
  denyingAntecedent,
  fallancyFallancy,
} from "./propositional/fallancy.ts";
import { check } from "./propositional/mod.ts";
import {
  absorptiveAndOr,
  absorptiveOrAnd,
  additionLeft,
  additionRight,
  associativeAnd,
  associativeOr,
  commutativeAnd,
  commutativeOr,
  constructiveDilemma,
  contraposition,
  demorganAndOr,
  demorganOrAnd,
  disjunctiveSyllogism,
  distributiveAndOr,
  distributiveOrAnd,
  doubleNegation,
  excludeMiddle,
  exportation,
  idempotentAnd,
  idempotentOr,
  identity,
  importation,
  modusPonens,
  nonContradiction,
  simplificationLeft,
  simplificationRight,
  transitive,
} from "./propositional/tautology.ts";
import { PropFormula } from "./propositional/types.ts";

const show = (f: PropFormula): string => {
  switch (f.type) {
    case "PROP":
      return f.id;
    case "NOT":
      return `¬${show(f.in)}`;
    case "AND":
      return `(${show(f.left)}∧${show(f.right)})`;
    case "OR":
      return `(${show(f.left)}∨${show(f.right)})`;
    case "IMPLICT":
      return `(${show(f.left)}→${show(f.right)})`;
    case "EQ":
      return `(${show(f.left)}↔${show(f.right)})`;
  }
};

export const print = (f: PropFormula) => {
  console.log(`${check(f) ? green("⊨") : red("⊭")} ${bold(show(f))}`);
};

// トートロジー
// 結合律
print(associativeAnd);
print(associativeOr);
// 交換律
print(commutativeAnd);
print(commutativeOr);
// 吸収律
print(absorptiveAndOr);
print(absorptiveOrAnd);
// 冪等律
print(idempotentAnd);
print(idempotentOr);
// 縮小律
print(simplificationLeft);
print(simplificationRight);
// 拡大律
print(additionLeft);
print(additionRight);
// 分配律
print(distributiveAndOr);
print(distributiveOrAnd);
// 同一律
print(identity);
// 推移律
print(transitive);
// 移入律
print(importation);
// 移出律
print(exportation);
// De Morgan
print(demorganAndOr);
print(demorganOrAnd);
// 対偶律
print(contraposition);
// 二重否定律
print(doubleNegation);
// 排中律
print(excludeMiddle);
// 矛盾律
print(nonContradiction);
// モーダスポネンス
print(modusPonens);
// 選言的三段論法
print(disjunctiveSyllogism);
// 構成的両刃論法
print(constructiveDilemma);
// 誤謬
// 後件肯定
print(affirmingConsequent);
// 後件肯定
print(denyingAntecedent);
// 選言肯定
print(affirmingDisjunct);
// 誤謬の誤謬
print(fallancyFallancy);
