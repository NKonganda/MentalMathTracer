import type { Problem } from './types';

export type ParseResult = { ok: true; problem: Problem } | { ok: false; error: string };

const NUM = String.raw`(\d+(?:\.\d+)?)`;
const PCT_RE = new RegExp(`^${NUM}\\s*%\\s*of\\s*${NUM}$`);
const SQ_RE = new RegExp(`^${NUM}\\s*\\^\\s*2$`);
const BIN_RE = new RegExp(`^${NUM}\\s*([+\\-*/])\\s*${NUM}$`);

function good(op: Problem['op'], a: number, b: number, raw: string): ParseResult {
  return { ok: true, problem: { op, a, b, raw: raw.trim() } };
}

export function parse(raw: string): ParseResult {
  let s = raw
    .trim()
    .toLowerCase()
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/²/g, '^2')
    .replace(/,/g, '');

  if (!s) return { ok: false, error: 'Type a problem like 77 × 5 or 15% of 240.' };

  const pct = s.match(PCT_RE);
  if (pct) return good('pct', +pct[1], +pct[2], raw);

  const sq = s.match(SQ_RE);
  if (sq) return good('square', +sq[1], +sq[1], raw);

  // "x" between numbers means multiply: "77 x 5", "77x5"
  s = s.replace(/(\d)\s*x\s*(\d)/g, '$1*$2');

  const bin = s.match(BIN_RE);
  if (bin) {
    const a = +bin[1];
    const b = +bin[3];
    const op = ({ '+': 'add', '-': 'sub', '*': 'mul', '/': 'div' } as const)[
      bin[2] as '+' | '-' | '*' | '/'
    ];
    if (op === 'div' && b === 0) return { ok: false, error: "Can't divide by zero." };
    if (op === 'mul' && a === b) return good('square', a, b, raw);
    return good(op, a, b, raw);
  }

  const opCount = (s.match(/[+\-*/^]/g) ?? []).length;
  if (opCount > 1) {
    return { ok: false, error: 'One operation at a time — try something like 68 + 57.' };
  }
  return { ok: false, error: "Couldn't read that — try 77 × 5, 48², or 15% of 240." };
}
