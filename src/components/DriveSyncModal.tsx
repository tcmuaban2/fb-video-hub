'use client';

import React, { useState } from 'react';
import { 
  X, 
  CloudLightning, 
  FolderSync, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface DriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageId: string;
  pageName: string;
  folderUrl?: string;
  onSuccess: () => void;
}

export const DriveSyncModal: React.FC<DriveSyncModalProps> = ({
  isOpen,
  onClose,
  pageId,
  pageName,
  folderUrl,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'quick_paste' | 'drive_api'>('quick_paste');
  const [fileListText, setFileListText] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error'; text: string; details?: any[] } | null>(null);

  if (!isOpen) return null;

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResultMessage(null);

    try {
      const res = await fetch('/api/drive/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId,
          manualFileList: fileListText,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Quét Drive thất bại');
      }

      setResultMessage({
        type: 'success',
        text: data.message || `Đã khớp thành công ${data.matchedCount} video!`,
        details: data.matchedResults,
      });

      onSuccess();
    } catch (err: any) {
      setResultMessage({
        type: 'error',
        text: err.message || 'Lỗi khi quét Google Drive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-xl bg-[#fffdfa] rounded-2xl shadow-2xl overflow-hidden border border-[#eadecc]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#f0e8db] bg-[#faf5ec]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#fef3c7] text-amber-700 flex items-center justify-center">
              <CloudLightning className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-800 text-base">Quét & Nhận Diện Video Trên Drive</h3>
              <p className="text-xs text-stone-500">
                Đồng bộ tự động cho <strong className="text-amber-800">{pageName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-[#ede5d6] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSync} className="p-6 space-y-4">
          {/* Method tabs */}
          <div className="flex border-b border-[#eadecc]">
            <button
              type="button"
              onClick={() => setActiveTab('quick_paste')}
              className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition ${
                activeTab === 'quick_paste'
                  ? 'border-amber-600 text-amber-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              📋 Dán tên file / Link Video (Nhanh nhất)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('drive_api')}
              className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition ${
                activeTab === 'drive_api'
                  ? 'border-amber-600 text-amber-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              ☁️ Quét thư mục Google Drive
            </button>
          </div>

          {activeTab === 'quick_paste' ? (
            <div className="space-y-3">
              <p className="text-xs text-stone-600 leading-relaxed">
                Bạn vừa xuất hoặc up video lên Drive? Chỉ cần copy tên các file (hoặc link Drive) dán vào đây, hệ thống sẽ tự động quét theo số thứ tự (ví dụ: <code className="bg-[#f5ecda] px-1 py-0.5 rounded text-amber-800 font-mono font-bold">01_...</code>, <code className="bg-[#f5ecda] px-1 py-0.5 rounded text-amber-800 font-mono font-bold">02_...</code>) và tự đánh dấu <strong>"Đã up Drive"</strong>:
              </p>

              <textarea
                rows={6}
                placeholder={`Dán danh sách file tại đây, ví dụ:
01_BietThu_ViewSong.mp4
02_Penthouse_Landmark81.mp4
03_SaiLam_NhaDat.mp4
hoặc: https://drive.google.com/file/d/xxx/view - Video 04...`}
                value={fileListText}
                onChange={(e) => setFileListText(e.target.value)}
                className="w-full p-3 font-mono text-xs border border-[#eadecc] bg-[#fffdfa] rounded-xl focus:ring-2 focus:ring-amber-500 outline-none leading-relaxed text-stone-800"
              />
            </div>
          ) : (
            <div className="space-y-3 p-4 bg-[#faf5eb] rounded-xl border border-[#eadecc]">
              <div className="flex items-start gap-2">
                <FolderSync className="w-4 h-4 text-amber-700 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-stone-800">Thư mục Drive đã liên kết:</h4>
                  {folderUrl ? (
                    <a
                      href={folderUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-amber-800 hover:underline break-all block mt-1 font-semibold"
                    >
                      {folderUrl}
                    </a>
                  ) : (
                    <span className="text-xs text-amber-700">
                      Chưa gắn link Google Drive cho Page này. Hãy vào sửa Page để thêm.
                    </span>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-stone-500">
                Để quét trực tiếp từ Drive API không cần dán tên file, bạn có thể điền <strong>Google Drive API Key</strong> trong mục Cài đặt (bánh răng góc trên).
              </p>
            </div>
          )}

          {/* Results Message */}
          {resultMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs ${
                resultMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {resultMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                )}
                <span>{resultMessage.text}</span>
              </div>

              {resultMessage.details && resultMessage.details.length > 0 && (
                <div className="mt-2 pl-6 space-y-1 max-h-32 overflow-y-auto">
                  {resultMessage.details.map((item, idx) => (
                    <div key={idx} className="text-[11px] text-emerald-800 flex items-center gap-1.5 font-mono">
                      <span>✓ Bài #{item.stt < 10 ? `0${item.stt}` : item.stt}:</span>
                      <span className="truncate">{item.fileName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
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
              disabled={loading || (activeTab === 'quick_paste' && !fileListText.trim())}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition shadow-md shadow-amber-600/20 disabled:opacity-50"
            >
              {loading ? (
                <span>Đang đối soát...</span>
              ) : (
                <>
                  <CloudLightning className="w-4 h-4" />
                  <span>Quét & Tự Nhận Diện Video</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
