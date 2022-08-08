import { green, red } from "https://deno.land/std@0.118.0/fmt/colors.ts";
import { bold } from "std/fmt/colors.ts";
import { affirmingConsequent, affirmingDisjunct, denyingAntecedent, fallancyFallancy } from "./example/fallancy.ts";
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
} from "./example/tautology.ts";
import { checkInference, showInference } from "./inference.ts";
import { PropInference } from "./types.ts";

export const print = (i: PropInference) => {
  const { valid } = checkInference(i);
  console.log(`${bold(showInference(i))} is ${valid ? green("valid") : red("invalid")}`);
};

// トートロジー
// 結合律
print({ premise: [], consequence: associativeAnd });
print({ premise: [], consequence: associativeOr });
// 交換律
print({ premise: [], consequence: commutativeAnd });
print({ premise: [], consequence: commutativeOr });
// 吸収律
print({ premise: [], consequence: absorptiveAndOr });
print({ premise: [], consequence: absorptiveOrAnd });
// 冪等律
print({ premise: [], consequence: idempotentAnd });
print({ premise: [], consequence: idempotentOr });
// 縮小律
print({ premise: [], consequence: simplificationLeft });
print({ premise: [], consequence: simplificationRight });
// 拡大律
print({ premise: [], consequence: additionLeft });
print({ premise: [], consequence: additionRight });
// 分配律
print({ premise: [], consequence: distributiveAndOr });
print({ premise: [], consequence: distributiveOrAnd });
// 同一律
print({ premise: [], consequence: identity });
// 推移律
print({ premise: [], consequence: transitive });
// 移入律
print({ premise: [], consequence: importation });
// 移出律
print({ premise: [], consequence: exportation });
// De Morgan
print({ premise: [], consequence: demorganAndOr });
print({ premise: [], consequence: demorganOrAnd });
// 対偶律
print({ premise: [], consequence: contraposition });
// 二重否定律
print({ premise: [], consequence: doubleNegation });
// 排中律
print({ premise: [], consequence: excludeMiddle });
// 矛盾律
print({ premise: [], consequence: nonContradiction });
// モーダスポネンス
print({ premise: [], consequence: modusPonens });
// 選言的三段論法
print({ premise: [], consequence: disjunctiveSyllogism });
// 構成的両刃論法
print({ premise: [], consequence: constructiveDilemma });
// 誤謬
// 後件肯定
print({ premise: [], consequence: affirmingConsequent });
// 後件肯定
print({ premise: [], consequence: denyingAntecedent });
// 選言肯定
print({ premise: [], consequence: affirmingDisjunct });
// 誤謬の誤謬
print({ premise: [], consequence: fallancyFallancy });
