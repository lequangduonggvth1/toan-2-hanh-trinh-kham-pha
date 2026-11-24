import test from 'node:test';
import assert from 'node:assert/strict';
import {
  NUMBER_LINE_RANGES,
  clampNumberLineValue,
  getNeighborsInRange,
  validateTenFrameOperation,
  computeTenFrameBreakdown,
  ungroupOneTen,
  bundleTenOnes,
  validateColumnCalc,
  analyzeColumnCalculation,
  formatLengthConversion,
  clampLiters,
  getVietnameseTimeInfo,
} from './mathEngine.ts';
import { readNumberVietnamese } from './vietnameseMath.ts';

test('Number Line ranges and neighbor boundaries', () => {
  const r20 = NUMBER_LINE_RANGES.find((r) => r.key === '0-20')!;
  const r50 = NUMBER_LINE_RANGES.find((r) => r.key === '0-50')!;
  const r100 = NUMBER_LINE_RANGES.find((r) => r.key === '0-100')!;
  const rTens = NUMBER_LINE_RANGES.find((r) => r.key === 'tens')!;

  assert.equal(clampNumberLineValue(25, r20), 20);
  assert.equal(clampNumberLineValue(-5, r20), 0);
  assert.deepEqual(getNeighborsInRange(14, r20), { prev: 13, next: 15 });
  assert.deepEqual(getNeighborsInRange(40, r50), { prev: 39, next: 41 });
  assert.deepEqual(getNeighborsInRange(60, rTens), { prev: 50, next: 70 });
  assert.deepEqual(getNeighborsInRange(99, r100), { prev: 98, next: 100 });
  assert.deepEqual(getNeighborsInRange(0, r100), { prev: null, next: 1 });
  assert.deepEqual(getNeighborsInRange(100, r100), { prev: 99, next: null });
});

test('Ten-Frame bridging-10 addition and subtraction', () => {
  const addCases: Array<[number, number, number, string, string]> = [
    [8, 5, 13, '8 + 2 = 10', '10 + 3 = 13'],
    [9, 5, 14, '9 + 1 = 10', '10 + 4 = 14'],
    [8, 6, 14, '8 + 2 = 10', '10 + 4 = 14'],
    [7, 5, 12, '7 + 3 = 10', '10 + 2 = 12'],
    [6, 7, 13, '6 + 4 = 10', '10 + 3 = 13'],
  ];
  for (const [a, b, sum, inter, finalEq] of addCases) {
    assert.equal(validateTenFrameOperation('add', a, b).valid, true);
    const res = computeTenFrameBreakdown('add', a, b);
    assert.equal(res.result, sum);
    assert.equal(res.intermediateEquation, inter);
    assert.equal(res.finalEquation, finalEq);
  }

  const subCases: Array<[number, number, number, string, string]> = [
    [13, 5, 8, '13 − 3 = 10', '10 − 2 = 8'],
    [12, 7, 5, '12 − 2 = 10', '10 − 5 = 5'],
    [11, 4, 7, '11 − 1 = 10', '10 − 3 = 7'],
    [15, 8, 7, '15 − 5 = 10', '10 − 3 = 7'],
    [14, 6, 8, '14 − 4 = 10', '10 − 2 = 8'],
  ];
  for (const [a, b, diff, inter, finalEq] of subCases) {
    assert.equal(validateTenFrameOperation('sub', a, b).valid, true);
    const res = computeTenFrameBreakdown('sub', a, b);
    assert.equal(res.result, diff);
    assert.equal(res.intermediateEquation, inter);
    assert.equal(res.finalEquation, finalEq);
  }

  // Invalid cases rejected cleanly
  assert.equal(validateTenFrameOperation('add', 4, 5).valid, false);
  assert.equal(validateTenFrameOperation('sub', 15, 3).valid, false);
});

