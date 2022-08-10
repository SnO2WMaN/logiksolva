// 1項の1階述語論理に関して

// 名前
export type Name = ["NAME", string];

// 変項
export type Variable = ["VAR", string];

// 1項演算子
export type Operator = ["OP", string, Term];

// 1項述語
export type Predicate = ["PRED", string, Term];

// 真理関数
export type Top = ["TOP"];
export type Bot = ["BOT"];
export type Not = ["NOT", PredFormula];
export type And = ["AND", PredFormula, PredFormula];
export type Or = ["OR", PredFormula, PredFormula];
export type Imp = ["IMP", PredFormula, PredFormula];
export type Eq = ["EQ", PredFormula, PredFormula];

// 特殊ケース
export type NotPredicate = ["NOT", Predicate];

// 量化子
export type ForAll = ["FORALL", Variable, PredFormula];
export type Exists = ["EXISTS", Variable, PredFormula];

// 項
export type Term = Name | Variable | Operator;

// 論理式
export type PredFormula = Predicate | Top | Bot | Not | And | Or | Imp | Eq | ForAll | Exists;
