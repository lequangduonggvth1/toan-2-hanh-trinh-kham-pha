import React, { useState } from 'react';
import { Sun, Sunset, Moon, RotateCcw, CheckCircle2, HelpCircle } from 'lucide-react';
import { getVietnameseTimeInfo } from '../utils/mathEngine';

interface ClockChallenge {
  id: string;
  label: string;
  targetHour24: number;
  targetMinute: number;
  startMinutes: number;
  hint: string;
}

const CLOCK_CHALLENGES: ClockChallenge[] = [
  {
    id: 'c-0700',
    label: '7 giờ đúng sáng',
    targetHour24: 7,
    targetMinute: 0,
    startMinutes: 5 * 60 + 30,
    hint: 'Kim ngắn chỉ số 7, kim dài chỉ số 12 và đang ở buổi sáng (07:00).',
  },
  {
    id: 'c-0915',
    label: '9 giờ 15 phút sáng',
    targetHour24: 9,
    targetMinute: 15,
    startMinutes: 8 * 60,
    hint: 'Kim ngắn qua số 9 một chút, kim dài chỉ số 3 (15 phút), buổi sáng (09:15).',
  },
  {
    id: 'c-1430',
    label: '14 giờ 30 phút / 2 giờ rưỡi chiều',
    targetHour24: 14,
    targetMinute: 30,
    startMinutes: 13 * 60,
    hint: '2 giờ rưỡi chiều là 14:30 — kim ngắn nằm giữa số 2 và số 3, kim dài chỉ số 6.',
  },
  {
    id: 'c-2000',
    label: '20 giờ / 8 giờ tối',
    targetHour24: 20,
    targetMinute: 0,
    startMinutes: 18 * 60 + 30,
    hint: '8 giờ tối tương ứng 20:00 — kim ngắn chỉ số 8, kim dài chỉ số 12.',
  },
];

