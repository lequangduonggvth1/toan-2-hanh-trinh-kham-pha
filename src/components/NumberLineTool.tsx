import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, HelpCircle } from 'lucide-react';
import { capitalizeFirst, readNumberVietnamese } from '../utils/vietnameseMath';
import {
  NUMBER_LINE_RANGES,
  NumberLineRangeKey,
  clampNumberLineValue,
  getNeighborsInRange,
} from '../utils/mathEngine';

interface ChallengeItem {
  prompt: string;
  target: number;
  rangeKey: NumberLineRangeKey;
  startValue: number;
  hint: string;
}

const CHALLENGES: ChallengeItem[] = [
  {
    prompt: 'Tìm số liền sau của số 14 trên tia số.',
    target: 15,
    rangeKey: '0-20',
    startValue: 14,
    hint: 'Số liền sau lớn hơn số đã cho 1 đơn vị (14 + 1).',
  },
  {
    prompt: 'Tìm số liền trước của số 40 trên tia số.',
    target: 39,
    rangeKey: '0-50',
    startValue: 40,
    hint: 'Số liền trước bé hơn số đã cho 1 đơn vị (40 − 1).',
  },
  {
    prompt: 'Chọn số tròn chục nằm ngay sau số 60.',
    target: 70,
    rangeKey: 'tens',
    startValue: 60,
    hint: 'Đếm thêm 1 chục từ 60 (60 + 10).',
  },
  {
    prompt: 'Tìm số lớn nhất có hai chữ số trên tia số.',
    target: 99,
    rangeKey: '0-100',
    startValue: 90,
    hint: 'Số đứng ngay liền trước số 100.',
  },
];

