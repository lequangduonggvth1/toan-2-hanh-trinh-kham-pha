import React, { useState } from 'react';
import { ChevronRight, RotateCcw, Plus, Minus, ArrowRight } from 'lucide-react';
import {
  TenFrameOp,
  computeTenFrameBreakdown,
  validateTenFrameOperation,
} from '../utils/mathEngine';

interface PresetItem {
  op: TenFrameOp;
  a: number;
  b: number;
}

const ADD_PRESETS: PresetItem[] = [
  { op: 'add', a: 8, b: 5 },
  { op: 'add', a: 9, b: 5 },
  { op: 'add', a: 8, b: 6 },
  { op: 'add', a: 7, b: 5 },
  { op: 'add', a: 6, b: 7 },
];

const SUB_PRESETS: PresetItem[] = [
  { op: 'sub', a: 13, b: 5 },
  { op: 'sub', a: 12, b: 7 },
  { op: 'sub', a: 11, b: 4 },
  { op: 'sub', a: 15, b: 8 },
  { op: 'sub', a: 14, b: 6 },
];

export const TenFrameTool: React.FC = () => {
  const [mode, setMode] = useState<TenFrameOp>('add');
  const [firstNum, setFirstNum] = useState<number>(8);
  const [secondNum, setSecondNum] = useState<number>(5);
  const [draftFirst, setDraftFirst] = useState<string>('8');
  const [draftSecond, setDraftSecond] = useState<string>('5');
  const [inputError, setInputError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const breakdown = computeTenFrameBreakdown(mode, firstNum, secondNum);
  const {
    result,
    splitPart1,
    splitPart2,
    intermediateEquation,
    finalEquation,
  } = breakdown;

  const handleModeSwitch = (nextMode: TenFrameOp) => {
    setMode(nextMode);
    setStep(1);
    setInputError(null);
    if (nextMode === 'add') {
      setFirstNum(8);
      setSecondNum(5);
      setDraftFirst('8');
      setDraftSecond('5');
    } else {
      setFirstNum(13);
      setSecondNum(5);
      setDraftFirst('13');
      setDraftSecond('5');
    }
  };

  const applyPreset = (nextMode: TenFrameOp, a: number, b: number) => {
    setMode(nextMode);
    setFirstNum(a);
    setSecondNum(b);
    setDraftFirst(String(a));
    setDraftSecond(String(b));
    setInputError(null);
    setStep(1);
  };

  const tryApplyInputs = (rawA: string, rawB: string) => {
    setDraftFirst(rawA);
    setDraftSecond(rawB);
    if (rawA.trim() === '' || rawB.trim() === '') {
      setInputError('Hãy nhập đủ cả hai số.');
      return;
    }
    const a = Number(rawA);
    const b = Number(rawB);
    const check = validateTenFrameOperation(mode, a, b);
    if (!check.valid) {
      setInputError(check.error);
      return;
    }
    setInputError(null);
    setFirstNum(a);
    setSecondNum(b);
    setStep(1);
  };

  const renderAddFrames = () => {
    const frame1 = Array.from({ length: 10 }, (_, i) => i);
    const frame2 = Array.from({ length: 10 }, (_, i) => i + 10);

    const renderFrame = (indices: number[], title: string, baseIdx: number) => (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>{title}</span>
          <span className="font-mono-tabular">
            {baseIdx === 0
              ? step === 1
                ? `${firstNum}/10 chấm`
                : '10/10 chấm (Đủ 1 chục)'
              : step === 1
              ? `${secondNum}/10 chấm`
              : `${splitPart2}/10 chấm còn lại`}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-2.5">
          {indices.map((idx) => {
            const localIdx = idx - baseIdx;
            let dotType: 'none' | 'first' | 'second' | 'moved-into' | 'moved-from' = 'none';

            if (step === 1) {
              if (baseIdx === 0 && localIdx < firstNum) dotType = 'first';
              if (baseIdx === 10 && localIdx < secondNum) dotType = 'second';
            } else {
              if (baseIdx === 0) {
                dotType = localIdx < firstNum ? 'first' : 'moved-into';
              } else {
                if (localIdx < splitPart2) {
                  dotType = 'second';
                } else if (localIdx < secondNum) {
                  dotType = 'moved-from';
                }
              }
            }

            return (
              <div
                key={idx}
                className={`aspect-square rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                  dotType === 'moved-into'
                    ? 'border-amber-400 bg-amber-50'
                    : dotType === 'moved-from'
                    ? 'border-dashed border-amber-300 bg-amber-50/40'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {dotType === 'first' && (
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-600 ring-2 ring-sky-200 shadow-xs"
                    title="Chấm xanh: số hạng thứ nhất"
                  />
                )}
                {dotType === 'second' && (
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500 shadow-xs"
                    title="Chấm vàng: số hạng thứ hai"
                  />
                )}
                {dotType === 'moved-into' && (
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500 ring-2 ring-amber-300 shadow-xs"
                    title="Chấm vàng vừa chuyển sang để đủ 10"
                  />
                )}
                {dotType === 'moved-from' && (
                  <div
                    className="w-5 h-5 rounded-full border border-dashed border-amber-400"
                    title="Đã chuyển sang khung 1"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderFrame(frame1, 'Khung 10 thứ nhất (Gộp cho đủ 10)', 0)}
        {renderFrame(frame2, 'Khung 10 thứ hai (Số hạng thứ hai)', 10)}
      </div>
    );
  };

  const renderSubFrames = () => {
    const frame1 = Array.from({ length: 10 }, (_, i) => i);
    const frame2 = Array.from({ length: 10 }, (_, i) => i + 10);

    const renderFrame = (indices: number[], title: string, baseIdx: number) => (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>{title}</span>
          <span className="font-mono-tabular">
            {baseIdx === 0
              ? step === 1
                ? '10/10 chấm'
                : step === 2
                ? `10 − ${splitPart2} chấm`
                : `${result}/10 chấm còn lại`
              : step === 1
              ? `${splitPart1}/10 chấm`
              : 'Đã bớt hết về 10'}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-2.5">
          {indices.map((idx) => {
            const localIdx = idx - baseIdx;
            const hasCounter = idx < firstNum;
            let state: 'empty' | 'active' | 'crossed-part1' | 'crossed-part2' | 'removed' = 'empty';

            if (hasCounter) {
              if (step === 1) {
                state = 'active';
              } else if (step === 2) {
                if (baseIdx === 10) {
                  state = 'crossed-part1';
                } else if (localIdx >= 10 - splitPart2) {
                  state = 'crossed-part2';
                } else {
                  state = 'active';
                }
              } else {
                state = idx < result ? 'active' : 'removed';
              }
            }

            return (
              <div
                key={idx}
                className="aspect-square rounded-lg border-2 border-slate-300 bg-white flex items-center justify-center relative"
              >
                {state === 'active' && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-600 shadow-xs" />
                )}
                {state === 'crossed-part1' && (
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-100 border-2 border-amber-500 flex items-center justify-center text-amber-800 font-bold text-sm"
                    title="Phần 1: Bớt để được 10"
                  >
                    ×
                  </div>
                )}
                {state === 'crossed-part2' && (
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-100 border-2 border-rose-500 flex items-center justify-center text-rose-700 font-bold text-sm"
                    title="Phần 2: Bớt tiếp từ 10"
                  >
                    ×
                  </div>
                )}
                {state === 'removed' && (
                  <div className="w-6 h-6 rounded-full border border-dashed border-slate-300" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderFrame(frame1, 'Khung 10 thứ nhất (1 chục)', 0)}
        {renderFrame(frame2, 'Khung 10 thứ hai (Phần đơn vị ban đầu)', 10)}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Interactive Stage */}
      <section className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {mode === 'add'
                ? 'Phép cộng qua 10 trong phạm vi 20'
                : 'Phép trừ qua 10 trong phạm vi 20'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {mode === 'add'
                ? 'Gộp cho đủ 10 rồi cộng với số còn lại.'
                : 'Trừ để được 10 rồi trừ tiếp số còn lại.'}
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => handleModeSwitch('add')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'add' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Phép cộng</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('sub')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'sub' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Phép trừ</span>
            </button>
          </div>
        </div>

        {/* Equation + Step Split Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 text-3xl sm:text-4xl font-bold font-mono-tabular text-slate-900">
              <span className="text-sky-700">{firstNum}</span>
              <span>{mode === 'add' ? '+' : '−'}</span>
              <span className="text-amber-600">{secondNum}</span>
              <span>=</span>
              <span className={step === 3 ? 'text-emerald-700' : 'text-slate-400'}>
                {step === 3 ? result : '?'}
              </span>
            </div>

            {/* Intermediate Equations synchronized with Step 2 & Step 3 */}
            {step >= 2 && (
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tabular font-semibold text-slate-700 pt-1">
                <span>
                  Tách {secondNum} = {splitPart1} + {splitPart2}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-sky-800 bg-sky-100/70 px-2 py-0.5 rounded">
                  {intermediateEquation}
                </span>
                {step === 3 && (
                  <>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                      {finalEquation}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStep(s as 1 | 2 | 3)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                  step === s
                    ? 'bg-sky-600 border-sky-600 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Bước {s}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Ten Frames */}
        {mode === 'add' ? renderAddFrames() : renderSubFrames()}

        {/* Pedagogical Explanation Step Strip */}
        <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-sky-900">
              {step === 1
                ? 'Bước 1: Biểu diễn các chấm tròn trên hai khung 10'
                : step === 2
                ? mode === 'add'
                  ? 'Bước 2: Tách số và chuyển chấm vàng cho đủ 10'
                  : 'Bước 2: Tách số trừ để bớt về 10 rồi bớt tiếp'
                : 'Bước 3: Đọc kết quả cuối cùng'}
            </span>
            {mode === 'add' ? (
              <p className="text-sm text-slate-800 font-medium">
                {step === 1 &&
                  `Đặt ${firstNum} chấm xanh ở khung 1 và ${secondNum} chấm vàng ở khung 2.`}
                {step === 2 &&
                  `Tách ${secondNum} = ${splitPart1} + ${splitPart2}. Chuyển ${splitPart1} chấm vàng sang khung 1 để đủ 10 (${intermediateEquation}), khung 2 còn ${splitPart2} chấm.`}
                {step === 3 &&
                  `Lấy 10 cộng thêm ${splitPart2} chấm còn lại: ${finalEquation}. Vậy ${firstNum} + ${secondNum} = ${result}.`}
              </p>
            ) : (
              <p className="text-sm text-slate-800 font-medium">
                {step === 1 &&
                  `Có ${firstNum} chấm xanh (10 chấm ở khung 1 và ${splitPart1} chấm ở khung 2).`}
                {step === 2 &&
                  `Tách ${secondNum} = ${splitPart1} + ${splitPart2}. Bớt ${splitPart1} chấm ở khung 2 để còn 10 (${intermediateEquation}), rồi gạch bớt tiếp ${splitPart2} chấm ở khung 1.`}
                {step === 3 &&
                  `Lấy 10 trừ đi ${splitPart2} còn ${result} chấm (${finalEquation}). Vậy ${firstNum} − ${secondNum} = ${result}.`}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setStep((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : 1))}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-sky-600 text-white text-xs font-semibold rounded-lg hover:bg-sky-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>{step < 3 ? 'Bước tiếp theo' : 'Xem lại từ đầu'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Right Control Deck */}
      <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Thiết lập phép tính</h3>
          <p className="text-xs text-slate-500 mt-1">
            Kéo thanh trượt hoặc tự nhập số để thực hành các phép tính qua 10.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <label htmlFor="tf-input-a" className="font-medium text-slate-700">
                {mode === 'add' ? 'Số hạng thứ nhất' : 'Số bị trừ'}
              </label>
              <input
                id="tf-input-a"
                type="number"
                min={mode === 'add' ? 2 : 11}
                max={mode === 'add' ? 9 : 18}
                value={draftFirst}
                onChange={(e) => tryApplyInputs(e.target.value, draftSecond)}
                className="w-16 px-2 py-1 text-right font-mono-tabular font-bold text-sky-700 border border-slate-200 rounded-md bg-slate-50"
              />
            </div>
            <input
              type="range"
              min={mode === 'add' ? 2 : 11}
              max={mode === 'add' ? 9 : 18}
              value={firstNum}
              onChange={(e) => {
                const a = Number(e.target.value);
                const minB = mode === 'add' ? Math.max(2, 10 - a + 1) : Math.max(2, a - 10 + 1);
                const adjustedB = Math.max(minB, Math.min(9, secondNum));
                applyPreset(mode, a, adjustedB);
              }}
              aria-label="Thanh trượt chọn số thứ nhất"
              className="w-full accent-sky-600 cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <label htmlFor="tf-input-b" className="font-medium text-slate-700">
                {mode === 'add' ? 'Số hạng thứ hai' : 'Số trừ'}
              </label>
              <input
                id="tf-input-b"
                type="number"
                min={2}
                max={9}
                value={draftSecond}
                onChange={(e) => tryApplyInputs(draftFirst, e.target.value)}
                className="w-16 px-2 py-1 text-right font-mono-tabular font-bold text-amber-600 border border-slate-200 rounded-md bg-slate-50"
              />
            </div>
            <input
              type="range"
              min={mode === 'add' ? Math.max(2, 10 - firstNum + 1) : Math.max(2, firstNum - 10 + 1)}
              max={9}
              value={secondNum}
              onChange={(e) => {
                const b = Number(e.target.value);
                applyPreset(mode, firstNum, b);
              }}
              aria-label="Thanh trượt chọn số thứ hai"
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {inputError && (
            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
              {inputError}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 pt-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">Phép tính mẫu trong SGK</span>
            <button
              type="button"
              onClick={() => applyPreset(mode, mode === 'add' ? 8 : 13, 5)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Mặc định</span>
            </button>
          </div>

          <div className="text-xs font-semibold text-slate-500">Phép cộng qua 10</div>
          <div className="grid grid-cols-3 gap-2">
            {ADD_PRESETS.map((p) => (
              <button
                key={`${p.op}-${p.a}-${p.b}`}
                type="button"
                onClick={() => applyPreset(p.op, p.a, p.b)}
                className={`px-2.5 py-2 text-xs font-mono-tabular font-semibold border rounded-lg cursor-pointer transition-colors ${
                  mode === p.op && firstNum === p.a && secondNum === p.b
                    ? 'bg-sky-50 border-sky-400 text-sky-900'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                }`}
              >
                {p.a} + {p.b}
              </button>
            ))}
          </div>

          <div className="text-xs font-semibold text-slate-500 pt-1">Phép trừ qua 10</div>
          <div className="grid grid-cols-3 gap-2">
            {SUB_PRESETS.map((p) => (
              <button
                key={`${p.op}-${p.a}-${p.b}`}
                type="button"
                onClick={() => applyPreset(p.op, p.a, p.b)}
                className={`px-2.5 py-2 text-xs font-mono-tabular font-semibold border rounded-lg cursor-pointer transition-colors ${
                  mode === p.op && firstNum === p.a && secondNum === p.b
                    ? 'bg-sky-50 border-sky-400 text-sky-900'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                }`}
              >
                {p.a} − {p.b}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};
