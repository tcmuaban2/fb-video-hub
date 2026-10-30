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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-4xl bg-stone-900 rounded-2xl shadow-2xl overflow-hidden border border-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-950/70">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg font-mono font-bold text-sm">
              #{stt < 10 ? `0${stt}` : stt}
            </span>
            <div>
              <h3 className="font-bold text-white text-base line-clamp-1">{videoTitle}</h3>
              {driveFileName && (
                <p className="text-xs text-stone-400 font-mono">{driveFileName}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {videoUrl && (
              <a
                href={videoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Mở Drive</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Area */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
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
            <div className="text-center p-8">
              <AlertCircle className="w-12 h-12 text-stone-500 mx-auto mb-3" />
              <p className="text-stone-300 font-bold mb-1">Chưa có link xem trước hoặc file chưa sẵn sàng</p>
              <p className="text-stone-500 text-xs max-w-sm mx-auto">
                Hãy kiểm tra quyền chia sẻ file trên Google Drive (đặt chế độ "Bất kỳ ai có liên kết đều có thể xem").
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
