'use client';

import React, { useState } from 'react';
import { X, ListPlus, Calendar, Clock, Sparkles } from 'lucide-react';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageId: string;
  pageName: string;
  onSuccess: () => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  pageId,
  pageName,
  onSuccess,
}) => {
  const [rawTitles, setRawTitles] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [defaultTime, setDefaultTime] = useState('11:30');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const lines = rawTitles
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lines.length === 0) {
      setError('Vui lòng nhập ít nhất một dòng tiêu đề');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'bulk',
          pageId,
          rawTitles,
          startDate,
          defaultTime,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Có lỗi xảy ra');
      }

      setRawTitles('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi nhập dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/65 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-xl max-h-[92vh] flex flex-col bg-[#fffdfa] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-[#eadecc]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#f0e8db] bg-[#faf5ec] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#fef3c7] text-amber-700 flex items-center justify-center shrink-0">
              <ListPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-800 text-sm sm:text-base">Nhập Nhanh Danh Sách Title</h3>
              <p className="text-xs text-stone-500">
                Thêm hàng loạt video cho <strong className="text-amber-800">{pageName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-[#ede5d6] transition min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleBulkSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {error}
            </div>
          )}

          {/* Date & Time Settings */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                Ngày bắt đầu
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#eadecc] bg-[#fffdfa] rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                Khung giờ đăng mẫu
              </label>
              <input
                type="time"
                value={defaultTime}
                onChange={(e) => setDefaultTime(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#eadecc] bg-[#fffdfa] rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800"
              />
            </div>
          </div>

          {/* Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-stone-700">
                Danh sách Title (Mỗi dòng 1 tiêu đề)
              </label>
              <span className="text-xs font-mono font-bold text-amber-700">
                Đã phát hiện: {lines.length} bài
              </span>
            </div>
            <textarea
              rows={8}
              placeholder={`Dán danh sách tiêu đề vào đây (mỗi dòng một bài), ví dụ:
1. Đập hộp điện thoại mới nhất
2. Hướng dẫn cách quay video triệu view
3. Top 5 bí quyết tăng follow nhanh...`}
              value={rawTitles}
              onChange={(e) => setRawTitles(e.target.value)}
              className="w-full p-3 font-mono text-xs border border-[#eadecc] bg-[#fffdfa] rounded-xl focus:ring-2 focus:ring-amber-500 outline-none leading-relaxed text-stone-800"
            />
            <p className="text-[11px] text-stone-500 mt-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Hệ thống sẽ tự động gán STT liên tục, tự động tăng ngày đăng theo từng bài tiếp theo!
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-[#f7f0e3] rounded-xl transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || lines.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition shadow-md shadow-amber-600/20 disabled:opacity-50"
            >
              {loading ? (
                <span>Đang xử lý...</span>
              ) : (
                <>
                  <ListPlus className="w-4 h-4" />
                  <span>Tạo ngay {lines.length > 0 ? `${lines.length} video` : ''}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
