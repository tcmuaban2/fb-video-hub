'use client';

import React from 'react';
import { 
  Play, 
  Edit3, 
  CheckCircle, 
  Clock, 
  FolderCheck, 
  MessageSquare, 
  Check, 
  ChevronDown,
  ListPlus
} from 'lucide-react';
import { VideoItem, VideoStatus } from '@/types';

interface VideoTableProps {
  videos: VideoItem[];
  isClientMode: boolean;
  onPlayVideo: (video: VideoItem) => void;
  onEditVideo: (video: VideoItem) => void;
  onOpenFeedback: (video: VideoItem) => void;
  onQuickStatusChange: (id: string, newStatus: VideoStatus) => void;
  onOpenBulkImport?: () => void;
}

export const VideoTable: React.FC<VideoTableProps> = ({
  videos,
  isClientMode,
  onPlayVideo,
  onEditVideo,
  onOpenFeedback,
  onQuickStatusChange,
  onOpenBulkImport,
}) => {
  const getStatusBadge = (status: VideoStatus) => {
    switch (status) {
      case 'not_started':
        return {
          label: 'Chưa làm',
          bg: 'bg-[#fffbeb] text-amber-800 border-[#fef3c7]',
          dot: 'bg-amber-500',
        };
      case 'uploaded_drive':
        return {
          label: 'Đã có trên Drive',
          bg: 'bg-[#fef9c3] text-amber-900 border-[#fde047]',
          dot: 'bg-amber-600',
        };
      case 'scheduled_fb':
        return {
          label: 'Đã lên lịch FB',
          bg: 'bg-[#faf5ff] text-purple-800 border-[#f3e8ff]',
          dot: 'bg-purple-500',
        };
      case 'published_fb':
        return {
          label: 'Đã đăng FB',
          bg: 'bg-[#f0fdf4] text-emerald-800 border-[#dcfce7]',
          dot: 'bg-emerald-600',
        };
    }
  };

  return (
    <div className="bg-[#fffdfa] rounded-2xl border border-[#eadecc] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#eadecc] bg-[#f8f2e6] text-[11px] font-bold uppercase tracking-wider text-stone-600">
              <th className="py-3 px-4 w-14 text-center">STT</th>
              <th className="py-3 px-4 min-w-[280px]">Tiêu đề Video / Nội dung</th>
              <th className="py-3 px-4 w-32">Ngày giờ đăng</th>
              <th className="py-3 px-4 w-28 text-center">Video Drive</th>
              <th className="py-3 px-4 w-40 text-center">Trạng thái bài</th>
              <th className="py-3 px-4 min-w-[240px]">
                {isClientMode ? 'Ghi chú của bạn' : 'Ghi chú của Khách'}
              </th>
              <th className="py-3 px-4 w-28 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f2ebd9] text-sm">
            {videos.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 px-4">
                  <div className="max-w-md mx-auto space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#fef3c7] text-amber-700 flex items-center justify-center mx-auto">
                      <Clock className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-stone-800 text-base">Chưa có video nào</h4>
                    <p className="text-xs text-stone-500">
                      Bảng hiện đang trống hoàn toàn. Bạn có thể dán trước 30-50 dòng tiêu đề để lên kế hoạch ngay.
                    </p>
                    {!isClientMode && onOpenBulkImport && (
                      <button
                        onClick={onOpenBulkImport}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-amber-600/20"
                      >
                        <ListPlus className="w-4 h-4" />
                        <span>+ Nhập danh sách Title ngay</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              videos.map((v) => {
                const statusMeta = getStatusBadge(v.status);
                const hasVideo = Boolean(v.driveVideoUrl || v.driveFileId);
                const hasNote = Boolean(v.clientFeedback?.notes && v.clientFeedback.notes.trim());

                return (
                  <tr key={v.id} className="hover:bg-[#fbf7ee] transition group">
                    {/* STT */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-stone-700">
                      <span className="inline-block w-8 h-7 leading-7 bg-[#f5ecda] text-stone-800 rounded-lg text-xs">
                        #{v.stt < 10 ? `0${v.stt}` : v.stt}
                      </span>
                    </td>

                    {/* Title & Caption */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-stone-800 line-clamp-2 text-sm leading-snug">
                        {v.title}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {v.driveFileName && (
                          <span className="text-[11px] font-mono text-amber-800 bg-[#fef9c3] px-1.5 py-0.5 rounded border border-[#fef08a] truncate max-w-xs">
                            📁 {v.driveFileName}
                          </span>
                        )}
                        {v.caption && (
                          <span className="text-xs text-stone-500 line-clamp-1 italic max-w-sm">
                            "{v.caption}"
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Date / Time */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-xs font-bold text-stone-800">
                        {v.scheduledDate || 'Chưa đặt'}
                      </div>
                      <div className="text-[11px] text-stone-400 font-mono">
                        {v.scheduledTime || '--:--'}
                      </div>
                    </td>

                    {/* Video Player Button */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {hasVideo ? (
                        <button
                          onClick={() => onPlayVideo(v)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fef3c7] text-[#92400e] hover:bg-amber-600 hover:text-white rounded-lg text-xs font-bold transition border border-[#fde68a] shadow-sm"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Xem video</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-stone-400 italic">
                          Chưa có file
                        </span>
                      )}
                    </td>

                    {/* Status Badge & Dropdown for Editor */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {!isClientMode ? (
                        <div className="relative inline-block text-left">
                          <select
                            value={v.status}
                            onChange={(e) =>
                              onQuickStatusChange(v.id, e.target.value as VideoStatus)
                            }
                            className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border appearance-none pr-6 cursor-pointer focus:outline-none transition ${statusMeta.bg}`}
                          >
                            <option value="not_started">⏳ Chưa làm</option>
                            <option value="uploaded_drive">📁 Đã up Drive</option>
                            <option value="scheduled_fb">⏰ Đã lên lịch</option>
                            <option value="published_fb">✅ Đã đăng FB</option>
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2 top-2.5 pointer-events-none opacity-60" />
                        </div>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusMeta.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                          {statusMeta.label}
                        </span>
                      )}
                    </td>

                    {/* Client Notes Column (ONLY NOTES) */}
                    <td className="py-3.5 px-4">
                      {hasNote ? (
                        <div
                          onClick={() => onOpenFeedback(v)}
                          className="p-2.5 bg-[#faf5eb] hover:bg-[#f5edd9] rounded-xl border border-[#eadecc] transition cursor-pointer space-y-1"
                        >
                          <p className="text-xs text-stone-800 line-clamp-2 leading-relaxed font-medium">
                            "{v.clientFeedback?.notes}"
                          </p>

                          {/* Editor Revised status badge if editor fixed it */}
                          {v.isRevised && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              <Check className="w-3 h-3" />
                              <span>Editor đã sửa video theo góp ý</span>
                            </div>
                          )}

                          {v.editorNotes && (
                            <p className="text-[11px] text-amber-800 font-semibold line-clamp-1">
                              ↳ Bạn: {v.editorNotes}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div>
                          {isClientMode ? (
                            <button
                              onClick={() => onOpenFeedback(v)}
                              className="text-xs text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 hover:underline"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>+ Thêm ghi chú</span>
                            </button>
                          ) : (
                            <span className="text-xs text-stone-400 italic">
                              Chưa có ghi chú
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {isClientMode ? (
                        <button
                          onClick={() => onOpenFeedback(v)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#f5ecda] hover:bg-[#ede0c8] text-stone-700 transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                          <span>Ghi chú</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onEditVideo(v)}
                          title="Sửa video hoặc thay file mới"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#f5ecda] hover:bg-[#fef3c7] text-stone-700 hover:text-amber-800 transition border border-[#e5dcce] hover:border-[#fde68a]"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Sửa / Đổi</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
