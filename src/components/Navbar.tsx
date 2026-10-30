'use client';

import React from 'react';
import { 
  Video, 
  Eye, 
  ShieldCheck, 
  Share2, 
  Settings as SettingsIcon, 
  CheckCircle2
} from 'lucide-react';

interface NavbarProps {
  isClientMode: boolean;
  onToggleMode: () => void;
  onOpenSettings: () => void;
  currentPageName?: string;
  currentPageId?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  isClientMode,
  onToggleMode,
  onOpenSettings,
  currentPageName,
  currentPageId
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyClientLink = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('role', 'client');
      if (currentPageId) url.searchParams.set('pageId', currentPageId);
      navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#fffdfa]/95 backdrop-blur-md border-b border-[#eadecc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-amber-600/20">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-800 text-lg tracking-tight">FB Video Hub</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-[#fef3c7] text-[#92400e] border border-[#fde68a]">
                  Drive Auto-Sync
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                Quản lý lịch đăng đa Page & Theo dõi đánh giá từ khách hàng
              </p>
            </div>
          </div>

          {/* Actions & Role Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Share link to client */}
            <button
              onClick={handleCopyClientLink}
              title="Sao chép link gửi khách hàng xem và đánh giá"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-[#e5dcce] bg-[#faf6ee] hover:bg-[#f3ece0] text-stone-700 transition shadow-sm"
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

            {/* Switch Mode Toggle Button */}
            <button
              onClick={onToggleMode}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                isClientMode 
                  ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                  : 'bg-stone-800 hover:bg-stone-900 text-amber-50'
              }`}
            >
              {isClientMode ? (
                <>
                  <Eye className="w-4 h-4 text-amber-200" />
                  <span>Đang xem: Khách hàng</span>
                  <span className="text-[10px] bg-black/25 px-1.5 py-0.5 rounded">Về Admin</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Chế độ: Editor (Admin)</span>
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Đổi góc nhìn</span>
                </>
              )}
            </button>

            {/* Settings Button (Admin only) */}
            {!isClientMode && (
              <button
                onClick={onOpenSettings}
                title="Cài đặt Google Drive API"
                className="p-2 text-stone-600 hover:text-stone-900 hover:bg-[#f3ece0] rounded-xl transition border border-transparent hover:border-[#e5dcce]"
              >
                <SettingsIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
