'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  RefreshCw,
  ExternalLink,
  Globe,
  Lock,
  Clock,
  Video
} from 'lucide-react';
import { FanPage, VideoItem } from '@/types';
import { PageTabs } from '@/components/PageTabs';
import { StatsBar } from '@/components/StatsBar';
import { VideoTable } from '@/components/VideoTable';
import { VideoPlayerModal } from '@/components/VideoPlayerModal';
import { ClientFeedbackModal } from '@/components/ClientFeedbackModal';

function ClientDashboard() {
  const searchParams = useSearchParams();
  const targetPageId = searchParams.get('pageId');

  // Core Data
  const [pages, setPages] = useState<(FanPage & { stats?: any })[]>([]);
  const [activePageId, setActivePageId] = useState<string>('');
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Active items for modals
  const [playerVideo, setPlayerVideo] = useState<VideoItem | null>(null);
  const [feedbackVideo, setFeedbackVideo] = useState<VideoItem | null>(null);

  const loadPages = async () => {
    try {
      const res = await fetch('/api/pages');
      const data = await res.json();
      if (data.success && data.pages) {
        setPages(data.pages);
        if (data.pages.length > 0) {
          if (targetPageId && data.pages.some((p: any) => p.id === targetPageId)) {
            setActivePageId(targetPageId);
          } else if (!activePageId || !data.pages.some((p: any) => p.id === activePageId)) {
            setActivePageId(data.pages[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load pages', err);
    }
  };

  const loadVideos = async (pageId: string) => {
    if (!pageId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/videos?pageId=${pageId}`);
      const data = await res.json();
      if (data.success && data.videos) {
        setVideos(data.videos);
      }
    } catch (err) {
      console.error('Failed to load videos', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    if (activePageId) {
      loadVideos(activePageId);
    }
  }, [activePageId]);

  const activePage = pages.find((p) => p.id === activePageId);

  const handleSaveFeedback = async (feedback: any) => {
    if (!feedbackVideo) return;
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: feedbackVideo.id,
          ...feedback,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setVideos((prev) =>
          prev.map((v) =>
            v.id === feedbackVideo.id
              ? { ...v, clientFeedback: data.video.clientFeedback }
              : v
          )
        );
        loadPages();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredVideos = videos.filter((v) => {
    if (activeFilter === 'has_feedback') {
      if (!v.clientFeedback?.notes || !v.clientFeedback.notes.trim()) return false;
    } else if (activeFilter !== 'all' && v.status !== activeFilter) {
      return false;
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = v.title.toLowerCase().includes(q);
      const matchStt = v.stt.toString() === q;
      const matchCaption = v.caption?.toLowerCase().includes(q);
      if (!matchTitle && !matchStt && !matchCaption) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#faf6ee] text-stone-900 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#fffdfa]/95 backdrop-blur-md border-b border-[#eadecc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-amber-600/20">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-stone-800 text-lg tracking-tight">
                  FB Video Hub
                </span>
                <p className="text-xs text-stone-500 hidden sm:block">
                  Bảng theo dõi tiến độ sản xuất video & nhận xét
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {activePage?.fbPageUrl && (
                <a
                  href={activePage.fbPageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Truy cập Page FB</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              )}

              <button
                onClick={() => {
                  loadPages();
                  if (activePageId) loadVideos(activePageId);
                }}
                title="Làm mới"
                className="p-2 text-stone-600 hover:text-stone-900 hover:bg-[#f5ecda] rounded-xl transition border border-[#eadecc]"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Banner Chào Mừng Cho Khách */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-stone-800 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👋</span>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                <span>Bảng Theo Dõi Video - {activePage?.name || 'Fanpage'}</span>
              </h2>
              <p className="text-xs sm:text-sm text-amber-100 mt-0.5">
                Bạn có thể bấm <strong>"Xem video"</strong> trực tiếp và bấm <strong>"Ghi chú"</strong> để gửi nhận xét cho Editor.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            {activePage?.fbPageUrl && (
              <a
                href={activePage.fbPageUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-900/30 whitespace-nowrap"
              >
                <Globe className="w-4 h-4" />
                <span>Xem Fanpage Facebook</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
            )}
          </div>
        </div>

        {/* Page Switcher Tabs (Xem danh sách các Page nếu có nhiều page) */}
        {pages.length > 1 && (
          <PageTabs
            pages={pages}
            activePageId={activePageId}
            onSelectPage={(id) => setActivePageId(id)}
            onAddPage={() => {}}
            isClientMode={true}
          />
        )}

        {/* Stats Bar */}
        <StatsBar
          videos={videos}
          activeFilter={activeFilter}
          onFilterChange={(f) => setActiveFilter(f)}
        />

        {/* Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm theo STT hoặc tiêu đề..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#fffdfa] border border-[#eadecc] rounded-xl focus:ring-2 focus:ring-amber-500 outline-none shadow-sm text-stone-800"
            />
          </div>

          <div className="text-xs text-stone-500 font-semibold">
            Hiển thị <strong>{filteredVideos.length}</strong> / {videos.length} video
          </div>
        </div>

        {/* Video Table (Chế độ Khách) */}
        <VideoTable
          videos={filteredVideos}
          isClientMode={true}
          onPlayVideo={(v) => setPlayerVideo(v)}
          onEditVideo={() => {}}
          onOpenFeedback={(v) => setFeedbackVideo(v)}
          onQuickStatusChange={() => {}}
        />
      </main>

      {/* Footer kín đáo để vào Admin */}
      <footer className="mt-16 py-6 text-center text-xs text-stone-400 border-t border-[#ede5d6]">
        <p>Hệ thống theo dõi lịch phát video Fanpage Facebook</p>
        <a
          href="/admin"
          className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 text-stone-500 hover:text-amber-800 hover:bg-[#f5ecda] rounded-lg transition font-medium text-[11px]"
        >
          <Lock className="w-3 h-3" />
          <span>Khu vực Quản trị (Admin)</span>
        </a>
      </footer>

      {/* Modals */}
      {playerVideo && (
        <VideoPlayerModal
          isOpen={Boolean(playerVideo)}
          onClose={() => setPlayerVideo(null)}
          videoTitle={playerVideo.title}
          stt={playerVideo.stt}
          videoUrl={playerVideo.driveVideoUrl}
          driveFileName={playerVideo.driveFileName}
        />
      )}

      {feedbackVideo && (
        <ClientFeedbackModal
          isOpen={Boolean(feedbackVideo)}
          onClose={() => setFeedbackVideo(null)}
          video={feedbackVideo}
          onSaveFeedback={handleSaveFeedback}
        />
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-stone-500">Đang khởi tạo trang...</div>}>
      <ClientDashboard />
    </Suspense>
  );
}
