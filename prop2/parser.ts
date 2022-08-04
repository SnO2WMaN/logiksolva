// <e1> := <e2> | <e2>↔<e1>
// <e2> := <e3> | <e3>→<e2>
// <e3> := <e4> | <e4>∨<e3>
// <e4> := <pr> | <pr>∧<e4>
// <pr> := <al> | ¬<pr> | (<e1>)
// <al> := [P, Q, R, ...]+
export type Prop = ["PROP", string];
export type Not = ["NOT", PropFormula];
export type And = ["AND", PropFormula, PropFormula];
export type Or = ["OR", PropFormula, PropFormula];
export type Imp = ["IMP", PropFormula, PropFormula];
export type Eq = ["EQ", PropFormula, PropFormula];

export type PropFormula = Prop | Not | And | Or | Imp | Eq;

export const parsePr = (f: string): PropFormula | null => {
  const prop = /^([a-zA-Z]+)$/.exec(f);
  if (prop) return ["PROP", prop[1]];

  const not = /¬(.+)/.exec(f);
  if (not) {
    const inner = parsePr(not[1]);
    if (!inner) return null;
    return ["NOT", inner];
  }

  const form = /\((.+)\)/.exec(f);
  if (form) {
    const inner = parseE1(form[1]);
    if (!inner) return null;
    return inner;
  }
  return null;
};

export const parseE4 = (f: string, fi = 0): PropFormula | null => {
  const i = f.indexOf("∧", fi);
  if (i === -1) return parsePr(f);

  const pre = parsePr(f.slice(0, i));
  const pos = parseE4(f.slice(i + 1));

  if (!!pre && !!pos) return ["AND", pre, pos];
  return parseE4(f, i + 1);
};

export const parseE3 = (f: string, fi = 0): PropFormula | null => {
  const i = f.indexOf("∨", fi);
  if (i === -1) return parseE4(f);

  const pre = parseE4(f.slice(0, i));
  const pos = parseE3(f.slice(i + 1));

  if (!!pre && !!pos) return ["OR", pre, pos];
  return parseE3(f, i + 1);
};

export const parseE2 = (f: string, fi = 0): PropFormula | null => {
  const i = f.indexOf("→", fi);
  if (i === -1) return parseE3(f);

  const pre = parseE3(f.slice(0, i));
  const pos = parseE2(f.slice(i + 1));

  if (!!pre && !!pos) return ["IMP", pre, pos];
  return parseE2(f, i + 1);
};

export const parseE1 = (f: string, fi = 0): PropFormula | null => {
  const i = f.indexOf("↔", fi);
  if (i === -1) return parseE2(f);

  const pre = parseE2(f.slice(0, i));
  const pos = parseE1(f.slice(i + 1));

  if (!!pre && !!pos) return ["EQ", pre, pos];
  return parseE1(f, i + 1);
};

export const parseFormula = (f: string) => parseE1(f, 0);
