import type { Step, StepOp } from './types';

export const isInt = (n: number): boolean => Number.isInteger(n);

export const numDigits = (n: number): number => Math.abs(Math.trunc(n)).toString().length;

/** 350 → 35, 1600 → 16, 0 → 0 */
export function stripZeros(n: number): number {
  n = Math.abs(n);
  while (n !== 0 && n % 10 === 0) n /= 10;
  return n;
}

/** Carries required to add a + b column by column. */
export function countCarries(a: number, b: number): number {
  return carryColumnSums(a, b).length;
}

/**
 * The column sums (carry-in included) that generate a carry when adding a + b.
 * The carry effect is graded, not on/off: RT rises ~44 ms per unit of the
 * units-column sum (Klein et al. 2010), so a carry from 8+6 costs more than
 * one from 7+4.
 */
export function carryColumnSums(a: number, b: number): number[] {
  if (!isInt(a) || !isInt(b) || a < 0 || b < 0) return [];
  const sums: number[] = [];
  let carry = 0;
  while (a > 0 || b > 0) {
    const s = (a % 10) + (b % 10) + carry;
    carry = s >= 10 ? 1 : 0;
    if (carry) sums.push(s);
    a = Math.trunc(a / 10);
    b = Math.trunc(b / 10);
  }
  return sums;
}

/** Borrows required to compute a − b column by column (a ≥ b ≥ 0). */
export function countBorrows(a: number, b: number): number {
  if (!isInt(a) || !isInt(b) || b < 0 || a < b) return 0;
  let borrows = 0;
  let borrow = 0;
  while (b > 0 || borrow > 0) {
    const d = (a % 10) - (b % 10) - borrow;
    borrow = d < 0 ? 1 : 0;
    if (borrow) borrows++;
    a = Math.trunc(a / 10);
    b = Math.trunc(b / 10);
    if (a === 0 && b === 0) break;
  }
  return borrows;
}

/**
 * Carries in a single-digit × multi-digit column multiplication (17×5: 7×5=35,
 * carry the 3), split into total carries and "high" carries (value > 1, which
 * must be actively rehearsed). Zeros are stripped first (170×5 works like 17×5).
 * Returns zeros when both factors are multi-digit — that path is costed as a
 * cross-product problem, not a column walk.
 */
export function countMulCarries(a: number, b: number): { carries: number; high: number } {
  const x = stripZeros(a);
  const y = stripZeros(b);
  if (!isInt(x) || !isInt(y)) return { carries: 0, high: 0 };
  const small = Math.min(x, y);
  let big = Math.max(x, y);
  if (small > 9 || big < 10) return { carries: 0, high: 0 };
  let carries = 0;
  let high = 0;
  let carry = 0;
  while (big > 0) {
    const p = (big % 10) * small + carry;
    carry = Math.trunc(p / 10);
    big = Math.trunc(big / 10);
    // a final carry-out just writes the leading digit — nothing to hold
    if (big > 0 && carry > 0) {
      carries++;
      if (carry > 1) high++;
    }
  }
  return { carries, high };
}

/**
 * Odd digits above the units position: each one sends a "+5" into the next
 * position right when halving (Trachtenberg's rule), which is structurally a
 * carry. 770 → 2 (both sevens), 1300 → 2 (the 1 and the 3), 460 → 0.
 */
export function oddDigitsAboveUnits(n: number): number {
  let m = Math.trunc(Math.abs(n) / 10);
  let odd = 0;
  while (m > 0) {
    if (m % 2 === 1) odd++;
    m = Math.trunc(m / 10);
  }
  return odd;
}

/** Digits ≥ 5 in n — each one generates a carry when doubling. 36 → 1, 78 → 2. */
export function highDigits(n: number): number {
  let m = Math.trunc(Math.abs(n));
  let high = 0;
  while (m > 0) {
    if (m % 10 >= 5) high++;
    m = Math.trunc(m / 10);
  }
  return high;
}

/** True if a × b reduces to a times-table fact once trailing zeros are stripped. */
export function isTimesTable(a: number, b: number): boolean {
  const x = stripZeros(a);
  const y = stripZeros(b);
  return isInt(x) && isInt(y) && x >= 1 && x <= 12 && y >= 1 && y <= 12;
}

/**
 * Fact retrieval grade for a step, if any.
 * 'table'  — instant retrieval: times tables (after stripping zeros, so 70×5
 *            is as free as 7×5), memorized squares ≤ 25², single-digit add/sub.
 * 'anchor' — quick but derived: quarter facts on 25/50/75/100 (75×5 = 375 is
 *            fast, but not as automatic as 7×5 = 35).
 */
export type FactKind = 'table' | 'anchor';

export function factKind(op: StepOp, operands: number[], result: number): FactKind | null {
  const abs = operands.map(Math.abs);
  if (op === 'mul') {
    const [a, b] = abs;
    if (isTimesTable(a, b)) return 'table';
    if (a === b && a <= 25) return 'table';
    if (
      [25, 50, 75, 100].some((k) => abs.includes(k)) &&
      Math.min(a, b) <= 20 &&
      isInt(result) &&
      result % 25 === 0
    ) {
      return 'anchor';
    }
  }
  if (op === 'div') {
    const [a, b] = abs;
    if (isTimesTable(b, Math.abs(result))) return 'table';
    if (isTimesTable(stripZeros(a), b)) return 'table';
  }
  if (op === 'add') {
    if (abs.every((x) => x < 10)) return 'table';
  }
  if (op === 'sub') {
    // inverses of single-digit additions: 13 − 6 is retrieved, not computed
    const [a, b] = abs;
    if (a <= 18 && b <= 9 && b <= a && Math.abs(result) <= 9) return 'table';
  }
  return null;
}

export function step(
  expr: string,
  result: number,
  op: StepOp,
  operands: number[],
  note?: string,
  substeps?: Step[],
): Step {
  const s: Step = { expr, result, op, operands };
  if (note) s.note = note;
  if (substeps) s.substeps = substeps;
  return s;
}

export const fmt = (n: number): string =>
  Number.isInteger(n) ? String(n) : String(Math.round(n * 10000) / 10000);
