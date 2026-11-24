import React, { useState } from 'react';
import { Ruler, Droplets, RotateCcw, CheckCircle2, Info } from 'lucide-react';
import { clampLiters, formatLengthConversion } from '../utils/mathEngine';

type MeasureTab = 'length' | 'capacity';

interface MeasurableObject {
  id: string;
  name: string;
  lengthCm: number;
  color: string;
}

const OBJECTS: MeasurableObject[] = [
  { id: 'pencil', name: 'Bút chì gỗ', lengthCm: 12, color: '#f59e0b' },
  { id: 'ribbon', name: 'Băng giấy xanh', lengthCm: 10, color: '#0284c7' },
  { id: 'eraser', name: 'Cục tẩy', lengthCm: 4, color: '#f43f5e' },
  { id: 'crayon', name: 'Bút sáp màu', lengthCm: 8, color: '#10b981' },
];

export const MeasurementTool: React.FC = () => {
  const [tab, setTab] = useState<MeasureTab>('length');

  // Length ruler state
  const [selectedObjId, setSelectedObjId] = useState<string>('pencil');
  const [startCm, setStartCm] = useState<number>(0);
  const [endCmCustom, setEndCmCustom] = useState<number>(12);
  const [useCustom, setUseCustom] = useState<boolean>(false);

  // Capacity state
  const [liters, setLiters] = useState<number>(3);
  const [targetLiters, setTargetLiters] = useState<number>(7);
  const [capacityNotice, setCapacityNotice] = useState<string | null>(null);

  const activeObject = OBJECTS.find((o) => o.id === selectedObjId) ?? OBJECTS[0];

  const safeStart = useCustom
    ? Math.max(0, Math.min(19, startCm))
    : Math.max(0, Math.min(20 - activeObject.lengthCm, startCm));

  const safeEnd = useCustom
    ? Math.max(safeStart + 1, Math.min(20, endCmCustom))
    : safeStart + activeObject.lengthCm;

  const objectLen = safeEnd - safeStart;
  const lengthConv = formatLengthConversion(objectLen);

  const pourWater = (delta: number) => {
    const res = clampLiters(liters, delta, 10);
    setLiters(res.next);
    if (res.overflow) {
      setCapacityNotice(
        `Không thể đổ thêm ${delta} lít vì bình chỉ chứa tối đa 10 lít (hiện đã có ${liters} lít).`
      );
    } else if (res.underflow) {
      setCapacityNotice('Bình đã cạn nước (0 lít), không thể múc bớt thêm.');
    } else {
      setCapacityNotice(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Main Stage */}
      <section className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {tab === 'length'
                ? 'Đo độ dài với đơn vị Xăng-ti-mét (cm) và Đề-xi-mét (dm)'
                : 'Đo dung tích với đơn vị Lít (l)'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {tab === 'length'
                ? 'Ghi nhớ: 1 dm = 10 cm. Độ dài bằng vạch kết thúc trừ vạch bắt đầu.'
                : 'Đổ nước bằng các ca 1 lít, 2 lít, 5 lít vào bình chia vạch (tối đa 10 lít).'}
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setTab('length')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                tab === 'length' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>Độ dài (cm, dm)</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('capacity')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                tab === 'capacity' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>Dung tích (Lít)</span>
            </button>
          </div>
        </div>

        {tab === 'length' ? (
          <div className="flex flex-col gap-6">
            {/* Visual Ruler + Object SVG */}
            <div className="w-full overflow-x-auto bg-slate-50 border border-slate-200 rounded-xl p-5">
              <svg
                viewBox="0 0 880 230"
                className="w-full min-w-[660px] h-auto select-none"
                role="img"
                aria-label={`Thước đo hiển thị ${useCustom ? 'Đoạn thẳng AB' : activeObject.name} dài ${objectLen} cm`}
              >
                {(() => {
                  const padX = 40;
                  const cmPx = 40;
                  const objX = padX + safeStart * cmPx;
                  const objW = objectLen * cmPx;

                  return (
                    <>
                      {/* Alignment Guide Lines */}
                      <line
                        x1={objX}
                        y1={36}
                        x2={objX}
                        y2={125}
                        stroke="#0284c7"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                      <line
                        x1={objX + objW}
                        y1={36}
                        x2={objX + objW}
                        y2={125}
                        stroke="#0284c7"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />

                      {/* Measured Object */}
                      {selectedObjId === 'pencil' && !useCustom ? (
                        <g>
                          <rect
                            x={objX}
                            y={56}
                            width={Math.max(20, objW - 22)}
                            height={28}
                            rx={3}
                            fill="#f59e0b"
                            stroke="#b45309"
                            strokeWidth="2"
                          />
                          <polygon
                            points={`${objX + objW - 22},56 ${objX + objW},70 ${
                              objX + objW - 22
                            },84`}
                            fill="#fde68a"
                            stroke="#b45309"
                            strokeWidth="2"
                          />
                          <polygon
                            points={`${objX + objW - 7},65 ${objX + objW},70 ${
                              objX + objW - 7
                            },75`}
                            fill="#1e293b"
                          />
                        </g>
                      ) : useCustom ? (
                        <g>
                          <line
                            x1={objX}
                            y1={70}
                            x2={objX + objW}
                            y2={70}
                            stroke="#0284c7"
                            strokeWidth="5"
                            strokeLinecap="round"
                          />
                          <circle cx={objX} cy={70} r="6" fill="#0369a1" />
                          <circle cx={objX + objW} cy={70} r="6" fill="#0369a1" />
                          <text
                            x={objX}
                            y={56}
                            textAnchor="middle"
                            className="fill-sky-800 text-xs font-bold"
                          >
                            A
                          </text>
                          <text
                            x={objX + objW}
                            y={56}
                            textAnchor="middle"
                            className="fill-sky-800 text-xs font-bold"
                          >
                            B
                          </text>
                        </g>
                      ) : (
                        <rect
                          x={objX}
                          y={56}
                          width={objW}
                          height={30}
                          rx={5}
                          fill={activeObject.color}
                          stroke="#0f172a"
                          strokeOpacity="0.2"
                          strokeWidth="2"
                        />
                      )}

                      <text
                        x={objX + objW / 2}
                        y={30}
                        textAnchor="middle"
                        className="fill-slate-800 text-xs font-bold"
                      >
                        {useCustom ? 'Đoạn thẳng AB' : activeObject.name}: {objectLen} cm
                        {lengthConv.dm > 0 ? ` (${lengthConv.label})` : ''}
                      </text>

                      {/* Ruler Body */}
                      <rect
                        x={padX - 16}
                        y={125}
                        width={20 * cmPx + 32}
                        height={78}
                        rx={8}
                        fill="#fef3c7"
                        stroke="#d97706"
                        strokeWidth="2"
                      />

                      {/* 1 dm Highlight Bar */}
                      <rect
                        x={padX}
                        y={184}
                        width={10 * cmPx}
                        height={8}
                        rx={4}
                        fill="#0284c7"
                        opacity="0.25"
                      />
                      <text
                        x={padX + 5 * cmPx}
                        y={198}
                        textAnchor="middle"
                        className="fill-sky-800 text-[10px] font-bold"
                      >
                        10 cm = 1 dm
                      </text>

                      {/* Ticks 0..20 cm */}
                      {Array.from({ length: 21 }, (_, cm) => {
                        const tx = padX + cm * cmPx;
                        const isTen = cm === 10 || cm === 20 || cm === 0;
                        const isEndpoint = cm === safeStart || cm === safeEnd;
                        return (
                          <g key={cm}>
                            <line
                              x1={tx}
                              y1={125}
                              x2={tx}
                              y2={125 + (isTen ? 28 : 20)}
                              stroke={isEndpoint ? '#0284c7' : '#78350f'}
                              strokeWidth={isEndpoint ? 3 : isTen ? 2.5 : 1.5}
                            />
                            <text
                              x={tx}
                              y={170}
                              textAnchor="middle"
                              className={`text-xs font-bold font-mono-tabular ${
                                isEndpoint ? 'fill-sky-700' : 'fill-amber-950'
                              }`}
                            >
                              {cm}
                            </text>
                          </g>
                        );
                      })}

                      {/* Half-cm ticks */}
                      {Array.from({ length: 20 }, (_, i) => {
                        const tx = padX + i * cmPx + cmPx / 2;
                        return (
                          <line
                            key={i}
                            x1={tx}
                            y1={125}
                            x2={tx}
                            y2={137}
                            stroke="#b45309"
                            strokeWidth="1"
                          />
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>

            {/* Length Calculation Readout */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="text-xs font-semibold text-slate-500">Vạch bắt đầu</div>
                <div className="text-2xl font-bold font-mono-tabular text-slate-900 mt-1">
                  {safeStart} cm
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="text-xs font-semibold text-slate-500">Vạch kết thúc</div>
                <div className="text-2xl font-bold font-mono-tabular text-slate-900 mt-1">
                  {safeEnd} cm
                </div>
              </div>
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                <div className="text-xs font-semibold text-sky-800">Độ dài thực tế</div>
                <div className="text-2xl font-bold font-mono-tabular text-sky-900 mt-1">
                  {objectLen} cm
                </div>
                <div className="text-xs text-sky-800 mt-0.5 font-medium">
                  {safeEnd} − {safeStart} = {objectLen} cm
                  {lengthConv.dm > 0 ? ` = ${lengthConv.label}` : ''}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Capacity (Liters) Interactive Stage */
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-50 border border-slate-200 rounded-xl p-6">
              {/* Measuring Tank SVG */}
              <div className="md:col-span-6 flex justify-center">
                <svg
                  viewBox="0 0 280 280"
                  className="w-60 h-auto select-none"
                  role="img"
                  aria-label={`Bình chia vạch đang chứa ${liters} lít nước trong tối đa 10 lít`}
                >
                  <defs>
                    <clipPath id="tankClip">
                      <rect x="64" y="34" width="132" height="212" rx="8" />
                    </clipPath>
                  </defs>

                  {/* Tank Background */}
                  <rect
                    x="60"
                    y="30"
                    width="140"
                    height="220"
                    rx="12"
                    fill="#ffffff"
                    stroke="#334155"
                    strokeWidth="3"
                  />

                  {/* Water Fill */}
                  <g clipPath="url(#tankClip)">
                    <rect
                      x="60"
                      y={246 - liters * 20}
                      width="140"
                      height={liters * 20 + 6}
                      fill="#0ea5e9"
                      opacity="0.82"
                      className="transition-all duration-300"
                    />
                    {liters > 0 && (
                      <line
                        x1="60"
                        y1={246 - liters * 20}
                        x2="200"
                        y2={246 - liters * 20}
                        stroke="#0369a1"
                        strokeWidth="2.5"
                      />
                    )}
                  </g>

                  {/* Target dashed line */}
                  <line
                    x1="54"
                    y1={246 - targetLiters * 20}
                    x2="206"
                    y2={246 - targetLiters * 20}
                    stroke="#d97706"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                  />
                  <text
                    x="212"
                    y={250 - targetLiters * 20}
                    className="fill-amber-700 text-xs font-bold font-mono-tabular"
                  >
                    Mục tiêu: {targetLiters} l
                  </text>

                  {/* Graduation Marks 1..10 l */}
                  {Array.from({ length: 10 }, (_, idx) => {
                    const mark = idx + 1;
                    const y = 246 - mark * 20;
                    return (
                      <g key={mark}>
                        <line
                          x1="60"
                          y1={y}
                          x2={mark % 5 === 0 ? '88' : '76'}
                          y2={y}
                          stroke="#0f172a"
                          strokeWidth={mark % 5 === 0 ? '2' : '1.2'}
                        />
                        <text
                          x="50"
                          y={y + 4}
                          textAnchor="end"
                          className="fill-slate-700 text-[11px] font-bold font-mono-tabular"
                        >
                          {mark} l
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Jug Pouring Controls */}
              <div className="md:col-span-6 flex flex-col gap-4">
                <div>
                  <div className="text-xs font-semibold text-slate-500">
                    Lượng nước hiện có (Tối đa 10 lít)
                  </div>
                  <div className="text-4xl font-bold font-mono-tabular text-sky-700 mt-1">
                    {liters} lít
                  </div>
                </div>

                {liters === targetLiters ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Chính xác! Bình đang chứa đúng {targetLiters} lít nước.</span>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-600">
                    {liters < targetLiters
                      ? `Cần đổ thêm ${targetLiters - liters} lít nữa để đạt mục tiêu ${targetLiters} lít.`
                      : `Đang dư ${liters - targetLiters} lít. Hãy múc bớt ra để còn ${targetLiters} lít.`}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 5].map((amount) => {
                    const wouldOverflow = liters + amount > 10;
                    return (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => pourWater(amount)}
                        className={`py-2.5 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                          wouldOverflow
                            ? 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                            : 'bg-sky-600 text-white hover:bg-sky-700'
                        }`}
                      >
                        + {amount} lít
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => pourWater(-1)}
                    disabled={liters <= 0}
                    className="py-2 px-3 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Đổ bớt 1 lít
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLiters(0);
                      setCapacityNotice(null);
                    }}
                    disabled={liters === 0}
                    className="py-2 px-3 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Đổ hết nước
                  </button>
                </div>

                {capacityNotice && (
                  <div className="flex items-start gap-1.5 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{capacityNotice}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Right Control Deck */}
      <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-6">
        {tab === 'length' ? (
          <>
            <div>
              <h3 className="text-base font-bold text-slate-900">Chọn vật cần đo</h3>
              <p className="text-xs text-slate-500 mt-1">
                Đặt vật ở vạch 0 cm hoặc một vạch bất kỳ để thực hành phép trừ tính độ dài.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {OBJECTS.map((obj) => (
                <button
                  key={obj.id}
                  type="button"
                  onClick={() => {
                    setSelectedObjId(obj.id);
                    setUseCustom(false);
                    setStartCm((s) => Math.min(s, 20 - obj.lengthCm));
                  }}
                  className={`px-3 py-2.5 text-xs font-semibold rounded-lg border text-left transition-colors cursor-pointer ${
                    !useCustom && selectedObjId === obj.id
                      ? 'bg-sky-50 border-sky-400 text-sky-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>{obj.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono-tabular mt-0.5">
                    {obj.lengthCm} cm
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">Đoạn thẳng AB</span>
                <button
                  type="button"
                  onClick={() => {
                    if (!useCustom) {
                      setUseCustom(true);
                      setStartCm(0);
                      setEndCmCustom(12);
                    } else {
                      setUseCustom(false);
                    }
                  }}
                  className="text-xs font-semibold text-sky-700 hover:underline cursor-pointer"
                >
                  {useCustom ? 'Quay lại đồ vật' : 'Bật đoạn thẳng AB'}
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">Vạch bắt đầu</span>
                  <span className="font-mono-tabular font-bold text-slate-900">{safeStart} cm</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={useCustom ? 19 : 20 - activeObject.lengthCm}
                  value={safeStart}
                  onChange={(e) => {
                    const nextStart = Number(e.target.value);
                    setStartCm(nextStart);
                    if (useCustom && endCmCustom <= nextStart) {
                      setEndCmCustom(Math.min(20, nextStart + 1));
                    }
                  }}
                  aria-label="Vị trí vạch bắt đầu"
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {useCustom && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">Vạch kết thúc</span>
                    <span className="font-mono-tabular font-bold text-sky-700">{safeEnd} cm</span>
                  </div>
                  <input
                    type="range"
                    min={safeStart + 1}
                    max={20}
                    value={safeEnd}
                    onChange={(e) => setEndCmCustom(Number(e.target.value))}
                    aria-label="Vị trí vạch kết thúc"
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setStartCm(0);
                  if (useCustom) setEndCmCustom(10);
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại về vạch 0 cm</span>
              </button>
            </div>

            <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
              <span className="text-sm font-bold text-slate-900">Đổi đơn vị mẫu (dm – cm)</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { len: 10, label: '10 cm = 1 dm' },
                  { len: 12, label: '12 cm' },
                  { len: 20, label: '20 cm = 2 dm' },
                ].map((ex) => (
                  <button
                    key={ex.len}
                    type="button"
                    onClick={() => {
                      setUseCustom(true);
                      setStartCm(0);
                      setEndCmCustom(ex.len);
                    }}
                    className="px-2 py-2 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-800 cursor-pointer"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <h3 className="text-base font-bold text-slate-900">Thử thách đong nước</h3>
              <p className="text-xs text-slate-500 mt-1">
                Chọn mức mục tiêu và dùng các ca đong để thực hành cộng trừ dung tích (lít).
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">Mức nước mục tiêu</span>
                <span className="font-mono-tabular font-bold text-amber-700">{targetLiters} lít</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={targetLiters}
                onChange={(e) => {
                  setTargetLiters(Number(e.target.value));
                  setLiters(0);
                  setCapacityNotice(null);
                }}
                aria-label="Mức nước mục tiêu tính bằng lít"
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
              <span className="text-sm font-bold text-slate-900">Bài toán gợi ý</span>
              {[
                { target: 6, note: 'Đổ 5 lít rồi thêm 1 lít (5 + 1 = 6 l)' },
                { target: 7, note: 'Đổ 5 lít rồi thêm 2 lít (5 + 2 = 7 l)' },
                { target: 9, note: 'Đổ 10 lít (5 + 5) rồi múc bớt 1 lít (10 − 1 = 9 l)' },
              ].map((item) => (
                <button
                  key={item.target}
                  type="button"
                  onClick={() => {
                    setTargetLiters(item.target);
                    setLiters(0);
                    setCapacityNotice(null);
                  }}
                  className={`p-3 text-left border rounded-lg cursor-pointer transition-colors ${
                    targetLiters === item.target
                      ? 'bg-sky-50/70 border-sky-300'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">Đong đúng {item.target} lít</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{item.note}</div>
                </button>
              ))}
            </div>
          </>
        )}
      </aside>
    </div>
  );
};
