import React, { useState } from 'react';
import { Download, WifiOff } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-100 transition-colors cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Cài đặt ứng dụng</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Cài lên màn hình chính</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl border border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Cài đặt trên iPhone / iPad
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                1. Nhấn nút <strong>Chia sẻ</strong> trên thanh công cụ Safari.
                <br />
                2. Cuộn xuống và chọn <strong>Thêm vào màn hình chính</strong>.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-lg bg-slate-900 py-2 text-sm font-semibold text-white hover:bg-slate-800 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs font-medium px-4 py-2 flex items-center justify-center gap-2">
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>Đang hoạt động ngoại tuyến — Tất cả 5 thiết bị dạy học vẫn sử dụng bình thường.</span>
    </div>
  );
};
