'use client';

import React from 'react';
import { FanPage } from '@/types';
import { Plus, ExternalLink, Globe } from 'lucide-react';

interface PageTabsProps {
  pages: (FanPage & { stats?: any })[];
  activePageId: string;
  onSelectPage: (id: string) => void;
  onAddPage: () => void;
  isClientMode: boolean;
}

export const PageTabs: React.FC<PageTabsProps> = ({
  pages,
  activePageId,
  onSelectPage,
  onAddPage,
  isClientMode,
}) => {
  return (
    <div className="flex items-center justify-between border-b border-[#eadecc] pb-3.5 gap-4 overflow-x-auto">
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
        {pages.map((p) => {
          const isActive = p.id === activePageId;
          return (
            <div
              key={p.id}
              className={`group relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer select-none whitespace-nowrap ${
                isActive
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25 ring-2 ring-amber-500 ring-offset-2 ring-offset-[#faf6ee]'
                  : 'bg-[#fffdfa] hover:bg-[#f8f2e6] text-stone-700 border border-[#eadecc]'
              }`}
              onClick={() => onSelectPage(p.id)}
            >
              <span className="text-base">{p.avatar || '📱'}</span>
              <span>{p.name}</span>

              {p.stats && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-amber-700 text-amber-100'
                      : 'bg-[#f3ebd9] text-stone-700'
                  }`}
                >
                  {p.stats.uploaded}/{p.stats.total} vid
                </span>
              )}

              {/* Quick Link Facebook on Tab */}
              {p.fbPageUrl && (
                <a
                  href={p.fbPageUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Mở Fanpage Facebook"
                  onClick={(e) => e.stopPropagation()}
                  className={`p-1 rounded-md transition ${
                    isActive
                      ? 'text-blue-200 hover:text-white hover:bg-blue-600'
                      : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                </a>
              )}

              {/* Quick Link Google Drive on Tab */}
              {p.driveFolderUrl && (
                <a
                  href={p.driveFolderUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Mở thư mục Google Drive"
                  onClick={(e) => e.stopPropagation()}
                  className={`p-1 rounded-md transition ${
                    isActive
                      ? 'text-amber-200 hover:text-white hover:bg-amber-700'
                      : 'text-stone-400 hover:text-amber-700 hover:bg-[#ede3d1]'
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          );
        })}

        {/* Add Page Button */}
        {!isClientMode && (
          <button
            onClick={onAddPage}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-amber-800 border-2 border-dashed border-[#dfd4c0] hover:border-amber-500 hover:text-amber-900 hover:bg-[#fbf4e6] transition whitespace-nowrap bg-[#fffdfa]/60"
          >
            <Plus className="w-4 h-4 text-amber-600" />
            <span>+ Thêm Page FB</span>
          </button>
        )}
      </div>
    </div>
  );
};