test('Base-10 ungrouping, bundling, and column calculations', () => {
  const start = { tens: 3, ones: 6 };
  const ungrouped = ungroupOneTen(start);
  assert.deepEqual(ungrouped, { tens: 2, ones: 16 });
  assert.equal(ungrouped!.tens * 10 + ungrouped!.ones, 36);

  // Cannot bundle when ones < 10
  assert.equal(bundleTenOnes(start), null);
  // Bundle back to 3 tens 6 ones
  assert.deepEqual(bundleTenOnes(ungrouped!), { tens: 3, ones: 6 });

  const c52 = analyzeColumnCalculation('sub', 52, 18);
  assert.equal(c52.result, 34);
  assert.equal(c52.hasBorrow, true);
  assert.match(c52.step2Text, /12 − 8 = 4/);
  assert.match(c52.step3Text, /còn 4 chục.*4 − 1 = 3/);

  const c62 = analyzeColumnCalculation('sub', 62, 18);
  assert.equal(c62.result, 44);
  assert.match(c62.step2Text, /12 − 8 = 4/);
  assert.match(c62.step3Text, /còn 5 chục.*5 − 1 = 4/);

  const c50 = analyzeColumnCalculation('sub', 50, 24);
  assert.equal(c50.result, 26);
  assert.match(c50.step2Text, /10 − 4 = 6/);
  assert.match(c50.step3Text, /còn 4 chục.*4 − 2 = 2/);

  const c37 = analyzeColumnCalculation('add', 37, 25);
  assert.equal(c37.result, 62);
  assert.equal(c37.hasCarry, true);

  const c99 = analyzeColumnCalculation('add', 99, 1);
  assert.equal(c99.result, 100);
  assert.equal(validateColumnCalc('add', 99, 1).valid, true);
  assert.equal(validateColumnCalc('add', 99, 2).valid, false);
  assert.equal(validateColumnCalc('sub', 20, 35).valid, false);
});

test('Measurement conversions and capacity bounds', () => {
  assert.equal(formatLengthConversion(10).label, '1 dm');
  assert.equal(formatLengthConversion(12).label, '1 dm 2 cm');
  assert.equal(formatLengthConversion(20).label, '2 dm');

  assert.deepEqual(clampLiters(8, 2, 10), { next: 10, overflow: false, underflow: false });
  assert.deepEqual(clampLiters(9, 2, 10), { next: 9, overflow: true, underflow: false });
  assert.deepEqual(clampLiters(0, -1, 10), { next: 0, overflow: false, underflow: true });
});

test('Clock 24h-to-12h Vietnamese formatting and continuous hand angles', () => {
  const t0700 = getVietnameseTimeInfo(7 * 60);
  assert.equal(t0700.digitalText, '07:00');
  assert.equal(t0700.primaryReading, '7 giờ đúng sáng');
  assert.equal(t0700.hourAngle, 210);
  assert.equal(t0700.minuteAngle, 0);

  const t0915 = getVietnameseTimeInfo(9 * 60 + 15);
  assert.equal(t0915.digitalText, '09:15');
  assert.equal(t0915.primaryReading, '9 giờ 15 phút sáng');
  assert.equal(t0915.hourAngle, 277.5);
  assert.equal(t0915.minuteAngle, 90);

  const t1430 = getVietnameseTimeInfo(14 * 60 + 30);
  assert.equal(t1430.digitalText, '14:30');
  assert.equal(t1430.primaryReading, '2 giờ 30 phút chiều');
  assert.equal(t1430.halfHourAlias, '2 giờ rưỡi chiều');
  assert.equal(t1430.hourAngle, 75);
  assert.equal(t1430.minuteAngle, 180);

  const t2000 = getVietnameseTimeInfo(20 * 60);
  assert.equal(t2000.digitalText, '20:00');
  assert.equal(t2000.primaryReading, '8 giờ đúng tối');

  const t2115 = getVietnameseTimeInfo(21 * 60 + 15);
  assert.equal(t2115.digitalText, '21:15');
  assert.equal(t2115.primaryReading, '9 giờ 15 phút tối');

  assert.equal(readNumberVietnamese(36), 'ba mươi sáu');
  assert.equal(readNumberVietnamese(100), 'một trăm');
});
