import React, { useState } from 'react';
import {
  Plus,
  Minus,
  Layers,
  Calculator,
  Scale,
  ChevronRight,
  RotateCcw,
  Scissors,
  Package,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { capitalizeFirst, readNumberVietnamese } from '../utils/vietnameseMath';
import {
  ColumnCalcOp,
  analyzeColumnCalculation,
  bundleTenOnes,
  ungroupOneTen,
  validateColumnCalc,
} from '../utils/mathEngine';

type SubMode = 'place-value' | 'compare' | 'column-calc';

const TensRod: React.FC<{
  color?: 'sky' | 'emerald' | 'amber' | 'carried';
  status?: 'normal' | 'ungrouped' | 'crossed';
}> = ({ color = 'sky', status = 'normal' }) => {
  if (status === 'ungrouped') {
    return (
      <div
        className="flex flex-col border-2 border-dashed border-amber-500 bg-amber-50 rounded-xs w-5 sm:w-6 opacity-75"
        title="1 thanh chục đã tháo thành 10 đơn vị"
      >
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="h-2.5 sm:h-3 border-b last:border-b-0 border-amber-300/60" />
        ))}
      </div>
    );
  }

  if (status === 'crossed') {
    return (
      <div
        className="relative flex flex-col border border-rose-400 bg-rose-100 rounded-xs w-5 sm:w-6 opacity-75"
        title="1 thanh chục đã bớt đi"
      >
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="h-2.5 sm:h-3 border-b last:border-b-0 border-rose-300/60" />
        ))}
        <span className="absolute inset-0 flex items-center justify-center text-rose-700 font-bold text-base">
          ×
        </span>
      </div>
    );
  }

  const bg =
    color === 'emerald'
      ? 'bg-emerald-500 border-emerald-700'
      : color === 'amber'
      ? 'bg-amber-400 border-amber-600'
      : color === 'carried'
      ? 'bg-amber-500 border-amber-700 ring-2 ring-amber-200'
      : 'bg-sky-500 border-sky-700';

  return (
    <div
      className={`flex flex-col border rounded-xs overflow-hidden shadow-xs w-5 sm:w-6 transition-transform duration-200 ${bg}`}
      title="1 thanh chục (10 đơn vị)"
    >
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className="h-2.5 sm:h-3 border-b last:border-b-0 border-white/40" />
      ))}
    </div>
  );
};

const UnitCube: React.FC<{
  color?: 'amber' | 'sky' | 'emerald' | 'from-ten';
  crossed?: boolean;
}> = ({ color = 'amber', crossed = false }) => {
  if (crossed) {
    return (
      <div
        className="w-4 h-4 sm:w-5 sm:h-5 border border-rose-500 bg-rose-100 rounded-xs flex items-center justify-center text-rose-700 font-bold text-xs"
        title="Khối đơn vị đã bớt đi"
      >
        ×
      </div>
    );
  }

  const styles =
    color === 'sky'
      ? 'bg-sky-500 border-sky-700'
      : color === 'emerald'
      ? 'bg-emerald-500 border-emerald-700'
      : color === 'from-ten'
      ? 'bg-amber-300 border-sky-600 ring-1 ring-sky-300'
      : 'bg-amber-400 border-amber-600';

  return (
    <div
      className={`w-4 h-4 sm:w-5 sm:h-5 border rounded-xs shadow-xs transition-transform duration-200 ${styles}`}
      title={
        color === 'from-ten'
          ? 'Đơn vị được tháo ra từ 1 thanh chục'
          : '1 khối lập phương đơn vị'
      }
    />
  );
};

interface BuildChallenge {
  id: string;
  prompt: string;
  hint: string;
  initialTens: number;
  initialOnes: number;
  check: (tens: number, ones: number) => boolean;
  successMsg: string;
}

const BUILD_CHALLENGES: BuildChallenge[] = [
  {
    id: 'make-45',
    prompt: 'Hãy tạo số 45 (gồm 4 chục và 5 đơn vị).',
    hint: 'Chọn 4 thanh chục và 5 khối đơn vị.',
    initialTens: 2,
    initialOnes: 2,
    check: (t, o) => t === 4 && o === 5,
    successMsg: 'Tuyệt vời! 4 chục và 5 đơn vị tạo thành số 45.',
  },
  {
    id: 'ungroup-36',
    prompt: 'Từ số 36, hãy tháo 1 chục để được 2 chục và 16 đơn vị.',
    hint: 'Nhấn nút "Tháo 1 chục → 10 đơn vị" để giữ nguyên giá trị 36.',
    initialTens: 3,
    initialOnes: 6,
    check: (t, o) => t === 2 && o === 16,
    successMsg: 'Chính xác! 36 = 3 chục + 6 đơn vị = 2 chục + 16 đơn vị.',
  },
  {
    id: 'bundle-34',
    prompt: 'Hãy bó 10 đơn vị thành 1 chục để đưa 2 chục 14 đơn vị về dạng chuẩn 34.',
    hint: 'Nhấn nút "Bó 10 đơn vị → 1 chục".',
    initialTens: 2,
    initialOnes: 14,
    check: (t, o) => t === 3 && o === 4,
    successMsg: 'Chuẩn xác! 2 chục + 14 đơn vị = 3 chục + 4 đơn vị = 34.',
  },
  {
    id: 'make-70',
    prompt: 'Hãy tạo số tròn chục 70.',
    hint: 'Cần 7 thanh chục và 0 khối đơn vị.',
    initialTens: 5,
    initialOnes: 3,
    check: (t, o) => t === 7 && o === 0,
    successMsg: 'Giỏi lắm! 7 chục và 0 đơn vị là số 70.',
  },
];

