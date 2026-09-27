import { describe, expect, it } from 'vitest';
import type { Op, Problem, Strategy } from './types';
import { trueAnswer } from './rank';
import { allStrategies } from './strategies';
import { placeValueSplit } from './strategies/placeValueSplit';
import { x10Halve } from './strategies/x10Halve';
import { x100Quarter } from './strategies/x100Quarter';
import { x1000Eighth } from './strategies/x1000Eighth';
import { roundDownCompensate, roundUpCompensate } from './strategies/roundCompensateMul';
import { quarterAnchor } from './strategies/quarterAnchor';
import { x11Adjust, x11DigitSum, x9Adjust } from './strategies/nearTenAdjust';
import { doubling } from './strategies/doubling';
import { diffSquares } from './strategies/diffSquares';
import { factorRegroup } from './strategies/factorRegroup';
import { squareEnds5 } from './strategies/squareEnds5';
import { squareNear50 } from './strategies/squareNear50';
import { squareNear100 } from './strategies/squareNear100';
import { squareExpand } from './strategies/squareExpand';
import { leftToRight } from './strategies/leftToRight';
import { roundCompensateAdd } from './strategies/roundCompensateAdd';
import { makeRound } from './strategies/makeRound';
import { complement } from './strategies/complement';
import { addUp } from './strategies/addUp';
import { divShift } from './strategies/divShift';
import { factorDivisor } from './strategies/factorDivisor';
import { roundDividend } from './strategies/roundDividend';
import { pctBlocks } from './strategies/pctBlocks';
import { pctSwap } from './strategies/pctSwap';
import { pctShortcut } from './strategies/pctShortcut';

const P = (op: Op, a: number, b: number): Problem => ({ op, a, b, raw: '' });
const mul = (a: number, b: number) => P('mul', a, b);
const add = (a: number, b: number) => P('add', a, b);
const sub = (a: number, b: number) => P('sub', a, b);
const div = (a: number, b: number) => P('div', a, b);
const pct = (a: number, b: number) => P('pct', a, b);
const sq = (n: number) => P('square', n, n);

interface Case {
  s: Strategy;
  yes: Problem[];
  no: Problem[];
}

