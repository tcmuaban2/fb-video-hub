'use client';

import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  FolderCheck, 
  MessageSquare, 
  AlertCircle 
} from 'lucide-react';
import { VideoItem } from '@/types';

interface StatsBarProps {
  videos: VideoItem[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  videos,
  activeFilter,
  onFilterChange,
}) => {
  const total = videos.length;
  const notStarted = videos.filter((v) => v.status === 'not_started').length;
  const uploaded = videos.filter((v) => v.status === 'uploaded_drive').length;
  const scheduled = videos.filter((v) => v.status === 'scheduled_fb').length;
  const published = videos.filter((v) => v.status === 'published_fb').length;
  const hasFeedback = videos.filter(
    (v) => v.clientFeedback?.notes && v.clientFeedback.notes.trim().length > 0
  ).length;

  const items = [
    {
      id: 'all',
      label: 'Tất cả bài',
      count: total,
      color: 'bg-[#fffdfa] text-stone-800 border-[#eadecc]',
      activeColor: 'bg-stone-800 text-amber-50 ring-2 ring-stone-800',
      icon: Clock,
    },
    {
      id: 'not_started',
      label: 'Chưa làm',
      count: notStarted,
      color: 'bg-[#fffbeb] text-amber-800 border-[#fef3c7]',
      activeColor: 'bg-amber-600 text-white ring-2 ring-amber-600',
      icon: AlertCircle,
    },
    {
      id: 'uploaded_drive',
      label: 'Đã up Drive',
      count: uploaded,
      color: 'bg-[#fef9c3]/50 text-amber-900 border-[#fef08a]',
      activeColor: 'bg-[#d97706] text-white ring-2 ring-[#d97706]',
      icon: FolderCheck,
    },
    {
      id: 'scheduled_fb',
      label: 'Đã lên lịch',
      count: scheduled,
      color: 'bg-[#faf5ff] text-purple-800 border-[#f3e8ff]',
      activeColor: 'bg-purple-700 text-white ring-2 ring-purple-700',
      icon: Clock,
    },
    {
      id: 'published_fb',
      label: 'Đã đăng FB',
      count: published,
      color: 'bg-[#f0fdf4] text-emerald-800 border-[#dcfce7]',
      activeColor: 'bg-emerald-700 text-white ring-2 ring-emerald-700',
      icon: CheckCircle,
    },
    {
      id: 'has_feedback',
      label: 'Có ghi chú',
      count: hasFeedback,
      color: 'bg-[#fff1f2] text-rose-800 border-[#ffe4e6]',
      activeColor: 'bg-rose-600 text-white ring-2 ring-rose-600',
      icon: MessageSquare,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeFilter === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onFilterChange(item.id)}
            className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition shadow-sm ${
              isActive
                ? item.activeColor
                : `${item.color} hover:bg-opacity-90`
            }`}
          >
            <div>
              <div className="text-xs font-semibold opacity-75">{item.label}</div>
              <div className="text-xl font-extrabold mt-0.5">{item.count}</div>
            </div>
            <Icon className="w-5 h-5 opacity-60" />
          </button>
        );
      })}
    </div>
  );
};
