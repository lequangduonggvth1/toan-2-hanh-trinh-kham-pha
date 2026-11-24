export type NumberLineRangeKey = '0-20' | '0-50' | '0-80' | '0-100' | 'tens';

export interface NumberLineRange {
  key: NumberLineRangeKey;
  label: string;
  description: string;
  min: number;
  max: number;
  step: number;
}

export const NUMBER_LINE_RANGES: NumberLineRange[] = [
  { key: '0-20', label: '0 – 20', description: 'Đếm từng 1 trong phạm vi 20', min: 0, max: 20, step: 1 },
  { key: '0-50', label: '0 – 50', description: 'Đếm từng 1 trong phạm vi 50', min: 0, max: 50, step: 1 },
  { key: '0-80', label: '0 – 80', description: 'Đếm từng 1 trong phạm vi 80', min: 0, max: 80, step: 1 },
  { key: '0-100', label: '0 – 100 (đếm 1)', description: 'Đếm từng 1 từ 0 đến 100', min: 0, max: 100, step: 1 },
  { key: 'tens', label: 'Tròn chục (0 – 100)', description: 'Đếm thêm 10 (số tròn chục)', min: 0, max: 100, step: 10 },
];

export function clampNumberLineValue(value: number, range: NumberLineRange): number {
  const clamped = Math.max(range.min, Math.min(range.max, Math.round(value)));
  if (range.step === 10) {
    return Math.round(clamped / 10) * 10;
  }
  return clamped;
}

export function getNeighborsInRange(value: number, range: NumberLineRange): {
  prev: number | null;
  next: number | null;
} {
  const prev = value - range.step >= range.min ? value - range.step : null;
  const next = value + range.step <= range.max ? value + range.step : null;
  return { prev, next };
}

export type TenFrameOp = 'add' | 'sub';

export interface TenFrameValidation {
  valid: boolean;
  error: string | null;
}

export function validateTenFrameOperation(op: TenFrameOp, a: number, b: number): TenFrameValidation {
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    return { valid: false, error: 'Vui lòng nhập số tự nhiên nguyên.' };
  }
  if (op === 'add') {
    if (a < 2 || a > 9) {
      return { valid: false, error: 'Số hạng thứ nhất cần từ 2 đến 9 để gộp đủ 10.' };
    }
    if (b < 2 || b > 9) {
      return { valid: false, error: 'Số hạng thứ hai cần từ 2 đến 9.' };
    }
    if (a + b <= 10) {
      return {
        valid: false,
        error: `Phép cộng ${a} + ${b} = ${a + b} chưa vượt quá 10. Hãy chọn hai số có tổng lớn hơn 10.`,
      };
    }
    return { valid: true, error: null };
  }

  if (a < 11 || a > 18) {
    return { valid: false, error: 'Số bị trừ cần từ 11 đến 18 để thực hành trừ qua 10.' };
  }
  if (b < 2 || b > 9) {
    return { valid: false, error: 'Số trừ cần từ 2 đến 9.' };
  }
  if (a - b >= 10) {
    return {
      valid: false,
      error: `Phép trừ ${a} − ${b} = ${a - b} chưa trừ qua 10. Hãy chọn số trừ lớn hơn ${a - 10}.`,
    };
  }
  return { valid: true, error: null };
}

export interface TenFrameBreakdown {
  first: number;
  second: number;
  result: number;
  splitPart1: number;
  splitPart2: number;
  intermediateEquation: string;
  finalEquation: string;
}

export function computeTenFrameBreakdown(op: TenFrameOp, a: number, b: number): TenFrameBreakdown {
  if (op === 'add') {
    const splitPart1 = 10 - a;
    const splitPart2 = b - splitPart1;
    const result = a + b;
    return {
      first: a,
      second: b,
      result,
      splitPart1,
      splitPart2,
      intermediateEquation: `${a} + ${splitPart1} = 10`,
      finalEquation: `10 + ${splitPart2} = ${result}`,
    };
  }
  const splitPart1 = a - 10;
  const splitPart2 = b - splitPart1;
  const result = a - b;
  return {
    first: a,
    second: b,
    result,
    splitPart1,
    splitPart2,
    intermediateEquation: `${a} − ${splitPart1} = 10`,
    finalEquation: `10 − ${splitPart2} = ${result}`,
  };
}