const cases: Case[] = [
  { s: placeValueSplit, yes: [mul(77, 5), mul(23, 17), mul(346, 4)], no: [mul(70, 5), add(68, 57), mul(8, 7)] },
  { s: x10Halve, yes: [mul(46, 5), mul(5, 77), mul(124, 5)], no: [mul(46, 4), div(46, 5), mul(55, 3)] },
  { s: x100Quarter, yes: [mul(16, 25), mul(25, 13), mul(48, 25)], no: [mul(16, 24), mul(5, 5), pct(25, 80)] },
  { s: x1000Eighth, yes: [mul(16, 125), mul(125, 9), mul(24, 125)], no: [mul(126, 8), mul(12, 5), sq(125)] },
  { s: roundUpCompensate, yes: [mul(77, 5), mul(19, 7), mul(48, 6)], no: [mul(70, 5), mul(25, 4), mul(13, 13)] },
  { s: roundDownCompensate, yes: [mul(77, 5), mul(52, 8), mul(41, 6)], no: [mul(46, 5), mul(20, 9), add(77, 5)] },
  { s: quarterAnchor, yes: [mul(16, 25), mul(75, 5), mul(50, 14)], no: [mul(26, 4), mul(25, 125), sub(25, 5)] },
  { s: x9Adjust, yes: [mul(9, 34), mul(47, 9), mul(9, 9)], no: [mul(19, 4), mul(90, 3), add(9, 5)] },
  { s: x11Adjust, yes: [mul(11, 34), mul(62, 11), mul(11, 11)], no: [mul(12, 13), mul(110, 3), div(22, 11)] },
  { s: x11DigitSum, yes: [mul(11, 34), mul(45, 11), mul(11, 72)], no: [mul(11, 89), mul(11, 7), mul(11, 340)] },
  { s: doubling, yes: [mul(4, 35), mul(8, 27), mul(6, 15)], no: [mul(5, 12), mul(7, 13), div(8, 4)] },
  { s: diffSquares, yes: [mul(23, 17), mul(48, 52), mul(19, 21)], no: [mul(23, 18), mul(48, 48), mul(123, 77)] },
  { s: factorRegroup, yes: [mul(16, 25), mul(12, 15), mul(24, 5)], no: [mul(23, 17), mul(7, 13), add(16, 25)] },
  { s: squareEnds5, yes: [sq(35), sq(75), sq(105)], no: [sq(34), sq(5), mul(35, 36)] },
  { s: squareNear50, yes: [sq(48), sq(53), sq(59)], no: [sq(50), sq(75), sq(35)] },
  { s: squareNear100, yes: [sq(97), sq(104), sq(112)], no: [sq(100), sq(80), sq(130)] },
  { s: squareExpand, yes: [sq(23), sq(62), sq(127)], no: [sq(45), sq(48), sq(20)] },
  { s: leftToRight, yes: [add(68, 57), sub(925, 347), add(345, 234)], no: [add(68, 7), sub(23, 47), mul(68, 57)] },
  { s: roundCompensateAdd, yes: [add(68, 57), add(34, 29), sub(825, 198)], no: [add(23, 44), sub(64, 23), mul(68, 57)] },
  { s: makeRound, yes: [add(68, 57), add(29, 36), add(44, 38)], no: [add(21, 43), sub(68, 57), add(30, 50)] },
  { s: complement, yes: [sub(1000, 423), sub(100, 37), sub(10000, 4567)], no: [sub(1000, 7), sub(900, 423), sub(100, 150)] },
  { s: addUp, yes: [sub(1000, 423), sub(632, 485), sub(150, 87)], no: [sub(100, 50), sub(87, 80), mul(1000, 423)] },
  { s: divShift, yes: [div(230, 5), div(800, 25), div(340, 5)], no: [div(230, 4), div(230, 10), mul(230, 5)] },
  { s: factorDivisor, yes: [div(144, 12), div(126, 14), div(96, 16)], no: [div(144, 13), div(145, 12), mul(144, 12)] },
  { s: roundDividend, yes: [div(144, 12), div(156, 12), div(91, 7)], no: [div(48, 12), div(150, 12), div(120, 12)] },
  { s: pctBlocks, yes: [pct(15, 240), pct(35, 60), pct(90, 40)], no: [pct(50, 240), pct(12, 50), pct(10, 240)] },
  { s: pctSwap, yes: [pct(36, 25), pct(14, 50), pct(32, 5)], no: [pct(25, 36), pct(36, 24), pct(50, 50)] },
  { s: pctShortcut, yes: [pct(25, 240), pct(50, 86), pct(75, 64)], no: [pct(15, 240), pct(30, 50), pct(24, 25)] },
];

it('every registered strategy has a test case', () => {
  expect(new Set(cases.map((c) => c.s.id)).size).toBe(allStrategies.length);
});

const label = (p: Problem) => `${p.op}(${p.a}, ${p.b})`;

for (const { s, yes, no } of cases) {
  describe(s.id, () => {
    for (const p of yes) {
      it(`applies to ${label(p)}`, () => expect(s.applies(p)).toBe(true));
    }
    for (const p of no) {
      it(`does not apply to ${label(p)}`, () => expect(s.applies(p)).toBe(false));
    }
    for (const p of yes) {
      it(`expands ${label(p)} to the correct answer`, () => {
        const tree = s.expand(p);
        expect(tree.answer).toBeCloseTo(trueAnswer(p), 9);
        expect(tree.steps.length).toBeGreaterThan(0);
        expect(tree.steps[tree.steps.length - 1].result).toBeCloseTo(tree.answer, 9);
      });
    }
  });
}
