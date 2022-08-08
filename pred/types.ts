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
export type Not = ["NOT", Formula];
export type And = ["AND", Formula, Formula];
export type Or = ["OR", Formula, Formula];
export type Imp = ["IMP", Formula, Formula];
export type Eq = ["EQ", Formula, Formula];

// 特殊ケース
export type NotPredicate = ["NOT", Predicate];

// 量化子
export type ForAll = ["FORALL", Variable, Formula];
export type Exists = ["EXISTS", Variable, Formula];

// 項
export type Term = Name | Variable | Operator;

// 論理式
export type Formula = Predicate | Top | Bot | Not | And | Or | Imp | Eq | ForAll | Exists;
