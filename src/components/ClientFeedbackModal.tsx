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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/65 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg max-h-[92vh] flex flex-col bg-[#fffdfa] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-[#eadecc]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#f0e8db] bg-[#faf5ec] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 mr-2">
            <div className="w-8 h-8 rounded-xl bg-[#fef3c7] text-amber-700 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-stone-800 text-sm sm:text-base">Ghi Chú Cho Video</h3>
              <p className="text-xs text-stone-500 truncate">
                #{video.stt < 10 ? `0${video.stt}` : video.stt} - {video.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-[#ede5d6] transition min-w-[36px] min-h-[36px] flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form - ONLY NOTES */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2">
              Nội dung nhận xét / Yêu cầu chỉnh sửa:
            </label>
            <textarea
              rows={5}
              autoFocus
              placeholder="Nhập ghi chú hoặc yêu cầu chỉnh sửa cho bài này... (Ví dụ: Giây thứ 15 âm thanh hơi nhỏ; đổi ảnh bìa; video ok...)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3.5 text-xs sm:text-sm border border-[#eadecc] bg-[#fffdfa] rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800 leading-relaxed shadow-inner"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#f2ebd9]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:bg-[#f7f0e3] rounded-xl transition min-h-[40px]"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-md shadow-amber-600/20 disabled:opacity-50 min-h-[40px] active:scale-95"
            >
              {success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Đã lưu thành công!</span>
                </>
              ) : isSubmitting ? (
                <span>Đang gửi...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Lưu ghi chú</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