export interface PlaceValueState {
  tens: number;
  ones: number;
}

export function ungroupOneTen(state: PlaceValueState): PlaceValueState | null {
  if (state.tens <= 0) return null;
  return {
    tens: state.tens - 1,
    ones: state.ones + 10,
  };
}

export function bundleTenOnes(state: PlaceValueState): PlaceValueState | null {
  if (state.ones < 10 || state.tens >= 10) return null;
  return {
    tens: state.tens + 1,
    ones: state.ones - 10,
  };
}

export type ColumnCalcOp = 'add' | 'sub';

export interface ColumnCalcValidation {
  valid: boolean;
  error: string | null;
}

export function validateColumnCalc(op: ColumnCalcOp, a: number, b: number): ColumnCalcValidation {
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    return { valid: false, error: 'Vui lòng nhập số tự nhiên nguyên.' };
  }
  if (a < 0 || a > 99 || b < 0 || b > 99) {
    return { valid: false, error: 'Các số nhập vào cần nằm trong phạm vi từ 0 đến 99.' };
  }
  if (op === 'add') {
    if (a + b > 100) {
      return {
        valid: false,
        error: `Tổng ${a} + ${b} = ${a + b} vượt quá phạm vi 100 của lớp 2. Hãy giảm một trong hai số.`,
      };
    }
    return { valid: true, error: null };
  }
  if (a < b) {
    return {
      valid: false,
      error: `Số bị trừ (${a}) phải lớn hơn hoặc bằng số trừ (${b}).`,
    };
  }
  return { valid: true, error: null };
}

export interface ColumnCalcAnalysis {
  op: ColumnCalcOp;
  a: number;
  b: number;
  aTens: number;
  aOnes: number;
  bTens: number;
  bOnes: number;
  hasCarry: boolean;
  hasBorrow: boolean;
  result: number;
  resHundreds: number;
  resTens: number;
  resOnes: number;
  step1Text: string;
  step2Text: string;
  step3Text: string;
}

export function analyzeColumnCalculation(op: ColumnCalcOp, a: number, b: number): ColumnCalcAnalysis {
  const aTens = Math.floor(a / 10);
  const aOnes = a % 10;
  const bTens = Math.floor(b / 10);
  const bOnes = b % 10;

  const hasCarry = op === 'add' && aOnes + bOnes >= 10;
  const hasBorrow = op === 'sub' && aOnes < bOnes;
  const result = op === 'add' ? a + b : a - b;
  const resHundreds = Math.floor(result / 100);
  const resTens = Math.floor((result % 100) / 10);
  const resOnes = result % 10;

  if (op === 'add') {
    const onesSum = aOnes + bOnes;
    const tensAfterCarry = aTens + bTens + (hasCarry ? 1 : 0);
    const step1Text = `Biểu diễn ${a} (${aTens} chục, ${aOnes} đơn vị) và ${b} (${bTens} chục, ${bOnes} đơn vị). Đặt tính thẳng cột.`;
    const step2Text = hasCarry
      ? `Hàng đơn vị: ${aOnes} + ${bOnes} = ${onesSum}. Gộp 10 đơn vị thành 1 chục (nhớ 1), còn ${resOnes} đơn vị, viết ${resOnes}.`
      : `Hàng đơn vị: ${aOnes} + ${bOnes} = ${resOnes}, viết ${resOnes}.`;
    const step3Text =
      result === 100
        ? `Hàng chục: ${aTens} + ${bTens}${hasCarry ? ' + 1 (nhớ)' : ''} = 10 chục. Gộp 10 chục thành 1 trăm (100). Kết quả: 100.`
        : hasCarry
        ? `Hàng chục: ${aTens} + ${bTens} = ${aTens + bTens}, thêm 1 nhớ bằng ${tensAfterCarry}, viết ${resTens}. Kết quả: ${result}.`
        : `Hàng chục: ${aTens} + ${bTens} = ${resTens}, viết ${resTens}. Kết quả: ${result}.`;

    return {
      op,
      a,
      b,
      aTens,
      aOnes,
      bTens,
      bOnes,
      hasCarry,
      hasBorrow: false,
      result,
      resHundreds,
      resTens,
      resOnes,
      step1Text,
      step2Text,
      step3Text,
    };
  }

  const remainingATens = aTens - (hasBorrow ? 1 : 0);
  const effectiveAOnes = aOnes + (hasBorrow ? 10 : 0);

  const step1Text = `Biểu diễn số bị trừ ${a} (${aTens} chục, ${aOnes} đơn vị). Cần bớt đi ${b} (${bTens} chục, ${bOnes} đơn vị).`;
  const step2Text = hasBorrow
    ? `Ở hàng đơn vị, ${aOnes} không trừ được ${bOnes}, ta mượn 1 chục, đổi thành ${effectiveAOnes} đơn vị. ${effectiveAOnes} − ${bOnes} = ${resOnes}, viết ${resOnes}.`
    : `Ở hàng đơn vị, ${aOnes} − ${bOnes} = ${resOnes}, viết ${resOnes}.`;
  const step3Text = hasBorrow
    ? `Hàng chục còn ${remainingATens} chục (${aTens} − 1 = ${remainingATens}). ${remainingATens} − ${bTens} = ${resTens}, viết ${resTens}. Kết quả: ${result}.`
    : `Hàng chục: ${aTens} − ${bTens} = ${resTens}, viết ${resTens}. Kết quả: ${result}.`;

  return {
    op,
    a,
    b,
    aTens,
    aOnes,
    bTens,
    bOnes,
    hasCarry: false,
    hasBorrow,
    result,
    resHundreds,
    resTens,
    resOnes,
    step1Text,
    step2Text,
    step3Text,
  };
}

