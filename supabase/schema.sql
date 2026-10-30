-- CÂU LỆNH TẠO BẢNG CHO SUPABASE DATABASE
-- Chỉ cần copy toàn bộ đoạn này dán vào SQL Editor trên Supabase và bấm RUN

-- 1. Bảng FanPages
CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT,
  avatar TEXT DEFAULT '📱',
  fb_page_url TEXT,
  drive_folder_id TEXT,
  drive_folder_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bảng Videos
CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  page_id TEXT REFERENCES pages(id) ON DELETE CASCADE,
  stt INTEGER NOT NULL,
  title TEXT NOT NULL,
  caption TEXT,
  scheduled_date DATE,
  scheduled_time TEXT,
  status TEXT DEFAULT 'not_started',
  drive_file_id TEXT,
  drive_video_url TEXT,
  drive_file_name TEXT,
  drive_file_size TEXT,
  drive_uploaded_at TIMESTAMPTZ,
  client_feedback JSONB,
  editor_notes TEXT,
  is_revised BOOLEAN DEFAULT FALSE,
  revised_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bảng Cài đặt hệ thống
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Tắt Row Level Security (RLS) để API Server truy cập trơn tru
ALTER TABLE pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

