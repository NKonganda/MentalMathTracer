import type { Strategy } from '../types';
import { placeValueSplit } from './placeValueSplit';
import { x10Halve } from './x10Halve';
import { x100Quarter } from './x100Quarter';
import { x1000Eighth } from './x1000Eighth';
import { roundDownCompensate, roundUpCompensate } from './roundCompensateMul';
import { quarterAnchor } from './quarterAnchor';
import { x11Adjust, x11DigitSum, x9Adjust } from './nearTenAdjust';
import { doubling } from './doubling';
import { diffSquares } from './diffSquares';
import { factorRegroup } from './factorRegroup';
import { squareEnds5 } from './squareEnds5';
import { squareNear50 } from './squareNear50';
import { squareNear100 } from './squareNear100';
import { squareExpand } from './squareExpand';
import { leftToRight } from './leftToRight';
import { roundCompensateAdd } from './roundCompensateAdd';
import { makeRound } from './makeRound';
import { complement } from './complement';
import { addUp } from './addUp';
import { divShift } from './divShift';
import { factorDivisor } from './factorDivisor';
import { roundDividend } from './roundDividend';
import { pctBlocks } from './pctBlocks';
import { pctSwap } from './pctSwap';
import { pctShortcut } from './pctShortcut';

export const allStrategies: Strategy[] = [
  placeValueSplit,
  x10Halve,
  x100Quarter,
  x1000Eighth,
  roundDownCompensate,
  roundUpCompensate,
  quarterAnchor,
  x9Adjust,
  x11Adjust,
  x11DigitSum,
  doubling,
  diffSquares,
  factorRegroup,
  squareEnds5,
  squareNear50,
  squareNear100,
  squareExpand,
  leftToRight,
  roundCompensateAdd,
  makeRound,
  complement,
  addUp,
  divShift,
  factorDivisor,
  roundDividend,
  pctBlocks,
  pctSwap,
  pctShortcut,
];