export const ClockTool: React.FC = () => {
  // Store total minutes in 24h cycle (0..1439)
  const [totalMinutes, setTotalMinutes] = useState<number>(8 * 60 + 30);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);

  const timeInfo = getVietnameseTimeInfo(totalMinutes);
  const {
    hour24,
    minute,
    period,
    digitalText,
    primaryReading,
    halfHourAlias,
    reading24h,
    hourAngle,
    minuteAngle,
  } = timeInfo;

  const adjustMinutes = (delta: number) => {
    setTotalMinutes((prev) => (((prev + delta) % 1440) + 1440) % 1440);
  };

  const handleClickHourNumber = (clickedHour12: number) => {
    // Preserve current morning/afternoon/evening context
    const isAfternoonOrNight = hour24 >= 12;
    let nextHour24 = clickedHour12 % 12;
    if (isAfternoonOrNight) {
      nextHour24 += 12;
    }
    setTotalMinutes(nextHour24 * 60 + minute);
  };

  const activeChallenge =
    CLOCK_CHALLENGES.find((c) => c.id === activeChallengeId) ?? null;

  const isChallengeMatch =
    activeChallenge !== null &&
    hour24 === activeChallenge.targetHour24 &&
    minute === activeChallenge.targetMinute;

  const startChallenge = (ch: ClockChallenge) => {
    setActiveChallengeId(ch.id);
    setTotalMinutes(ch.startMinutes);
  };

  const normalized = ((totalMinutes % 1440) + 1440) % 1440;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Main Analog + Digital Clock Stage */}
      <section className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Xem đồng hồ và Thời gian trong ngày</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Quan sát kim ngắn (chỉ giờ) chuyển động liên tục theo kim dài (chỉ phút) và cách đọc 24 giờ.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setTotalMinutes(8 * 60)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                period === 'morning' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Buổi sáng</span>
            </button>
            <button
              type="button"
              onClick={() => setTotalMinutes(14 * 60 + 30)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                period === 'afternoon' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Sunset className="w-3.5 h-3.5" />
              <span>Buổi chiều</span>
            </button>
            <button
              type="button"
              onClick={() => setTotalMinutes(20 * 60)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                period === 'evening' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Buổi tối</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-2">
          {/* Analog Clock Face */}
          <div className="md:col-span-6 flex flex-col items-center gap-2">
            <svg
              viewBox="0 0 300 300"
              className="w-64 sm:w-72 h-auto select-none"
              role="img"
              aria-label={`Đồng hồ đang chỉ ${digitalText} (${primaryReading})`}
            >
              {/* Outer Frame */}
              <circle cx="150" cy="150" r="138" fill="#ffffff" stroke="#0f172a" strokeWidth="6" />
              <circle cx="150" cy="150" r="128" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* 60 Minute Ticks */}
              {Array.from({ length: 60 }, (_, i) => {
                const isMajor = i % 5 === 0;
                const angle = (i * 6 * Math.PI) / 180;
                const rOuter = 124;
                const rInner = isMajor ? 112 : 118;
                const x1 = 150 + rInner * Math.sin(angle);
                const y1 = 150 - rInner * Math.cos(angle);
                const x2 = 150 + rOuter * Math.sin(angle);
                const y2 = 150 - rOuter * Math.cos(angle);
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isMajor ? '#0f172a' : '#94a3b8'}
                    strokeWidth={isMajor ? 2.5 : 1.2}
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Interactive Hour Numbers 1..12 */}
              {Array.from({ length: 12 }, (_, idx) => {
                const h = idx + 1;
                const angle = (h * 30 * Math.PI) / 180;
                const rx = 150 + 94 * Math.sin(angle);
                const ry = 150 - 94 * Math.cos(angle);
                return (
                  <g
                    key={h}
                    onClick={() => handleClickHourNumber(h)}
                    className="cursor-pointer group"
                  >
                    <circle cx={rx} cy={ry} r="15" fill="transparent" />
                    <text
                      x={rx}
                      y={ry + 6}
                      textAnchor="middle"
                      className="fill-slate-900 group-hover:fill-sky-700 font-bold text-lg font-mono-tabular"
                    >
                      {h}
                    </text>
                  </g>
                );
              })}

              {/* Hour Hand (Short, Sky Blue, moves continuously with minutes) */}
              <g transform={`rotate(${hourAngle} 150 150)`}>
                <line
                  x1="150"
                  y1="158"
                  x2="150"
                  y2="82"
                  stroke="#0284c7"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </g>

              {/* Minute Hand (Long, Amber) */}
              <g transform={`rotate(${minuteAngle} 150 150)`}>
                <line
                  x1="150"
                  y1="162"
                  x2="150"
                  y2="46"
                  stroke="#d97706"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </g>

              {/* Center Pin */}
              <circle cx="150" cy="150" r="7" fill="#0f172a" />
            </svg>
            <span className="text-[11px] text-slate-500">
              Nhấp vào số 1–12 trên mặt đồng hồ để xoay nhanh kim giờ
            </span>
          </div>

          {/* Synchronized Digital & Vietnamese Reading */}
          <div className="md:col-span-6 flex flex-col gap-4">
            <div className="bg-slate-900 text-white rounded-xl p-5 flex flex-col items-center justify-center">
              <span className="text-xs font-medium text-slate-400">Đồng hồ điện tử (24 giờ)</span>
              <div className="text-5xl font-bold font-mono-tabular tracking-widest mt-1">
                {digitalText}
              </div>
            </div>

            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex flex-col gap-2">
              <div className="text-xs font-bold text-sky-900">Cách đọc giờ chuẩn</div>
              <div className="text-lg font-bold text-slate-900">{primaryReading}</div>
              {halfHourAlias && (
                <div className="text-sm font-semibold text-sky-800">
                  Còn gọi là: {halfHourAlias}
                </div>
              )}
              {hour24 >= 13 && (
                <div className="text-xs text-slate-600">
                  Theo hệ 24 giờ: <strong className="text-slate-900">{reading24h}</strong>
                </div>
              )}
            </div>

            {/* Hand Legend */}
            <div className="flex items-center gap-6 text-xs text-slate-600 px-1">
              <div className="flex items-center gap-2">
                <span className="w-4 h-1.5 bg-sky-600 rounded-full inline-block" />
                <span>Kim ngắn: chỉ giờ</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 bg-amber-600 rounded-full inline-block" />
                <span>Kim dài: chỉ phút</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right Control Deck */}
      <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Xoay kim đồng hồ</h3>
          <p className="text-xs text-slate-500 mt-1">
            Tăng hoặc giảm thời gian; hai đồng hồ luôn cập nhật đồng thời.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => adjustMinutes(-15)}
            className="py-2.5 px-3 text-xs font-semibold border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            − 15 phút
          </button>
          <button
            type="button"
            onClick={() => adjustMinutes(15)}
            className="py-2.5 px-3 text-xs font-semibold border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            + 15 phút
          </button>
          <button
            type="button"
            onClick={() => adjustMinutes(-5)}
            className="py-2.5 px-3 text-xs font-semibold border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            − 5 phút
          </button>
          <button
            type="button"
            onClick={() => adjustMinutes(5)}
            className="py-2.5 px-3 text-xs font-semibold border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            + 5 phút
          </button>
          <button
            type="button"
            onClick={() => adjustMinutes(-60)}
            className="py-2.5 px-3 text-xs font-semibold border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            − 1 giờ
          </button>
          <button
            type="button"
            onClick={() => adjustMinutes(60)}
            className="py-2.5 px-3 text-xs font-semibold bg-sky-600 text-white rounded-lg hover:bg-sky-700 cursor-pointer"
          >
            + 1 giờ
          </button>
        </div>

        {/* Fine Slider */}
        <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">Chỉnh nhanh theo phút</span>
            <span className="font-mono-tabular font-bold text-slate-900">{digitalText}</span>
          </div>
          <input
            type="range"
            min={0}
            max={1435}
            step={5}
            value={normalized - (normalized % 5)}
            onChange={(e) => setTotalMinutes(Number(e.target.value))}
            aria-label="Thanh trượt chỉnh thời gian trong ngày"
            className="w-full accent-sky-600 cursor-pointer"
          />
        </div>

        {/* Interactive Clock Practice */}
        <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">Thực hành quay kim</span>
            {activeChallenge !== null && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => startChallenge(activeChallenge)}
                  className="text-xs text-sky-700 hover:underline font-semibold cursor-pointer"
                >
                  Làm lại bài này
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChallengeId(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Đóng</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2">
            {CLOCK_CHALLENGES.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => startChallenge(ch)}
                className={`px-3 py-2 text-xs font-semibold text-left rounded-lg border transition-colors cursor-pointer ${
                  activeChallengeId === ch.id
                    ? 'bg-sky-50 border-sky-400 text-sky-900'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Bài thực hành: {ch.label}
              </button>
            ))}
          </div>

          {activeChallenge !== null && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-col gap-2 text-xs">
              <div className="text-slate-800 font-semibold">
                Yêu cầu: Xoay kim đồng hồ chỉ{' '}
                <strong className="text-sky-800">{activeChallenge.label}</strong>
              </div>
              <div className="text-slate-600">
                Hiện tại trên đồng hồ: <strong className="font-mono-tabular text-slate-900">{digitalText}</strong> ({primaryReading})
              </div>
              {isChallengeMatch ? (
                <div className="flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md p-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Tuyệt vời! Bạn đã chỉnh đúng {activeChallenge.label}.</span>
                </div>
              ) : (
                <div className="flex items-start gap-1.5 text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-2">
                  <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Gợi ý: {activeChallenge.hint}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
