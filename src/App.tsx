import { useState } from 'react';
import { NumberLineTool } from './components/NumberLineTool';
import { TenFrameTool } from './components/TenFrameTool';
import { Base10ColumnTool } from './components/Base10ColumnTool';
import { MeasurementTool } from './components/MeasurementTool';
import { ClockTool } from './components/ClockTool';
import { OfflineBanner, PWAInstallButton } from './components/PWAInstallButton';

type ToolId = 'number-line' | 'ten-frame' | 'base-10' | 'measurement' | 'clock';

interface NavItem {
  id: ToolId;
  label: string;
  chapter: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'number-line', label: 'Tia số', chapter: 'Ôn tập và bổ sung · Tia số, số liền trước – liền sau' },
  { id: 'ten-frame', label: 'Khung 10', chapter: 'Phép cộng, phép trừ qua 10 trong phạm vi 20' },
  { id: 'base-10', label: 'Chục & Đơn vị', chapter: 'Cấu tạo số, so sánh và phép tính có nhớ trong phạm vi 100' },
  { id: 'measurement', label: 'Đo lường', chapter: 'Xăng-ti-mét (cm), Đề-xi-mét (dm) và Lít (l)' },
  { id: 'clock', label: 'Đồng hồ', chapter: 'Ngày – Giờ · Xem đồng hồ và thời gian trong ngày' },
];

export function App() {
  const [activeTool, setActiveTool] = useState<ToolId>('number-line');
  const [resetVersion, setResetVersion] = useState<number>(0);

  const currentItem = NAV_ITEMS.find((item) => item.id === activeTool) ?? NAV_ITEMS[0];

  const handleResetTool = () => {
    setResetVersion((v) => v + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <OfflineBanner />

      {/* Three-Zone Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveTool('number-line');
            }}
            className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            Toán 2 – Hành trình khám phá
          </a>

          {/* Zone 2: Navigation Links */}
          <nav
            aria-label="Danh mục thiết bị dạy học số"
            className="hidden md:flex items-center gap-6 text-sm font-medium"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeTool === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTool(item.id)}
                  className={`py-5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'border-sky-600 text-sky-700 font-semibold'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleResetTool}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Đặt lại bảng
            </button>
          </div>
        </div>

        {/* Mobile Navigation Strip */}
        <div className="md:hidden border-t border-slate-100 px-4 py-2 flex items-center gap-4 overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTool === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTool(item.id)}
                className={`py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'border-sky-600 text-sky-700'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Container */}
      <main id="top" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        {/* Clean Unboxed Context Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Thiết bị dạy học số</span>
            <span aria-hidden="true">·</span>
            <span>Môn Toán lớp 2 – Tập 1</span>
            <span aria-hidden="true">·</span>
            <span className="text-sky-700 font-medium">{currentItem.chapter}</span>
          </div>
        </div>

        {/* Active Interactive Teaching Aid */}
        <div key={`${activeTool}-${resetVersion}`}>
          {activeTool === 'number-line' && <NumberLineTool />}
          {activeTool === 'ten-frame' && <TenFrameTool />}
          {activeTool === 'base-10' && <Base10ColumnTool />}
          {activeTool === 'measurement' && <MeasurementTool />}
          {activeTool === 'clock' && <ClockTool />}
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span>Toán 2 – Hành trình khám phá · Bộ thiết bị dạy học số môn Toán lớp 2 (Tập 1)</span>
          <div className="flex items-center gap-4">
            <PWAInstallButton />
            <span>Tương tác trực quan trên bảng thông minh và máy tính</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