export function formatLengthConversion(lengthCm: number): {
  cm: number;
  dm: number;
  remCm: number;
  label: string;
} {
  const safeCm = Math.max(0, Math.round(lengthCm));
  const dm = Math.floor(safeCm / 10);
  const remCm = safeCm % 10;
  if (dm === 0) {
    return { cm: safeCm, dm, remCm, label: `${safeCm} cm` };
  }
  if (remCm === 0) {
    return { cm: safeCm, dm, remCm, label: `${dm} dm` };
  }
  return { cm: safeCm, dm, remCm, label: `${dm} dm ${remCm} cm` };
}

export function clampLiters(current: number, delta: number, maxCapacity = 10): {
  next: number;
  overflow: boolean;
  underflow: boolean;
} {
  const raw = current + delta;
  if (raw > maxCapacity) {
    return { next: current, overflow: true, underflow: false };
  }
  if (raw < 0) {
    return { next: 0, overflow: false, underflow: true };
  }
  return { next: raw, overflow: false, underflow: false };
}

export interface VietnameseTimeInfo {
  hour24: number;
  minute: number;
  hour12: number;
  period: 'morning' | 'afternoon' | 'evening';
  periodLabel: string;
  digitalText: string;
  primaryReading: string;
  halfHourAlias: string | null;
  reading24h: string;
  hourAngle: number;
  minuteAngle: number;
}

export function getVietnameseTimeInfo(totalMinutes: number): VietnameseTimeInfo {
  const normalized = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const hour24 = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  const period: 'morning' | 'afternoon' | 'evening' =
    hour24 >= 5 && hour24 < 12 ? 'morning' : hour24 >= 12 && hour24 < 18 ? 'afternoon' : 'evening';

  const periodLabel =
    hour24 < 5
      ? 'đêm'
      : hour24 < 11
      ? 'sáng'
      : hour24 < 13
      ? 'trưa'
      : hour24 < 18
      ? 'chiều'
      : 'tối';

  const digitalText = `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  const minuteText = minute === 0 ? 'đúng' : `${minute} phút`;
  const primaryReading = `${hour12} giờ ${minuteText} ${periodLabel}`;
  const halfHourAlias = minute === 30 ? `${hour12} giờ rưỡi ${periodLabel}` : null;
  const reading24h = `${hour24} giờ${minute > 0 ? ` ${minute} phút` : ''}`;

  const minuteAngle = minute * 6;
  const hourAngle = ((hour24 % 12) + minute / 60) * 30;

  return {
    hour24,
    minute,
    hour12,
    period,
    periodLabel,
    digitalText,
    primaryReading,
    halfHourAlias,
    reading24h,
    hourAngle,
    minuteAngle,
  };
}
