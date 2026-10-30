'use client';

import React, { useState } from 'react';
import { X, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { VideoItem, ClientFeedback } from '@/types';

interface ClientFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoItem;
  onSaveFeedback: (feedback: ClientFeedback) => Promise<void>;
}

export const ClientFeedbackModal: React.FC<ClientFeedbackModalProps> = ({
  isOpen,
  onClose,
  video,
  onSaveFeedback,
}) => {
  const [notes, setNotes] = useState<string>(video.clientFeedback?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSaveFeedback({
        notes: notes.trim(),
        reviewerName: 'Khách hàng',
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-[#fffdfa] rounded-2xl shadow-2xl overflow-hidden border border-[#eadecc]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#f0e8db] bg-[#faf5ec]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#fef3c7] text-amber-700 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-800 text-base">Ghi Chú Cho Video</h3>
              <p className="text-xs text-stone-500 line-clamp-1">
                #{video.stt < 10 ? `0${video.stt}` : video.stt} - {video.title}
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

        {/* Content Form - ONLY NOTES */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2">
              Nội dung nhận xét / Yêu cầu chỉnh sửa:
            </label>
            <textarea
              rows={6}
              autoFocus
              placeholder="Nhập ghi chú hoặc yêu cầu chỉnh sửa cho bài này... (Ví dụ: Giây thứ 15 âm thanh hơi nhỏ; đổi ảnh bìa; video ok...)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3.5 text-sm border border-[#eadecc] bg-[#fffdfa] rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800 leading-relaxed shadow-inner"
            />
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
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition shadow-md shadow-amber-600/20 disabled:opacity-50"
            >
              {success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Đã lưu ghi chú!</span>
                </>
              ) : isSubmitting ? (
                <span>Đang lưu...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Lưu Ghi Chú</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
