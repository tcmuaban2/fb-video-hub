'use client';

import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Trash2, 
  FileEdit, 
  Link as LinkIcon, 
  MessageSquare, 
  Sparkles,
  Calendar,
  Clock
} from 'lucide-react';
import { VideoItem, VideoStatus } from '@/types';

interface VideoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoItem;
  onSave: (updatedData: Partial<VideoItem>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const VideoEditModal: React.FC<VideoEditModalProps> = ({
  isOpen,
  onClose,
  video,
  onSave,
  onDelete,
}) => {
  const [stt, setStt] = useState(video.stt);
  const [title, setTitle] = useState(video.title);
  const [caption, setCaption] = useState(video.caption || '');
  const [status, setStatus] = useState<VideoStatus>(video.status);
  const [driveVideoUrl, setDriveVideoUrl] = useState(video.driveVideoUrl || '');
  const [scheduledDate, setScheduledDate] = useState(video.scheduledDate || '');
  const [scheduledTime, setScheduledTime] = useState(video.scheduledTime || '11:30');
  const [editorNotes, setEditorNotes] = useState(video.editorNotes || '');
  const [isRevised, setIsRevised] = useState(video.isRevised || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        stt: Number(stt),
        title: title.trim(),
        caption: caption.trim(),
        status,
        driveVideoUrl: driveVideoUrl.trim(),
        scheduledDate,
        scheduledTime,
        editorNotes: editorNotes.trim(),
        isRevised,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasClientNote = Boolean(video.clientFeedback?.notes && video.clientFeedback.notes.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-xl max-h-[90vh] flex flex-col bg-[#fffdfa] rounded-2xl shadow-2xl overflow-hidden border border-[#eadecc]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#f0e8db] bg-[#faf5ec]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#fef3c7] text-amber-700 flex items-center justify-center">
              <FileEdit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-800 text-base">Chỉnh Sửa / Cập Nhật Video</h3>
              <p className="text-xs text-stone-500">
                Sửa thông tin, thay link video hoặc cập nhật theo ghi chú của khách
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Client Feedback Note Alert box if exists */}
          {hasClientNote && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
                <MessageSquare className="w-4 h-4 text-rose-600" />
                <span>Ghi chú từ Khách hàng:</span>
              </div>
              <p className="text-xs text-rose-900 bg-white/80 p-2.5 rounded-lg font-medium leading-relaxed">
                "{video.clientFeedback?.notes}"
              </p>
            </div>
          )}

          {/* Row: STT + Status */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">STT</label>
              <input
                type="number"
                value={stt}
                onChange={(e) => setStt(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-[#eadecc] bg-[#fffdfa] rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">Trạng thái bài</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VideoStatus)}
                className="w-full px-3 py-2 text-xs border border-[#eadecc] bg-[#fffdfa] rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800 font-bold"
              >
                <option value="not_started">⏳ Chưa làm</option>
                <option value="uploaded_drive">📁 Đã up Drive</option>
                <option value="scheduled_fb">⏰ Đã lên lịch FB</option>
                <option value="published_fb">✅ Đã đăng FB</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Tiêu đề Video</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-bold border border-[#eadecc] bg-[#fffdfa] rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800"
              required
            />
          </div>

          {/* Drive Video Link / URL */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-amber-700" />
                Link Video Google Drive (hoặc file mp4)
              </span>
              <span className="text-[11px] text-stone-400">Thay đổi link khi render lại video</span>
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/file/d/xxx/view"
              value={driveVideoUrl}
              onChange={(e) => setDriveVideoUrl(e.target.value)}
              className="w-full px-3.5 py-2 font-mono text-xs border border-[#eadecc] bg-[#fffdfa] rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-stone-500" />
                Ngày đăng dự kiến
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#eadecc] bg-[#fffdfa] rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-stone-500" />
                Giờ đăng
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#eadecc] bg-[#fffdfa] rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800"
              />
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Mô tả / Caption bài đăng</label>
            <textarea
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Caption hoặc ghi chú nội dung..."
              className="w-full px-3.5 py-2 text-xs border border-[#eadecc] bg-[#fffdfa] rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800"
            />
          </div>

          {/* Editor Note & Revised Checkbox */}
          <div className="p-3.5 bg-[#faf5eb] rounded-xl border border-[#eadecc] space-y-2.5">
            <label className="block text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              Ghi chú phản hồi của Editor (Bạn)
            </label>
            <input
              type="text"
              placeholder="VD: Đã chỉnh lại nhạc ở giây 20 và re-up bản mới..."
              value={editorNotes}
              onChange={(e) => setEditorNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#eadecc] bg-[#fffdfa] rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800"
            />

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isRevised}
                onChange={(e) => setIsRevised(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
              />
              <span className="text-xs font-semibold text-stone-700">
                Đánh dấu: "Đã sửa video theo ghi chú của khách"
              </span>
            </label>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-2 border-t border-[#f0e8db]">
            {onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Bạn có chắc muốn xóa video #${stt}?`)) {
                    onDelete(video.id);
                    onClose();
                  }
                }}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                title="Xóa video này"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
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
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition shadow-md shadow-amber-600/20 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