export const Base10ColumnTool: React.FC = () => {
  const [subMode, setSubMode] = useState<SubMode>('place-value');

  // Place value workshop state
  const [tens, setTens] = useState<number>(3);
  const [ones, setOnes] = useState<number>(6);
  const [ungroupedHighlightCount, setUngroupedHighlightCount] = useState<number>(0);
  const [workshopNotice, setWorkshopNotice] = useState<string | null>(null);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);

  // Compare mode state
  const [compA, setCompA] = useState<number>(42);
  const [compB, setCompB] = useState<number>(38);

  // Column calculation mode state
  const [op, setOp] = useState<ColumnCalcOp>('sub');
  const [numA, setNumA] = useState<number>(52);
  const [numB, setNumB] = useState<number>(18);
  const [draftA, setDraftA] = useState<string>('52');
  const [draftB, setDraftB] = useState<string>('18');
  const [calcError, setCalcError] = useState<string | null>(null);
  const [calcStep, setCalcStep] = useState<1 | 2 | 3>(1);

  const totalPlaceValue = tens * 10 + ones;
  const activeChallenge =
    BUILD_CHALLENGES.find((c) => c.id === activeChallengeId) ?? null;
  const challengePassed = activeChallenge ? activeChallenge.check(tens, ones) : false;

  // Place value actions
  const handleAddTen = () => {
    if (totalPlaceValue + 10 > 100 || tens >= 10) {
      setWorkshopNotice('Giá trị tối đa của xưởng là 100 (10 chục).');
      return;
    }
    setTens((t) => t + 1);
    setWorkshopNotice(null);
  };

  const handleRemoveTen = () => {
    if (tens <= 0) return;
    setTens((t) => t - 1);
    setWorkshopNotice(null);
  };

  const handleAddOne = () => {
    if (totalPlaceValue + 1 > 100) {
      setWorkshopNotice('Giá trị đã đạt tối đa 100.');
      return;
    }
    if (ones >= 29) {
      setWorkshopNotice('Hãy nhấn "Bó 10 đơn vị → 1 chục" trước khi thêm tiếp nhé!');
      return;
    }
    setOnes((o) => o + 1);
    setWorkshopNotice(null);
  };

  const handleRemoveOne = () => {
    if (ones <= 0) return;
    setOnes((o) => o - 1);
    setUngroupedHighlightCount((c) => Math.max(0, c - 1));
    setWorkshopNotice(null);
  };

  const handleUngroupTen = () => {
    const next = ungroupOneTen({ tens, ones });
    if (!next) {
      setWorkshopNotice('Cần có ít nhất 1 thanh chục để tháo thành 10 đơn vị.');
      return;
    }
    if (next.ones > 29) {
      setWorkshopNotice('Đã có nhiều khối đơn vị. Hãy bó bớt trước khi tháo tiếp.');
      return;
    }
    setTens(next.tens);
    setOnes(next.ones);
    setUngroupedHighlightCount(10);
    setWorkshopNotice(
      `Đã tháo 1 chục thành 10 đơn vị: ${totalPlaceValue} = ${next.tens} chục + ${next.ones} đơn vị.`
    );
  };

  const handleBundleOnes = () => {
    const next = bundleTenOnes({ tens, ones });
    if (!next) {
      setWorkshopNotice(
        ones < 10
          ? `Chưa đủ 10 đơn vị để bó thành 1 chục (hiện có ${ones} đơn vị).`
          : 'Không thể bó thêm thanh chục.'
      );
      return;
    }
    setTens(next.tens);
    setOnes(next.ones);
    setUngroupedHighlightCount(0);
    setWorkshopNotice(
      `Đã bó 10 đơn vị thành 1 thanh chục: ${totalPlaceValue} = ${next.tens} chục + ${next.ones} đơn vị.`
    );
  };

  const handleSliderTens = (nextTens: number) => {
    const clamped = Math.max(0, Math.min(9, nextTens));
    setTens(clamped);
    if (clamped * 10 + ones > 100) {
      setOnes(Math.max(0, 100 - clamped * 10));
    }
    setUngroupedHighlightCount(0);
    setWorkshopNotice(null);
  };

  const handleSliderOnes = (nextOnes: number) => {
    const clamped = Math.max(0, Math.min(19, nextOnes));
    if (tens * 10 + clamped > 100) {
      setTens(Math.floor((100 - clamped) / 10));
    }
    setOnes(clamped);
    setUngroupedHighlightCount(0);
    setWorkshopNotice(null);
  };

  // Column calculation handlers
  const analysis = analyzeColumnCalculation(op, numA, numB);

  const applyCalcValues = (nextOp: ColumnCalcOp, a: number, b: number) => {
    setOp(nextOp);
    setNumA(a);
    setNumB(b);
    setDraftA(String(a));
    setDraftB(String(b));
    setCalcError(null);
    setCalcStep(1);
  };

  const handleDraftCalcChange = (nextDraftA: string, nextDraftB: string) => {
    setDraftA(nextDraftA);
    setDraftB(nextDraftB);
    if (nextDraftA.trim() === '' || nextDraftB.trim() === '') {
      setCalcError('Vui lòng nhập đủ cả hai số.');
      return;
    }
    const parsedA = Number(nextDraftA);
    const parsedB = Number(nextDraftB);
    const check = validateColumnCalc(op, parsedA, parsedB);
    if (!check.valid) {
      setCalcError(check.error);
      return;
    }
    setCalcError(null);
    setNumA(parsedA);
    setNumB(parsedB);
    setCalcStep(1);
  };

  const renderColumnCalcBlocks = () => {
    const { aTens, aOnes, bTens, bOnes, hasCarry, hasBorrow, resTens, resOnes, resHundreds } =
      analysis;

    if (op === 'add') {
      const onesTotal = aOnes + bOnes;
      return (
        <div className="flex flex-col gap-3">
          <div className="text-xs font-bold text-slate-700">
            Minh họa khối lập phương theo từng bước
          </div>

          {calcStep === 1 && (
            <>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-xs font-semibold text-slate-600 mb-2">
                  Số thứ nhất: <span className="font-mono-tabular text-slate-900">{numA}</span> ({aTens} chục, {aOnes} đơn vị)
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex gap-1">
                    {Array.from({ length: aTens }, (_, i) => (
                      <TensRod key={i} color="sky" />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1 max-w-[180px]">
                    {Array.from({ length: aOnes }, (_, i) => (
                      <UnitCube key={i} color="amber" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-xs font-semibold text-slate-600 mb-2">
                  Cộng thêm: <span className="font-mono-tabular text-slate-900">{numB}</span> ({bTens} chục, {bOnes} đơn vị)
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex gap-1">
                    {Array.from({ length: bTens }, (_, i) => (
                      <TensRod key={i} color="emerald" />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1 max-w-[180px]">
                    {Array.from({ length: bOnes }, (_, i) => (
                      <UnitCube key={i} color="emerald" />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {calcStep === 2 && (
            <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-4 flex flex-col gap-3">
              <div className="text-xs font-bold text-amber-900">
                Bước 2 — Cộng hàng đơn vị: {aOnes} + {bOnes} = {onesTotal} đơn vị
              </div>
              {hasCarry ? (
                <div className="flex flex-wrap items-end gap-4">
                  <div className="bg-white border border-amber-300 rounded-lg p-2.5 flex flex-col items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-amber-800">
                      Gộp 10 đơn vị → 1 chục
                    </span>
                    <TensRod color="carried" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex flex-col gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-700">
                      Còn lại {resOnes} đơn vị
                    </span>
                    <div className="flex flex-wrap gap-1 min-h-[24px] items-center">
                      {resOnes === 0 ? (
                        <span className="text-xs text-slate-400">0 đơn vị</span>
                      ) : (
                        Array.from({ length: resOnes }, (_, i) => (
                          <UnitCube key={i} color="amber" />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: resOnes }, (_, i) => (
                    <UnitCube key={i} color={i < aOnes ? 'amber' : 'emerald'} />
                  ))}
                </div>
              )}
              <div className="text-xs text-slate-600 pt-1">
                Hàng chục chờ cộng: {aTens} chục + {bTens} chục{hasCarry ? ' + 1 chục (nhớ)' : ''}.
              </div>
            </div>
          )}

          {calcStep === 3 && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-4 flex flex-col gap-3">
              <div className="text-xs font-bold text-emerald-900">
                Bước 3 — Kết quả cuối cùng: {analysis.result} ({resHundreds > 0 ? '10 chục = 1 trăm' : `${resTens} chục, ${resOnes} đơn vị`})
              </div>
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: aTens }, (_, i) => (
                    <TensRod key={`a-${i}`} color="sky" />
                  ))}
                  {Array.from({ length: bTens }, (_, i) => (
                    <TensRod key={`b-${i}`} color="emerald" />
                  ))}
                  {hasCarry && <TensRod color="carried" />}
                </div>
                <div className="flex flex-wrap gap-1 max-w-[160px]">
                  {resOnes === 0 ? (
                    <span className="text-xs font-semibold text-slate-500">0 đơn vị</span>
                  ) : (
                    Array.from({ length: resOnes }, (_, i) => (
                      <UnitCube key={`r-${i}`} color="amber" />
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Subtraction visual blocks across steps 1, 2, 3
    const remainingATens = aTens - (hasBorrow ? 1 : 0);
    const expandedOnes = aOnes + (hasBorrow ? 10 : 0);

    return (
      <div className="flex flex-col gap-3">
        <div className="text-xs font-bold text-slate-700">
          Minh họa khối lập phương theo từng bước
        </div>

        {calcStep === 1 && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col gap-3">
            <div className="text-xs font-semibold text-slate-700">
              Số bị trừ: <span className="font-mono-tabular text-slate-900">{numA}</span> ({aTens} chục, {aOnes} đơn vị) — Cần bớt đi <strong className="text-rose-700">{numB}</strong> ({bTens} chục, {bOnes} đơn vị)
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex gap-1.5">
                {Array.from({ length: aTens }, (_, i) => (
                  <TensRod key={i} color="sky" />
                ))}
              </div>
              <div className="flex flex-wrap gap-1 max-w-[180px]">
                {aOnes === 0 ? (
                  <span className="text-xs text-slate-400">0 đơn vị</span>
                ) : (
                  Array.from({ length: aOnes }, (_, i) => <UnitCube key={i} color="amber" />)
                )}
              </div>
            </div>
          </div>
        )}

        {calcStep === 2 && (
          <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-4 flex flex-col gap-3">
            <div className="text-xs font-bold text-amber-900">
              {hasBorrow
                ? `Bước 2 — Tháo 1 chục thành 10 đơn vị → ${remainingATens} chục và ${expandedOnes} đơn vị; bớt ${bOnes} đơn vị`
                : `Bước 2 — Trừ hàng đơn vị: ${aOnes} − ${bOnes} = ${resOnes} đơn vị`}
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex gap-1.5">
                {Array.from({ length: remainingATens }, (_, i) => (
                  <TensRod key={`keep-${i}`} color="sky" />
                ))}
                {hasBorrow && <TensRod status="ungrouped" />}
              </div>
              <div className="flex flex-wrap gap-1 max-w-[230px]">
                {Array.from({ length: expandedOnes }, (_, i) => {
                  const isFromTen = hasBorrow && i >= aOnes;
                  const isCrossed = i >= resOnes;
                  return (
                    <UnitCube
                      key={i}
                      color={isFromTen ? 'from-ten' : 'amber'}
                      crossed={isCrossed}
                    />
                  );
                })}
              </div>
            </div>
            <div className="text-xs text-slate-600">
              Còn lại <strong className="text-slate-900">{resOnes}</strong> khối đơn vị và{' '}
              <strong className="text-slate-900">{remainingATens}</strong> thanh chục.
            </div>
          </div>
        )}

        {calcStep === 3 && (
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-4 flex flex-col gap-3">
            <div className="text-xs font-bold text-emerald-900">
              Bước 3 — Bớt {bTens} chục ở hàng chục → Còn {resTens} chục và {resOnes} đơn vị = {analysis.result}
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex gap-1.5">
                {Array.from({ length: remainingATens }, (_, i) => (
                  <TensRod
                    key={`final-${i}`}
                    color="sky"
                    status={i >= resTens ? 'crossed' : 'normal'}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-1 max-w-[180px]">
                {resOnes === 0 ? (
                  <span className="text-xs font-semibold text-slate-500">0 đơn vị</span>
                ) : (
                  Array.from({ length: resOnes }, (_, i) => (
                    <UnitCube key={`rem-${i}`} color="amber" />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCompareMiniModel = (val: number, accent: 'sky' | 'emerald') => {
    const t = Math.floor(val / 10);
    const o = val % 10;
    return (
      <div className="flex flex-wrap items-end gap-3 min-h-[125px] pt-2">
        <div className="flex gap-1">
          {Array.from({ length: t }, (_, i) => (
            <TensRod key={i} color={accent} />
          ))}
        </div>
        <div className="flex flex-wrap gap-1 max-w-[110px]">
          {Array.from({ length: o }, (_, i) => (
            <UnitCube key={i} color="amber" />
          ))}
        </div>
      </div>
    );
  };

  const compATens = Math.floor(compA / 10);
  const compAOnes = compA % 10;
  const compBTens = Math.floor(compB / 10);
  const compBOnes = compB % 10;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Main Interactive Stage */}
      <section className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {subMode === 'place-value'
                ? 'Xưởng tạo số: Máy bó và tháo chục'
                : subMode === 'compare'
                ? 'So sánh hai số bằng mô hình Chục – Đơn vị'
                : 'Đặt tính rồi tính trong phạm vi 100'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {subMode === 'place-value'
                ? 'Thực hành thêm/bớt hoặc tháo 1 chục thành 10 đơn vị (bảo toàn giá trị) và bó 10 đơn vị thành 1 chục.'
                : subMode === 'compare'
                ? 'Quan sát thanh chục và khối đơn vị để so sánh hai số có hai chữ số.'
                : 'Quan sát khối lập phương biến đổi đồng bộ theo từng bước cộng, trừ có nhớ.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setSubMode('place-value')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                subMode === 'place-value'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Xưởng tạo số</span>
            </button>
            <button
              type="button"
              onClick={() => setSubMode('compare')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                subMode === 'compare'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>So sánh số</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSubMode('column-calc');
                setCalcStep(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                subMode === 'column-calc'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Đặt tính rồi tính</span>
            </button>
          </div>
        </div>

        {subMode === 'place-value' && (
          <>
            {/* Place Value Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tens Zone */}
              <div className="bg-sky-50/50 border border-sky-200 rounded-xl p-5 flex flex-col justify-between min-h-[240px]">
                <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                  <span className="text-sm font-bold text-sky-900">Hàng Chục</span>
                  <span className="font-mono-tabular text-lg font-bold text-sky-700">
                    {tens} chục = {tens * 10}
                  </span>
                </div>
                <div className="flex flex-wrap items-end gap-2 py-4 min-h-[130px]">
                  {tens === 0 ? (
                    <span className="text-xs text-slate-400">Chưa có thanh chục nào</span>
                  ) : (
                    Array.from({ length: tens }, (_, i) => <TensRod key={i} color="sky" />)
                  )}
                </div>
                <div className="flex flex-col gap-2 pt-2 border-t border-sky-100">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleRemoveTen}
                      disabled={tens <= 0}
                      className="flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-semibold bg-white border border-sky-200 rounded-lg text-sky-800 hover:bg-sky-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                      <span>Bớt 1 chục (−10)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddTen}
                      disabled={totalPlaceValue + 10 > 100 || tens >= 10}
                      className="flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-semibold bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm 1 chục (+10)</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleUngroupTen}
                    disabled={tens <= 0}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-amber-50 border border-amber-300 rounded-lg text-amber-900 hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Tháo 1 chục → 10 đơn vị (giữ nguyên giá trị)</span>
                  </button>
                </div>
              </div>

              {/* Ones Zone */}
              <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-5 flex flex-col justify-between min-h-[240px]">
                <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                  <span className="text-sm font-bold text-amber-900">Hàng Đơn vị</span>
                  <span className="font-mono-tabular text-lg font-bold text-amber-700">
                    {ones} đơn vị
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 py-4 min-h-[130px] content-start">
                  {ones === 0 ? (
                    <span className="text-xs text-slate-400">Chưa có khối đơn vị nào</span>
                  ) : (
                    Array.from({ length: ones }, (_, i) => {
                      const isNewlyUngrouped =
                        ungroupedHighlightCount > 0 && i >= ones - ungroupedHighlightCount;
                      return (
                        <UnitCube
                          key={i}
                          color={isNewlyUngrouped ? 'from-ten' : 'amber'}
                        />
                      );
                    })
                  )}
                </div>
                <div className="flex flex-col gap-2 pt-2 border-t border-amber-100">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleRemoveOne}
                      disabled={ones <= 0}
                      className="flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-semibold bg-white border border-amber-200 rounded-lg text-amber-900 hover:bg-amber-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                      <span>Bớt 1 đơn vị (−1)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddOne}
                      disabled={totalPlaceValue >= 100 || ones >= 29}
                      className="flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm 1 đơn vị (+1)</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleBundleOnes}
                    disabled={ones < 10 || tens >= 10}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-sky-50 border border-sky-300 rounded-lg text-sky-900 hover:bg-sky-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>
                      {ones >= 10
                        ? 'Bó 10 đơn vị → 1 chục'
                        : `Cần đủ 10 đơn vị để bó (${ones}/10)`}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {workshopNotice && (
              <div className="bg-sky-50 border border-sky-200 rounded-lg px-4 py-2.5 text-xs font-semibold text-sky-900">
                {workshopNotice}
              </div>
            )}

            {/* Readout & Expanded Form */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-500">Số tạo thành</div>
                <div className="flex flex-wrap items-baseline gap-3 mt-1">
                  <span className="text-4xl font-bold font-mono-tabular text-slate-900">
                    {totalPlaceValue}
                  </span>
                  <span className="text-base font-semibold text-slate-700">
                    ({capitalizeFirst(readNumberVietnamese(totalPlaceValue))})
                  </span>
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Biểu diễn hiện tại: <strong className="text-slate-900">{tens} chục + {ones} đơn vị</strong>
                </div>
              </div>
              <div className="font-mono-tabular text-lg sm:text-xl font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-4 py-2.5">
                <span className="text-slate-900">{totalPlaceValue}</span> ={' '}
                <span className="text-sky-700">{tens * 10}</span> +{' '}
                <span className="text-amber-600">{ones}</span>
              </div>
            </div>
          </>
        )}

        {subMode === 'compare' && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-stretch">
              <div className="md:col-span-5 bg-sky-50/50 border border-sky-200 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                  <span className="text-sm font-bold text-sky-900">Số A: {compA}</span>
                  <span className="text-xs font-mono-tabular font-semibold text-sky-700">
                    {compATens} chục, {compAOnes} đơn vị
                  </span>
                </div>
                {renderCompareMiniModel(compA, 'sky')}
                <div className="text-xs text-slate-600 pt-2 border-t border-sky-100">
                  {capitalizeFirst(readNumberVietnamese(compA))}
                </div>
              </div>

              <div className="md:col-span-1 flex items-center justify-center">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-mono-tabular text-2xl font-bold flex items-center justify-center">
                  {compA > compB ? '>' : compA < compB ? '<' : '='}
                </div>
              </div>

              <div className="md:col-span-5 bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                  <span className="text-sm font-bold text-emerald-900">Số B: {compB}</span>
                  <span className="text-xs font-mono-tabular font-semibold text-emerald-700">
                    {compBTens} chục, {compBOnes} đơn vị
                  </span>
                </div>
                {renderCompareMiniModel(compB, 'emerald')}
                <div className="text-xs text-slate-600 pt-2 border-t border-emerald-100">
                  {capitalizeFirst(readNumberVietnamese(compB))}
                </div>
              </div>
            </div>

            <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-4 text-sm text-slate-800">
              <strong className="text-sky-900">Cách so sánh: </strong>
              {compATens !== compBTens ? (
                <span>
                  So sánh hàng chục trước: {compATens} chục{' '}
                  {compATens > compBTens ? 'lớn hơn' : 'bé hơn'} {compBTens} chục nên{' '}
                  <strong className="font-mono-tabular">
                    {compA} {compA > compB ? '>' : '<'} {compB}
                  </strong>
                  .
                </span>
              ) : compAOnes !== compBOnes ? (
                <span>
                  Hàng chục bằng nhau ({compATens} chục = {compBTens} chục), so sánh hàng đơn vị:{' '}
                  {compAOnes} {compAOnes > compBOnes ? 'lớn hơn' : 'bé hơn'} {compBOnes} nên{' '}
                  <strong className="font-mono-tabular">
                    {compA} {compA > compB ? '>' : '<'} {compB}
                  </strong>
                  .
                </span>
              ) : (
                <span>
                  Cả hàng chục và hàng đơn vị đều giống nhau nên{' '}
                  <strong className="font-mono-tabular">
                    {compA} = {compB}
                  </strong>
                  .
                </span>
              )}
            </div>
          </div>
        )}

        {subMode === 'column-calc' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            {/* Vertical Column Notation */}
            <div className="md:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center">
              <div className="text-xs font-semibold text-slate-500 mb-3">Đặt tính theo cột dọc</div>

              <div className="font-mono-tabular text-4xl font-bold tracking-wider select-none">
                {/* Carry / Borrow indicator row */}
                <div className="grid grid-cols-4 gap-1.5 text-center text-xs h-6 items-center">
                  <span />
                  <span />
                  <span className="text-rose-600 font-bold">
                    {calcStep >= 2 && analysis.hasCarry
                      ? 'nhớ 1'
                      : calcStep >= 2 && analysis.hasBorrow
                      ? `còn ${analysis.aTens - 1}`
                      : ''}
                  </span>
                  <span className="text-rose-600 font-bold">
                    {calcStep >= 2 && analysis.hasBorrow ? '+10' : ''}
                  </span>
                </div>

                {/* First number */}
                <div className="grid grid-cols-4 gap-1.5 text-center items-center py-1">
                  <span />
                  <span />
                  <span
                    className={`${
                      calcStep === 3 ? 'text-sky-700' : 'text-slate-900'
                    } ${calcStep >= 2 && analysis.hasBorrow ? 'line-through decoration-rose-500/70' : ''}`}
                  >
                    {analysis.aTens > 0 ? analysis.aTens : ''}
                  </span>
                  <span className={calcStep === 2 ? 'text-amber-600' : 'text-slate-900'}>
                    {analysis.aOnes}
                  </span>
                </div>

                {/* Operator + Second number */}
                <div className="grid grid-cols-4 gap-1.5 text-center items-center py-1 border-b-4 border-slate-800 pb-2">
                  <span />
                  <span className="text-slate-700">{op === 'add' ? '+' : '−'}</span>
                  <span className={calcStep === 3 ? 'text-sky-700' : 'text-slate-900'}>
                    {analysis.bTens > 0 ? analysis.bTens : ''}
                  </span>
                  <span className={calcStep === 2 ? 'text-amber-600' : 'text-slate-900'}>
                    {analysis.bOnes}
                  </span>
                </div>

                {/* Result row */}
                <div className="grid grid-cols-4 gap-1.5 text-center items-center pt-2">
                  <span />
                  <span className={calcStep === 3 && analysis.resHundreds > 0 ? 'text-emerald-700' : 'text-transparent'}>
                    {calcStep === 3 && analysis.resHundreds > 0 ? analysis.resHundreds : ''}
                  </span>
                  <span className={calcStep === 3 ? 'text-emerald-700' : 'text-slate-300'}>
                    {calcStep === 3
                      ? analysis.resHundreds > 0 || analysis.resTens > 0
                        ? analysis.resTens
                        : ''
                      : '?'}
                  </span>
                  <span className={calcStep >= 2 ? 'text-emerald-700' : 'text-slate-300'}>
                    {calcStep >= 2 ? analysis.resOnes : '?'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-6">
                {[1, 2, 3].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setCalcStep(s as 1 | 2 | 3)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                      calcStep === s
                        ? 'bg-sky-600 border-sky-600 text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Bước {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Visual Blocks + Step Explanation */}
            <div className="md:col-span-7 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4">
              {renderColumnCalcBlocks()}

              <div className="bg-sky-50/70 border border-sky-200 rounded-lg p-3.5 flex flex-col gap-2">
                <div className="text-xs font-bold text-sky-900">
                  {calcStep === 1 && 'Bước 1: Đặt tính thẳng hàng và biểu diễn mô hình'}
                  {calcStep === 2 && 'Bước 2: Tính hàng đơn vị (từ phải sang trái)'}
                  {calcStep === 3 && 'Bước 3: Tính hàng chục và đọc kết quả'}
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {calcStep === 1 && analysis.step1Text}
                  {calcStep === 2 && analysis.step2Text}
                  {calcStep === 3 && analysis.step3Text}
                </p>
                <button
                  type="button"
                  onClick={() => setCalcStep((s) => (s < 3 ? ((s + 1) as 1 | 2 | 3) : 1))}
                  className="self-start flex items-center gap-1 px-3 py-2 bg-sky-600 text-white text-xs font-semibold rounded-md hover:bg-sky-700 cursor-pointer"
                >
                  <span>{calcStep < 3 ? 'Bước tiếp theo' : 'Làm lại'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Right Control Deck */}
      <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-6">
        {subMode === 'place-value' && (
          <>
            <div>
              <h3 className="text-base font-bold text-slate-900">Điều chỉnh số trực tiếp</h3>
              <p className="text-xs text-slate-500 mt-1">
                Thanh trượt đồng bộ chính xác với số thanh chục và khối đơn vị trên bảng.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">Thanh chục</span>
                  <span className="font-mono-tabular font-bold text-sky-700">{tens} chục</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={9}
                  value={Math.min(9, tens)}
                  onChange={(e) => handleSliderTens(Number(e.target.value))}
                  aria-label="Chọn số thanh chục"
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">Khối đơn vị</span>
                  <span className="font-mono-tabular font-bold text-amber-600">{ones} đơn vị</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={19}
                  value={Math.min(19, ones)}
                  onChange={(e) => handleSliderOnes(Number(e.target.value))}
                  aria-label="Chọn số khối đơn vị"
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Presets */}
            <div className="border-t border-slate-100 pt-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">Số mẫu nhanh</span>
                <button
                  type="button"
                  onClick={() => {
                    setTens(3);
                    setOnes(6);
                    setUngroupedHighlightCount(0);
                    setWorkshopNotice(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Đặt lại (36)</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { t: 2, o: 1, label: '21 (hai mươi mốt)' },
                  { t: 3, o: 6, label: '36 (ba mươi sáu)' },
                  { t: 4, o: 5, label: '45 (bốn mươi lăm)' },
                  { t: 7, o: 0, label: '70 (bảy mươi)' },
                ].map((ex) => (
                  <button
                    key={ex.label}
                    type="button"
                    onClick={() => {
                      setTens(ex.t);
                      setOnes(ex.o);
                      setUngroupedHighlightCount(0);
                      setWorkshopNotice(null);
                    }}
                    className="px-2.5 py-2 text-xs font-semibold text-left border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-800 cursor-pointer"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Build Number Challenges */}
            <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">Thử thách xây dựng số</span>
                {activeChallenge && (
                  <button
                    type="button"
                    onClick={() => setActiveChallengeId(null)}
                    className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Đóng
                  </button>
                )}
              </div>

              {!activeChallenge ? (
                <div className="grid grid-cols-2 gap-2">
                  {BUILD_CHALLENGES.map((ch, idx) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => {
                        setActiveChallengeId(ch.id);
                        setTens(ch.initialTens);
                        setOnes(ch.initialOnes);
                        setUngroupedHighlightCount(0);
                        setWorkshopNotice(null);
                      }}
                      className="px-3 py-2 text-xs font-semibold text-left border border-slate-200 rounded-lg hover:border-sky-300 hover:bg-sky-50/50 text-slate-700 cursor-pointer"
                    >
                      Thử thách {idx + 1}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-col gap-2">
                  <p className="text-xs font-bold text-slate-900">{activeChallenge.prompt}</p>
                  <p className="text-xs text-slate-600 flex items-start gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{activeChallenge.hint}</span>
                  </p>
                  {challengePassed ? (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md p-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{activeChallenge.successMsg}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500">
                      Hiện tại: {tens} chục, {ones} đơn vị (tổng {totalPlaceValue}).
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {subMode === 'compare' && (
          <>
            <div>
              <h3 className="text-base font-bold text-slate-900">Chọn hai số để so sánh</h3>
              <p className="text-xs text-slate-500 mt-1">
                Thay đổi giá trị hai số (10–99) để đối chiếu hàng chục và hàng đơn vị.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">Số A</span>
                  <span className="font-mono-tabular font-bold text-sky-700">{compA}</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={99}
                  value={compA}
                  onChange={(e) => setCompA(Number(e.target.value))}
                  aria-label="Chọn số A để so sánh"
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">Số B</span>
                  <span className="font-mono-tabular font-bold text-emerald-700">{compB}</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={99}
                  value={compB}
                  onChange={(e) => setCompB(Number(e.target.value))}
                  aria-label="Chọn số B để so sánh"
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
              <span className="text-sm font-bold text-slate-900">Cặp số mẫu</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { a: 42, b: 38 },
                  { a: 35, b: 39 },
                  { a: 60, b: 59 },
                  { a: 47, b: 47 },
                ].map((pair) => (
                  <button
                    key={`${pair.a}-${pair.b}`}
                    type="button"
                    onClick={() => {
                      setCompA(pair.a);
                      setCompB(pair.b);
                    }}
                    className="px-3 py-2 text-xs font-mono-tabular font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-800 cursor-pointer"
                  >
                    {pair.a} và {pair.b}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {subMode === 'column-calc' && (
          <>
            <div>
              <h3 className="text-base font-bold text-slate-900">Thiết lập phép tính</h3>
              <p className="text-xs text-slate-500 mt-1">
                Phạm vi Toán lớp 2 (tối đa 100). Nhập số hoặc dùng thanh trượt.
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => applyCalcValues('add', 37, 25)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  op === 'add' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Phép cộng (+)
              </button>
              <button
                type="button"
                onClick={() => applyCalcValues('sub', 52, 18)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  op === 'sub' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Phép trừ (−)
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <label htmlFor="calc-a" className="font-medium text-slate-700">
                    Số thứ nhất
                  </label>
                  <input
                    id="calc-a"
                    type="number"
                    min={0}
                    max={99}
                    value={draftA}
                    onChange={(e) => handleDraftCalcChange(e.target.value, draftB)}
                    className="w-16 px-2 py-1 text-right font-mono-tabular font-bold text-slate-900 border border-slate-200 rounded-md bg-slate-50"
                  />
                </div>
                <input
                  type="range"
                  min={op === 'add' ? 1 : 10}
                  max={99}
                  value={numA}
                  onChange={(e) => {
                    const nextA = Number(e.target.value);
                    const nextB =
                      op === 'add'
                        ? Math.min(numB, 100 - nextA)
                        : Math.min(numB, nextA);
                    applyCalcValues(op, nextA, nextB);
                  }}
                  aria-label="Thanh trượt số thứ nhất"
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <label htmlFor="calc-b" className="font-medium text-slate-700">
                    Số thứ hai
                  </label>
                  <input
                    id="calc-b"
                    type="number"
                    min={0}
                    max={op === 'add' ? 100 - numA : numA}
                    value={draftB}
                    onChange={(e) => handleDraftCalcChange(draftA, e.target.value)}
                    className="w-16 px-2 py-1 text-right font-mono-tabular font-bold text-slate-900 border border-slate-200 rounded-md bg-slate-50"
                  />
                </div>
                <input
                  type="range"
                  min={1}
                  max={op === 'add' ? Math.max(1, 100 - numA) : Math.max(1, numA)}
                  value={numB}
                  onChange={(e) => applyCalcValues(op, numA, Number(e.target.value))}
                  aria-label="Thanh trượt số thứ hai"
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {calcError && (
                <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                  {calcError}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
              <span className="text-sm font-bold text-slate-900">Bài tập mẫu trọng tâm</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { op: 'add' as ColumnCalcOp, a: 37, b: 25 },
                  { op: 'add' as ColumnCalcOp, a: 48, b: 19 },
                  { op: 'add' as ColumnCalcOp, a: 99, b: 1 },
                  { op: 'sub' as ColumnCalcOp, a: 52, b: 18 },
                  { op: 'sub' as ColumnCalcOp, a: 62, b: 18 },
                  { op: 'sub' as ColumnCalcOp, a: 50, b: 24 },
                ].map((item) => (
                  <button
                    key={`${item.op}-${item.a}-${item.b}`}
                    type="button"
                    onClick={() => applyCalcValues(item.op, item.a, item.b)}
                    className={`px-3 py-2 text-xs font-mono-tabular font-semibold border rounded-lg cursor-pointer transition-colors ${
                      op === item.op && numA === item.a && numB === item.b
                        ? 'bg-sky-50 border-sky-400 text-sky-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    {item.a} {item.op === 'add' ? '+' : '−'} {item.b}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
};
