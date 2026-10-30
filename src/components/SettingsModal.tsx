'use client';

import React, { useState, useEffect } from 'react';
import { X, Settings as SettingsIcon, Key, Save, CheckCircle2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data.settings?.googleApiKey) {
            setApiKey(data.settings.googleApiKey);
          }
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleApiKey: apiKey }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-[#fffdfa] rounded-2xl shadow-2xl overflow-hidden border border-[#eadecc]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[#f0e8db] bg-[#faf5ec]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#fef3c7] text-amber-700 flex items-center justify-center">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-800 text-base">Cấu hình Hệ Thống & Google Drive</h3>
              <p className="text-xs text-stone-500">Thiết lập kết nối tự động quét video từ Drive</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-[#ede5d6] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-700" />
              Google Drive API Key (Tùy chọn)
            </label>
            <input
              type="text"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3.5 py-2 font-mono text-xs border border-[#eadecc] bg-[#fffdfa] rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800"
            />
            <p className="text-[11px] text-stone-500 mt-1.5 leading-relaxed">
              Nếu không điền API Key, bạn vẫn có thể quét nhanh bằng cách <strong>dán danh sách tên file video</strong> trong cửa sổ "Quét Drive".
            </p>
          </div>

          <div className="p-3.5 bg-[#fef3c7]/60 rounded-xl border border-[#fde68a] text-xs text-amber-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <span>💡 Cách lấy Google Drive API Key miễn phí (2 phút):</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-amber-900/90 font-medium">
              <li>Truy cập <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="underline font-bold">Google Cloud Console</a>.</li>
              <li>Bật <strong>Google Drive API</strong> trong mục "APIs & Services".</li>
              <li>Vào mục <strong>Credentials</strong> $\rightarrow$ Bấm <strong>Create Credentials</strong> $\rightarrow$ Chọn <strong>API Key</strong>.</li>
              <li>Dán API Key vào ô trên và bấm Lưu.</li>
            </ol>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-[#f7f0e3] rounded-xl transition"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition shadow-md shadow-amber-600/20 disabled:opacity-50"
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Đã lưu!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu cài đặt</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
