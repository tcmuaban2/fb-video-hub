'use client';

import React from 'react';
import { X, ExternalLink, AlertCircle } from 'lucide-react';
import { extractDriveFileId } from '@/lib/drive';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle: string;
  stt: number;
  videoUrl?: string;
  driveFileName?: string;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  videoTitle,
  stt,
  videoUrl,
  driveFileName,
}) => {
  if (!isOpen) return null;

  const fileId = videoUrl ? extractDriveFileId(videoUrl) : null;
  const embedUrl = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/85 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[96vh] flex flex-col bg-stone-900 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-stone-800 bg-stone-950/80 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 mr-2">
            <span className="px-2 sm:px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg font-mono font-bold text-xs sm:text-sm shrink-0">
              #{stt < 10 ? `0${stt}` : stt}
            </span>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-xs sm:text-base truncate">{videoTitle}</h3>
              {driveFileName && (
                <p className="text-[11px] text-stone-400 font-mono truncate">{driveFileName}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {videoUrl && (
              <a
                href={videoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition active:scale-95"
              >
                <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">Drive</span>
              </a>
            )}
            <button
              onClick={onClose}
              aria-label="Đóng"
              className="p-1.5 sm:p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Area */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center flex-1 max-h-[75vh]">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
            />
          ) : videoUrl?.match(/\.(mp4|webm|ogg|mov)$/i) || videoUrl?.startsWith('http') ? (
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-full max-h-[70vh] object-contain"
            />
          ) : (
            <div className="text-center p-6 sm:p-8">
              <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-stone-500 mx-auto mb-3" />
              <p className="text-stone-300 font-bold text-xs sm:text-sm mb-1">
                Chưa có link xem trước hoặc file chưa sẵn sàng
              </p>
              <p className="text-stone-500 text-[11px] sm:text-xs max-w-sm mx-auto">
                Hãy kiểm tra quyền chia sẻ file trên Google Drive (đặt chế độ "Bất kỳ ai có liên kết đều có thể xem").
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