export const NumberLineTool: React.FC = () => {
  const [rangeKey, setRangeKey] = useState<NumberLineRangeKey>('0-20');
  const [selected, setSelected] = useState<number>(8);
  const [compareTarget, setCompareTarget] = useState<number | null>(12);
  const [showJumpArc, setShowJumpArc] = useState<boolean>(true);
  const [challengeIdx, setChallengeIdx] = useState<number | null>(null);
  const [challengeStatus, setChallengeStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [quickInput, setQuickInput] = useState<string>('8');
  const [inputNotice, setInputNotice] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const activeRange =
    NUMBER_LINE_RANGES.find((r) => r.key === rangeKey) ?? NUMBER_LINE_RANGES[0];

  const ticks: number[] = [];
  for (let v = activeRange.min; v <= activeRange.max; v += activeRange.step) {
    ticks.push(v);
  }

  const svgWidth = Math.max(860, ticks.length * 26 + 96);
  const padX = 48;
  const lineY = 165;
  const usableWidth = svgWidth - padX * 2;

  const getX = (val: number) => {
    const idx = ticks.indexOf(val);
    if (idx === -1 || ticks.length <= 1) return padX;
    return padX + (idx / (ticks.length - 1)) * usableWidth;
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const x = getX(selected);
    const ratio = x / svgWidth;
    const targetScrollLeft = ratio * container.scrollWidth - container.clientWidth / 2;
    container.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: 'smooth',
    });
  }, [selected, rangeKey]);

  const handleSelectRange = (nextKey: NumberLineRangeKey) => {
    const next = NUMBER_LINE_RANGES.find((r) => r.key === nextKey) ?? NUMBER_LINE_RANGES[0];
    setRangeKey(nextKey);
    const nextSelected = clampNumberLineValue(selected, next);
    setSelected(nextSelected);
    setQuickInput(String(nextSelected));
    setInputNotice(null);

    if (compareTarget !== null) {
      if (compareTarget < next.min || compareTarget > next.max || (next.step === 10 && compareTarget % 10 !== 0)) {
        setCompareTarget(null);
      }
    }
    setChallengeStatus('idle');
  };

  const handleSelectNumber = (value: number) => {
    const clamped = clampNumberLineValue(value, activeRange);
    setSelected(clamped);
    setQuickInput(String(clamped));
    setInputNotice(null);
    if (challengeIdx !== null) {
      const current = CHALLENGES[challengeIdx];
      setChallengeStatus(clamped === current.target ? 'correct' : 'wrong');
    }
  };

  const handleQuickInputChange = (raw: string) => {
    setQuickInput(raw);
    if (raw.trim() === '') {
      setInputNotice(null);
      return;
    }
    const parsed = Number(raw);
    if (!Number.isInteger(parsed)) {
      setInputNotice('Vui lòng nhập một số tự nhiên.');
      return;
    }
    if (parsed < activeRange.min || parsed > activeRange.max) {
      setInputNotice(
        `Chế độ "${activeRange.label}" chỉ nhận số từ ${activeRange.min} đến ${activeRange.max}.`
      );
      return;
    }
    if (activeRange.step === 10 && parsed % 10 !== 0) {
      setInputNotice('Chế độ Tròn chục chỉ chọn các số chia hết cho 10 (0, 10, 20, ...).');
      return;
    }
    handleSelectNumber(parsed);
  };

  const stepValue = (delta: number) => {
    const next = clampNumberLineValue(selected + delta, activeRange);
    handleSelectNumber(next);
  };

  const startChallenge = (idx: number) => {
    const ch = CHALLENGES[idx];
    setChallengeIdx(idx);
    setRangeKey(ch.rangeKey);
    setSelected(ch.startValue);
    setQuickInput(String(ch.startValue));
    setInputNotice(null);
    setCompareTarget(null);
    setChallengeStatus('idle');
  };

  const { prev: prevNum, next: nextNum } = getNeighborsInRange(selected, activeRange);
  const selectedIndex = ticks.indexOf(selected);

  const shouldShowTickLabel = (val: number) => {
    if (ticks.length <= 25) return true;
    if (val === selected || val === prevNum || val === nextNum || val === compareTarget) {
      return true;
    }
    if (ticks.length <= 55) {
      return val % 5 === 0;
    }
    return val % 10 === 0;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Interactive Stage */}
      <section className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Tia số và Thứ tự số</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {activeRange.description}. Nhấp trực tiếp vào vạch số để quan sát số liền trước và số liền sau.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {NUMBER_LINE_RANGES.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => handleSelectRange(opt.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  rangeKey === opt.key
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Interactive Number Line */}
        <div
          ref={scrollContainerRef}
          className="w-full overflow-x-auto py-2 rounded-lg bg-slate-50/50 border border-slate-100"
        >
          <svg
            viewBox={`0 0 ${svgWidth} 245`}
            style={{ width: `${svgWidth}px`, minWidth: '100%' }}
            className="h-auto select-none"
            role="img"
            aria-label={`Tia số tương tác chế độ ${activeRange.label}`}
          >
            <defs>
              <marker
                id="arrowHead"
                markerWidth="10"
                markerHeight="10"
                refX="8"
                refY="5"
                orient="auto"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#0f172a" />
              </marker>
            </defs>

            {/* Jump arcs to predecessor and successor */}
            {showJumpArc && selectedIndex > 0 && (
              <g>
                <path
                  d={`M ${getX(selected)} ${lineY - 22} Q ${(getX(selected) + getX(ticks[selectedIndex - 1])) / 2} ${lineY - 82} ${getX(ticks[selectedIndex - 1])} ${lineY - 22}`}
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2.5"
                  strokeDasharray="5 4"
                />
                <text
                  x={(getX(selected) + getX(ticks[selectedIndex - 1])) / 2}
                  y={lineY - 62}
                  textAnchor="middle"
                  className="fill-amber-700 text-xs font-semibold tabular-nums"
                >
                  −{activeRange.step}
                </text>
              </g>
            )}

            {showJumpArc && selectedIndex >= 0 && selectedIndex < ticks.length - 1 && (
              <g>
                <path
                  d={`M ${getX(selected)} ${lineY - 22} Q ${(getX(selected) + getX(ticks[selectedIndex + 1])) / 2} ${lineY - 82} ${getX(ticks[selectedIndex + 1])} ${lineY - 22}`}
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                  strokeDasharray="5 4"
                />
                <text
                  x={(getX(selected) + getX(ticks[selectedIndex + 1])) / 2}
                  y={lineY - 62}
                  textAnchor="middle"
                  className="fill-emerald-700 text-xs font-semibold tabular-nums"
                >
                  +{activeRange.step}
                </text>
              </g>
            )}

            {/* Main horizontal ray */}
            <line
              x1={padX - 12}
              y1={lineY}
              x2={svgWidth - padX + 26}
              y2={lineY}
              stroke="#0f172a"
              strokeWidth="3"
              markerEnd="url(#arrowHead)"
            />

            {/* Ticks & interactive nodes */}
            {ticks.map((val) => {
              const x = getX(val);
              const isSelected = val === selected;
              const isPrev = val === prevNum;
              const isNext = val === nextNum;
              const isCompare = val === compareTarget && val !== selected;
              const isMajor = val % 10 === 0 || val % 5 === 0;
              const showLabel = shouldShowTickLabel(val);

              const tickStroke = isSelected
                ? '#0284c7'
                : isPrev
                ? '#d97706'
                : isNext
                ? '#059669'
                : isCompare
                ? '#7c3aed'
                : '#475569';

              return (
                <g
                  key={val}
                  onClick={() => handleSelectNumber(val)}
                  className="cursor-pointer group"
                >
                  <rect x={x - 12} y={lineY - 40} width={24} height={95} fill="transparent" />

                  <line
                    x1={x}
                    y1={lineY - (isSelected ? 15 : isMajor ? 11 : 7)}
                    x2={x}
                    y2={lineY + (isSelected ? 15 : isMajor ? 11 : 7)}
                    stroke={tickStroke}
                    strokeWidth={isSelected ? 3.5 : isMajor ? 2 : 1.5}
                  />

                  {(isSelected || isPrev || isNext || isCompare) && (
                    <circle
                      cx={x}
                      cy={lineY}
                      r={isSelected ? 10 : 7}
                      fill={
                        isSelected
                          ? '#0284c7'
                          : isPrev
                          ? '#f59e0b'
                          : isNext
                          ? '#10b981'
                          : '#8b5cf6'
                      }
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />
                  )}

                  {showLabel && (
                    <text
                      x={x}
                      y={lineY + (isSelected ? 36 : isPrev || isNext ? 50 : 34)}
                      textAnchor="middle"
                      className={`tabular-nums transition-colors ${
                        isSelected
                          ? 'fill-sky-700 font-bold text-base'
                          : isPrev
                          ? 'fill-amber-700 font-semibold text-xs'
                          : isNext
                          ? 'fill-emerald-700 font-semibold text-xs'
                          : isCompare
                          ? 'fill-violet-700 font-semibold text-xs'
                          : 'fill-slate-600 font-medium text-xs group-hover:fill-slate-900'
                      }`}
                    >
                      {val}
                    </text>
                  )}

                  {isSelected && (
                    <text
                      x={x}
                      y={lineY - 98}
                      textAnchor="middle"
                      className="fill-sky-700 text-xs font-bold"
                    >
                      Đang chọn ({val})
                    </text>
                  )}
                  {isCompare && (
                    <text
                      x={x}
                      y={lineY - 26}
                      textAnchor="middle"
                      className="fill-violet-700 text-[11px] font-bold"
                    >
                      So sánh
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Summary Trio Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-5">
          <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-4">
            <div className="text-xs font-semibold text-amber-800">
              {activeRange.step === 1 ? 'Số liền trước' : 'Số tròn chục liền trước'}
            </div>
            <div className="text-3xl font-bold text-amber-900 font-mono-tabular mt-1">
              {prevNum !== null ? prevNum : '—'}
            </div>
            <div className="text-xs text-amber-800 mt-1">
              {prevNum !== null
                ? capitalizeFirst(readNumberVietnamese(prevNum))
                : `Đang ở số đầu tiên (${activeRange.min})`}
            </div>
          </div>

          <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
            <div className="text-xs font-semibold text-sky-800">Số đang chọn</div>
            <div className="text-3xl font-bold text-sky-900 font-mono-tabular mt-1">{selected}</div>
            <div className="text-xs text-sky-800 mt-1">
              {capitalizeFirst(readNumberVietnamese(selected))}
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-4">
            <div className="text-xs font-semibold text-emerald-800">
              {activeRange.step === 1 ? 'Số liền sau' : 'Số tròn chục liền sau'}
            </div>
            <div className="text-3xl font-bold text-emerald-900 font-mono-tabular mt-1">
              {nextNum !== null ? nextNum : '—'}
            </div>
            <div className="text-xs text-emerald-800 mt-1">
              {nextNum !== null
                ? capitalizeFirst(readNumberVietnamese(nextNum))
                : `Đang ở số cuối cùng (${activeRange.max})`}
            </div>
          </div>
        </div>
      </section>

      {/* Right Control & Concept Deck */}
      <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Bảng điều khiển tia số</h3>
          <p className="text-xs text-slate-500 mt-1">
            Phạm vi hiện tại: <strong className="text-slate-700">{activeRange.label}</strong> (bước nhảy {activeRange.step}).
          </p>
        </div>

        {/* Stepper & Input Controls */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="numberline-input" className="font-medium text-slate-700">
              Số đang chọn
            </label>
            <input
              id="numberline-input"
              type="number"
              min={activeRange.min}
              max={activeRange.max}
              step={activeRange.step}
              value={quickInput}
              onChange={(e) => handleQuickInputChange(e.target.value)}
              className="w-20 px-2.5 py-1 text-right font-mono-tabular font-bold text-sky-700 border border-slate-200 rounded-md bg-slate-50"
            />
          </div>

          {inputNotice && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5">
              {inputNotice}
            </p>
          )}

          <input
            type="range"
            min={activeRange.min}
            max={activeRange.max}
            step={activeRange.step}
            value={selected}
            onChange={(e) => handleSelectNumber(Number(e.target.value))}
            aria-label="Thanh trượt chọn số trên tia số"
            className="w-full accent-sky-600 cursor-pointer"
          />

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => stepValue(-activeRange.step)}
              disabled={selected <= activeRange.min}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Giảm {activeRange.step}</span>
            </button>
            <button
              type="button"
              onClick={() => stepValue(activeRange.step)}
              disabled={selected >= activeRange.max}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Tăng {activeRange.step}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Comparison Controls */}
        <div className="border-t border-slate-100 pt-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label htmlFor="compare-select" className="text-sm font-semibold text-slate-800">
              So sánh hai số
            </label>
            <button
              type="button"
              onClick={() => setShowJumpArc((prev) => !prev)}
              aria-pressed={showJumpArc}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                showJumpArc
                  ? 'bg-sky-50 border-sky-200 text-sky-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {showJumpArc ? 'Ẩn cung nhảy' : 'Hiện cung nhảy'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <select
              id="compare-select"
              value={compareTarget ?? ''}
              onChange={(e) =>
                setCompareTarget(e.target.value === '' ? null : Number(e.target.value))
              }
              className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800"
            >
              <option value="">Không so sánh</option>
              {ticks.map((t) => (
                <option key={t} value={t}>
                  Số {t}
                </option>
              ))}
            </select>
            {compareTarget !== null && (
              <div className="px-3 py-2 bg-violet-50 border border-violet-200 rounded-lg text-sm font-bold text-violet-900 font-mono-tabular whitespace-nowrap">
                {selected} {selected < compareTarget ? '<' : selected > compareTarget ? '>' : '='}{' '}
                {compareTarget}
              </div>
            )}
          </div>
          {compareTarget !== null && (
            <p className="text-xs text-slate-600 leading-relaxed">
              Trên tia số, số đứng bên trái bé hơn số đứng bên phải:{' '}
              <strong className="text-slate-900">
                {selected < compareTarget
                  ? `${selected} đứng trước ${compareTarget} nên ${selected} < ${compareTarget} (${selected} bé hơn ${compareTarget}).`
                  : selected > compareTarget
                  ? `${selected} đứng sau ${compareTarget} nên ${selected} > ${compareTarget} (${selected} lớn hơn ${compareTarget}).`
                  : `Hai số cùng vị trí nên ${selected} = ${compareTarget}.`}
              </strong>
            </p>
          )}
        </div>

        {/* Classroom Quick Challenge */}
        <div className="border-t border-slate-100 pt-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">Câu hỏi tương tác nhanh</span>
            {challengeIdx !== null && (
              <button
                type="button"
                onClick={() => {
                  setChallengeIdx(null);
                  setChallengeStatus('idle');
                }}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Thoát</span>
              </button>
            )}
          </div>

          {challengeIdx === null ? (
            <div className="grid grid-cols-2 gap-2">
              {CHALLENGES.map((ch, idx) => (
                <button
                  key={ch.prompt}
                  type="button"
                  onClick={() => startChallenge(idx)}
                  className="px-3 py-2.5 text-xs font-semibold text-left border border-slate-200 rounded-lg hover:border-sky-300 hover:bg-sky-50/50 text-slate-700 transition-colors cursor-pointer"
                >
                  Thử thách {idx + 1}
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-col gap-2">
              <p className="text-sm font-semibold text-slate-900">
                {CHALLENGES[challengeIdx].prompt}
              </p>
              <p className="text-xs text-slate-600 flex items-start gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{CHALLENGES[challengeIdx].hint}</span>
              </p>
              {challengeStatus === 'idle' && (
                <div className="text-xs text-slate-500 pt-1">
                  Hãy nhấn vào đúng số trên tia số để trả lời nhé!
                </div>
              )}
              {challengeStatus === 'correct' && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md p-2 mt-1">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    Giỏi lắm! Đáp án chính xác là {CHALLENGES[challengeIdx].target}.
                  </span>
                </div>
              )}
              {challengeStatus === 'wrong' && (
                <div className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-2 mt-1">
                  Bạn vừa chọn {selected}. Gợi ý nhỏ: xem lại hướng dẫn ở trên và thử lại trên tia số nhé!
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
