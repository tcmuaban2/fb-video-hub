'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  LogOut, 
  ExternalLink,
  Share2,
  CheckCircle2,
  CloudLightning,
  ListPlus,
  RefreshCw,
  Search,
  Settings as SettingsIcon,
  Plus,
  FolderPlus,
  Globe,
  Edit3,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { FanPage, VideoItem, VideoStatus, ClientFeedback } from '@/types';
import { PageTabs } from '@/components/PageTabs';
import { StatsBar } from '@/components/StatsBar';
import { VideoTable } from '@/components/VideoTable';
import { BulkImportModal } from '@/components/BulkImportModal';
import { DriveSyncModal } from '@/components/DriveSyncModal';
import { VideoEditModal } from '@/components/VideoEditModal';
import { VideoPlayerModal } from '@/components/VideoPlayerModal';
import { ClientFeedbackModal } from '@/components/ClientFeedbackModal';
import { AddPageModal } from '@/components/AddPageModal';
import { EditPageModal } from '@/components/EditPageModal';
import { SettingsModal } from '@/components/SettingsModal';

function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Core Data
  const [pages, setPages] = useState<(FanPage & { stats?: any })[]>([]);
  const [activePageId, setActivePageId] = useState<string>('');
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto-sync status notification
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Filters
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isDriveSyncOpen, setIsDriveSyncOpen] = useState(false);
  const [isAddPageOpen, setIsAddPageOpen] = useState(false);
  const [isEditPageOpen, setIsEditPageOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Active items for modals
  const [playerVideo, setPlayerVideo] = useState<VideoItem | null>(null);
  const [editVideo, setEditVideo] = useState<VideoItem | null>(null);
  const [feedbackVideo, setFeedbackVideo] = useState<VideoItem | null>(null);

  // Check login state on mount
  useEffect(() => {
    const isLogged = localStorage.getItem('fb_hub_admin_logged');
    if (isLogged === 'true') {
      setIsAuthenticated(true);
      loadPages();
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('fb_hub_admin_logged', 'true');
        setIsAuthenticated(true);
        loadPages();
      } else {
        setLoginError(data.error || 'Mật khẩu không đúng');
      }
    } catch (err: any) {
      setLoginError('Lỗi kết nối máy chủ');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('fb_hub_admin_logged');
    setIsAuthenticated(false);
    setPassword('');
  };

  const loadPages = async () => {
    try {
      const res = await fetch('/api/pages');
      const data = await res.json();
      if (data.success && data.pages) {
        setPages(data.pages);
        if (data.pages.length === 0) {
          setActivePageId('');
          setVideos([]);
        } else if (!activePageId || !data.pages.some((p: any) => p.id === activePageId)) {
          setActivePageId(data.pages[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load pages', err);
    }
  };

  const loadVideos = async (pageId: string) => {
    if (!pageId) {
      setVideos([]);
      setLoading(false);
      return;
    }
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

  const handleDirectDriveScan = async (pageId: string, showToast = true) => {
    if (!pageId || isSyncing) return;
    try {
      setIsSyncing(true);
      const res = await fetch('/api/drive/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId }),
      });
      const data = await res.json();
      if (data.success) {
        if (showToast) {
          setSyncNotice({
            type: 'success',
            message: data.matchedCount > 0 
              ? `✓ Tự nhận diện thành công ${data.matchedCount} video mới trên Google Drive!` 
              : `✓ Đã quét ${data.scannedFilesCount} file trên Drive. Mọi video đã khớp!`
          });
          setTimeout(() => setSyncNotice(null), 4000);
        }
        loadVideos(pageId);
        loadPages();
      } else {
        if (showToast) {
          setSyncNotice({ type: 'error', message: data.error || 'Quét Drive thất bại' });
          setTimeout(() => setSyncNotice(null), 5000);
        }
      }
    } catch (err: any) {
      if (showToast) {
        setSyncNotice({ type: 'error', message: err.message || 'Lỗi kết nối' });
        setTimeout(() => setSyncNotice(null), 5000);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (activePageId && isAuthenticated) {
      loadVideos(activePageId);
      handleDirectDriveScan(activePageId, false);
    }
  }, [activePageId, isAuthenticated]);

  const activePage = pages.find((p) => p.id === activePageId);

  const handleQuickStatusChange = async (id: string, newStatus: VideoStatus) => {
    try {
      setVideos((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
      );
      await fetch('/api/videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      loadPages();
    } catch (err) {
      console.error(err);
      if (activePageId) loadVideos(activePageId);
    }
  };

  const handleSaveVideoEdit = async (updatedData: Partial<VideoItem>) => {
    if (!editVideo) return;
    try {
      const res = await fetch('/api/videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editVideo.id, ...updatedData }),
      });
      const data = await res.json();
      if (data.success) {
        setVideos((prev) =>
          prev.map((v) => (v.id === editVideo.id ? { ...v, ...data.video } : v))
        );
        loadPages();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    try {
      await fetch(`/api/videos?id=${id}`, { method: 'DELETE' });
      setVideos((prev) => prev.filter((v) => v.id !== id));
      loadPages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    try {
      await fetch(`/api/pages?id=${pageId}`, { method: 'DELETE' });
      loadPages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyClientLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
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

  // MÀN HÌNH ĐĂNG NHẬP MẬT KHẨU ADMIN
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf6ee] p-4 text-stone-900">
        <div className="w-full max-w-md bg-[#fffdfa] rounded-3xl border border-[#eadecc] shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-[#fef3c7] text-amber-700 flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-stone-800 tracking-tight">Khu Vực Quản Trị (Admin)</h2>
            <p className="text-xs text-stone-500">
              Vui lòng nhập mật khẩu quản trị để truy cập toàn bộ chức năng
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                Mật khẩu Admin
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mã bảo mật..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-3 text-sm border border-[#eadecc] bg-[#fffdfa] rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800 font-mono"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn || !password}
              className="w-full flex items-center justify-center gap-2 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold transition shadow-md shadow-amber-600/25 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <span>Đang kiểm tra...</span>
              ) : (
                <>
                  <span>Vào Trang Quản Trị</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-[#f0e8db] text-center">
            <a
              href="/"
              className="text-xs font-bold text-amber-800 hover:underline flex items-center justify-center gap-1"
            >
              <span>← Quay lại trang xem của Khách</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf6ee] text-stone-500">
        <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
      </div>
    );
  }

  // GIAO DIỆN QUẢN TRỊ ADMIN ĐÃ XÁC THỰC
  return (
    <div className="min-h-screen flex flex-col bg-[#faf6ee] text-stone-900 pb-16">
      {/* Admin Navbar */}
      <header className="sticky top-0 z-40 bg-[#fffdfa]/95 backdrop-blur-md border-b border-[#eadecc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-amber-600/20">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-stone-800 text-lg tracking-tight">FB Video Hub</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-amber-600 text-white shadow-sm">
                    ADMIN QUẢN TRỊ
                  </span>
                </div>
                <p className="text-xs text-stone-500 hidden sm:block">
                  Quản lý đa Page, quét Drive và xử lý ghi chú của khách
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Copy link sent to client */}
              <button
                onClick={handleCopyClientLink}
                title="Sao chép link web trang chủ gửi cho khách hàng xem"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-[#e5dcce] bg-[#faf6ee] hover:bg-[#f3ece0] text-stone-700 transition shadow-sm"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Đã chép link khách!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-amber-700" />
                    <span className="hidden sm:inline">Link gửi khách</span>
                  </>
                )}
              </button>

              {/* View as Client tab */}
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#f5ecda] hover:bg-[#ede0c8] text-stone-700 transition shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mở giao diện khách</span>
              </a>

              {/* Settings Button */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                title="Cài đặt hệ thống"
                className="p-2 text-stone-600 hover:text-stone-900 hover:bg-[#f3ece0] rounded-xl transition border border-transparent hover:border-[#e5dcce]"
              >
                <SettingsIcon className="w-4 h-4" />
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                title="Đăng xuất khỏi Admin"
                className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-200"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {syncNotice && (
          <div
            className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-lg animate-fade-in ${
              syncNotice.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-rose-600 text-white border-rose-500'
            }`}
          >
            <div className="flex items-center gap-2">
              {syncNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-200" />
              )}
              <span>{syncNotice.message}</span>
            </div>
            <button onClick={() => setSyncNotice(null)} className="text-white/80 hover:text-white">✕</button>
          </div>
        )}

        {/* Page Switcher Tabs */}
        {pages.length > 0 && (
          <PageTabs
            pages={pages}
            activePageId={activePageId}
            onSelectPage={(id) => setActivePageId(id)}
            onAddPage={() => setIsAddPageOpen(true)}
            isClientMode={false}
          />
        )}

        {/* Page Action Bar */}
        {pages.length === 0 ? (
          <div className="bg-[#fffdfa] rounded-3xl border-2 border-dashed border-[#e2d6c1] p-12 text-center max-w-xl mx-auto my-12 space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#fef3c7] text-amber-700 flex items-center justify-center mx-auto shadow-inner">
              <FolderPlus className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-stone-800">Chưa có Fanpage nào</h3>
              <p className="text-sm text-stone-500 mt-1 max-w-sm mx-auto">
                Tạo Fanpage đầu tiên để lên lịch đăng và quét video Drive.
              </p>
            </div>
            <button
              onClick={() => setIsAddPageOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 transition shadow-md shadow-amber-600/25"
            >
              <Plus className="w-5 h-5" />
              <span>Tạo Fanpage Đầu Tiên</span>
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fffdfa] p-4 rounded-2xl border border-[#eadecc] shadow-sm">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xl">{activePage?.avatar || '📱'}</span>
                  <h1 className="text-lg font-bold text-stone-800 tracking-tight">
                    {activePage?.name || 'Đang tải...'}
                  </h1>

                  <button
                    onClick={() => setIsEditPageOpen(true)}
                    title="Sửa thông tin hoặc đổi link Page"
                    className="p-1.5 text-stone-500 hover:text-amber-800 hover:bg-[#f5ecda] rounded-lg transition border border-[#eadecc]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {activePage?.fbPageUrl ? (
                    <a
                      href={activePage.fbPageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm"
                    >
                      <Globe className="w-3.5 h-3.5 text-white" />
                      <span>Truy cập Page Facebook</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>
                  ) : (
                    <button
                      onClick={() => setIsEditPageOpen(true)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-600" />
                      <span>+ Gắn Link Fanpage Facebook</span>
                    </button>
                  )}

                  {activePage?.driveFolderUrl ? (
                    <a
                      href={activePage.driveFolderUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-amber-800 bg-[#fef3c7] hover:bg-[#fde68a] border border-[#fde68a] transition shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
                      <span>Mở Google Drive</span>
                    </a>
                  ) : null}
                </div>

                <p className="text-xs text-stone-500 mt-1.5">
                  {activePage?.description || 'Quản lý lịch bài, tự động quét Drive và xử lý ghi chú của khách.'}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 w-full md:w-auto">
                <button
                  onClick={() => handleDirectDriveScan(activePageId, true)}
                  disabled={isSyncing}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold text-amber-900 bg-[#fef3c7] hover:bg-[#fde68a] border border-[#fde68a] transition shadow-sm disabled:opacity-50 min-h-[38px] active:scale-95"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="w-4 h-4 text-amber-700 animate-spin" />
                      <span>Đang quét...</span>
                    </>
                  ) : (
                    <>
                      <CloudLightning className="w-4 h-4 text-amber-700" />
                      <span>⚡ Quét Drive</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setIsBulkOpen(true)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition shadow-md shadow-amber-600/20 min-h-[38px] active:scale-95"
                >
                  <ListPlus className="w-4 h-4" />
                  <span>+ Thêm Title</span>
                </button>

                <button
                  onClick={() => {
                    loadPages();
                    if (activePageId) {
                      loadVideos(activePageId);
                      handleDirectDriveScan(activePageId, true);
                    }
                  }}
                  title="Làm mới"
                  className="p-2 text-stone-600 hover:text-stone-900 hover:bg-[#f5ecda] rounded-xl transition border border-[#eadecc] min-w-[38px] min-h-[38px] flex items-center justify-center"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

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

            {/* Video Table for Admin */}
            <VideoTable
              videos={filteredVideos}
              isClientMode={false}
              onPlayVideo={(v) => setPlayerVideo(v)}
              onEditVideo={(v) => setEditVideo(v)}
              onOpenFeedback={(v) => setFeedbackVideo(v)}
              onQuickStatusChange={handleQuickStatusChange}
              onOpenBulkImport={() => setIsBulkOpen(true)}
            />
          </>
        )}
      </main>

      {/* MODALS */}
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
          onSaveFeedback={async (feedback) => {
            await fetch('/api/feedback', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ videoId: feedbackVideo.id, ...feedback }),
            });
            if (activePageId) loadVideos(activePageId);
            loadPages();
          }}
        />
      )}

      {editVideo && (
        <VideoEditModal
          isOpen={Boolean(editVideo)}
          onClose={() => setEditVideo(null)}
          video={editVideo}
          onSave={handleSaveVideoEdit}
          onDelete={handleDeleteVideo}
        />
      )}

      <BulkImportModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        pageId={activePageId}
        pageName={activePage?.name || ''}
        onSuccess={() => {
          if (activePageId) loadVideos(activePageId);
          loadPages();
        }}
      />

      <DriveSyncModal
        isOpen={isDriveSyncOpen}
        onClose={() => setIsDriveSyncOpen(false)}
        pageId={activePageId}
        pageName={activePage?.name || ''}
        folderUrl={activePage?.driveFolderUrl}
        onSuccess={() => {
          if (activePageId) loadVideos(activePageId);
          loadPages();
        }}
      />

      <AddPageModal
        isOpen={isAddPageOpen}
        onClose={() => setIsAddPageOpen(false)}
        onSuccess={() => {
          loadPages();
        }}
      />

      {activePage && (
        <EditPageModal
          isOpen={isEditPageOpen}
          onClose={() => setIsEditPageOpen(false)}
          page={activePage}
          onSuccess={() => {
            loadPages();
          }}
          onDeletePage={handleDeletePage}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-stone-500">Đang khởi tạo trang Quản Trị...</div>}>
      <AdminDashboard />
    </Suspense>
  );
}

