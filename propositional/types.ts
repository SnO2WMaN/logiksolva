export type Prop = { type: "PROP"; id: string };
export type Not = { type: "NOT"; in: PropFormula };
export type And = { type: "AND"; left: PropFormula; right: PropFormula };
export type Or = { type: "OR"; left: PropFormula; right: PropFormula };
export type Implict = { type: "IMPLICT"; left: PropFormula; right: PropFormula };

export type PropFormula =
  | Prop
  | Not
  | And
  | Or
  | Implict;

export type SerialStep<f extends PropFormula = PropFormula> = {
  type: "SERIAL";
  formula: f;
};
export type PararellStep<f extends PropFormula = PropFormula> = {
  type: "PARARELL";
  formula: f;
  left: TransformStep[];
  right: TransformStep[];
};
export type TransformStep<f extends PropFormula = PropFormula> = SerialStep<f> | PararellStep<f>;
export type Tableau = TransformStep<PropFormula>[];
