'use client';

import React, { useState } from 'react';
import { X, Save, Trash2, Edit3, Link as LinkIcon, Globe } from 'lucide-react';
import { FanPage } from '@/types';

interface EditPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  page: FanPage;
  onSuccess: () => void;
  onDeletePage?: (id: string) => void;
}

export const EditPageModal: React.FC<EditPageModalProps> = ({
  isOpen,
  onClose,
  page,
  onSuccess,
  onDeletePage,
}) => {
  const [name, setName] = useState(page.name);
  const [avatar, setAvatar] = useState(page.avatar || '📱');
  const [fbPageUrl, setFbPageUrl] = useState(page.fbPageUrl || '');
  const [driveFolderUrl, setDriveFolderUrl] = useState(page.driveFolderUrl || '');
  const [description, setDescription] = useState(page.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên Page');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: page.id,
          name: name.trim(),
          avatar,
          fbPageUrl: fbPageUrl.trim(),
          driveFolderUrl: driveFolderUrl.trim(),
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Cập nhật Page thất bại');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi cập nhật Page');
    } finally {
      setLoading(false);
    }
  };

  const EMOJI_OPTIONS = ['📱', '🔥', '🏠', '🎬', '👗', '🍔', '✈️', '🎮', '🚗', '💰', '💼', '⚽'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/65 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-md max-h-[92vh] flex flex-col bg-[#fffdfa] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-[#eadecc]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#f0e8db] bg-[#faf5ec] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#fef3c7] text-amber-700 flex items-center justify-center shrink-0">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-800 text-sm sm:text-base">Cập Nhật Thông Tin Page</h3>
              <p className="text-xs text-stone-500">Chỉnh sửa link Fanpage FB, Drive hoặc đổi tên</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-[#ede5d6] transition min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {error}
            </div>
          )}

          {/* Emoji Avatar Picker */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Icon đại diện cho Page
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setAvatar(emoji)}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition ${
                    avatar === emoji
                      ? 'bg-amber-600 text-white shadow-md scale-105 ring-2 ring-amber-500 ring-offset-2 ring-offset-[#fffdfa]'
                      : 'bg-[#f7f0e3] hover:bg-[#ede3d1] text-stone-800'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Tên Fanpage</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-[#eadecc] bg-[#fffdfa] rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800"
              required
            />
          </div>

          {/* Facebook Page URL */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              Link Fanpage Facebook (để truy cập nhanh)
            </label>
            <input
              type="url"
              placeholder="https://facebook.com/tenpage... hoặc fb.com/..."
              value={fbPageUrl}
              onChange={(e) => setFbPageUrl(e.target.value)}
              className="w-full px-3.5 py-2 font-mono text-xs border border-[#eadecc] bg-[#fffdfa] rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800"
            />
          </div>

          {/* Drive Folder URL */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-amber-700" />
              Link Thư mục Google Drive
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/drive/folders/xxx"
              value={driveFolderUrl}
              onChange={(e) => setDriveFolderUrl(e.target.value)}
              className="w-full px-3.5 py-2 font-mono text-xs border border-[#eadecc] bg-[#fffdfa] rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Ghi chú / Mô tả kênh</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-[#eadecc] bg-[#fffdfa] rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-stone-800"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#f0e8db]">
            {onDeletePage ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Bạn có chắc muốn xóa Page "${page.name}" và toàn bộ video của Page này?`)) {
                    onDeletePage(page.id);
                    onClose();
                  }
                }}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                title="Xóa Page này"
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
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition shadow-md shadow-amber-600/20 disabled:opacity-50"
              >
                {loading ? (
                  <span>Đang lưu...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Lưu thay đổi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

