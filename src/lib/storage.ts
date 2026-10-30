import fs from 'fs';
import path from 'path';
import { DatabaseSchema, FanPage, VideoItem } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

const INITIAL_DATA: DatabaseSchema = {
  settings: {
    appName: "FB Multi-Page Video Manager & Drive Sync",
    googleApiKey: ""
  },
  pages: [],
  videos: []
};

// ==================== LOCAL FILE STORAGE FALLBACK ====================
export function getLocalDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
      return INITIAL_DATA;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content) as DatabaseSchema;
  } catch (error) {
    console.error("Error reading local database:", error);
    return INITIAL_DATA;
  }
}

export function saveLocalDatabase(data: DatabaseSchema): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error("Error saving local database:", error);
    return false;
  }
}

// Backward compatible sync functions
export function getDatabase(): DatabaseSchema {
  return getLocalDatabase();
}

export function saveDatabase(data: DatabaseSchema): boolean {
  return saveLocalDatabase(data);
}

// ==================== HYBRID CLOUD / LOCAL SERVICES ====================

// --- PAGES ---
export async function dbGetPages(): Promise<FanPage[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      return data.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        avatar: p.avatar,
        fbPageUrl: p.fb_page_url,
        driveFolderId: p.drive_folder_id,
        driveFolderUrl: p.drive_folder_url,
        description: p.description,
        createdAt: p.created_at,
      }));
    }
  }
  return getLocalDatabase().pages;
}

export async function dbSavePage(page: FanPage): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('pages').upsert({
      id: page.id,
      name: page.name,
      slug: page.slug,
      avatar: page.avatar,
      fb_page_url: page.fbPageUrl,
      drive_folder_id: page.driveFolderId,
      drive_folder_url: page.driveFolderUrl,
      description: page.description,
      created_at: page.createdAt,
    });
    if (error) console.error("Supabase savePage error:", error);
  }

  // Also sync locally
  const db = getLocalDatabase();
  const index = db.pages.findIndex(p => p.id === page.id);
  if (index !== -1) {
    db.pages[index] = page;
  } else {
    db.pages.push(page);
  }
  saveLocalDatabase(db);
  return true;
}

export async function dbDeletePage(pageId: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    await supabase.from('pages').delete().eq('id', pageId);
    await supabase.from('videos').delete().eq('page_id', pageId);
  }

  const db = getLocalDatabase();
  db.pages = db.pages.filter(p => p.id !== pageId);
  db.videos = db.videos.filter(v => v.pageId !== pageId);
  saveLocalDatabase(db);
  return true;
}

// --- VIDEOS ---
export async function dbGetVideos(pageId?: string, status?: string, search?: string): Promise<VideoItem[]> {
  if (isSupabaseConfigured && supabase) {
    let query = supabase.from('videos').select('*').order('stt', { ascending: true });
    if (pageId) query = query.eq('page_id', pageId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (!error && data) {
      let result: VideoItem[] = data.map((v: any) => ({
        id: v.id,
        pageId: v.page_id,
        stt: v.stt,
        title: v.title,
        caption: v.caption,
        scheduledDate: v.scheduled_date,
        scheduledTime: v.scheduled_time,
        status: v.status,
        driveFileId: v.drive_file_id,
        driveVideoUrl: v.drive_video_url,
        driveFileName: v.drive_file_name,
        driveFileSize: v.drive_file_size,
        driveUploadedAt: v.drive_uploaded_at,
        clientFeedback: v.client_feedback,
        editorNotes: v.editor_notes,
        isRevised: v.is_revised,
        revisedAt: v.revised_at,
        createdAt: v.created_at,
        updatedAt: v.updated_at,
      }));

      if (search) {
        const q = search.toLowerCase();
        result = result.filter(v => 
          v.title.toLowerCase().includes(q) || 
          v.caption?.toLowerCase().includes(q) || 
          v.stt.toString() === q
        );
      }
      return result;
    }
  }

  // Local fallback
  const db = getLocalDatabase();
  let filtered = [...db.videos];
  if (pageId) filtered = filtered.filter(v => v.pageId === pageId);
  if (status) filtered = filtered.filter(v => v.status === status);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(v => 
      v.title.toLowerCase().includes(q) || 
      v.caption?.toLowerCase().includes(q) || 
      v.stt.toString() === q
    );
  }
  filtered.sort((a, b) => a.stt - b.stt);
  return filtered;
}

export async function dbSaveVideo(video: VideoItem): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('videos').upsert({
      id: video.id,
      page_id: video.pageId,
      stt: video.stt,
      title: video.title,
      caption: video.caption,
      scheduled_date: video.scheduledDate,
      scheduled_time: video.scheduledTime,
      status: video.status,
      drive_file_id: video.driveFileId,
      drive_video_url: video.driveVideoUrl,
      drive_file_name: video.driveFileName,
      drive_file_size: video.driveFileSize,
      drive_uploaded_at: video.driveUploadedAt,
      client_feedback: video.clientFeedback,
      editor_notes: video.editorNotes,
      is_revised: video.isRevised,
      revised_at: video.revisedAt,
      created_at: video.createdAt,
      updated_at: video.updatedAt,
    });
    if (error) console.error("Supabase saveVideo error:", error);
  }

  const db = getLocalDatabase();
  const index = db.videos.findIndex(v => v.id === video.id);
  if (index !== -1) {
    db.videos[index] = video;
  } else {
    db.videos.push(video);
  }
  saveLocalDatabase(db);
  return true;
}

export async function dbSaveBulkVideos(videos: VideoItem[]): Promise<boolean> {
  if (isSupabaseConfigured && supabase && videos.length > 0) {
    const records = videos.map(v => ({
      id: v.id,
      page_id: v.pageId,
      stt: v.stt,
      title: v.title,
      caption: v.caption,
      scheduled_date: v.scheduledDate,
      scheduled_time: v.scheduledTime,
      status: v.status,
      drive_file_id: v.driveFileId,
      drive_video_url: v.driveVideoUrl,
      drive_file_name: v.driveFileName,
      drive_file_size: v.driveFileSize,
      drive_uploaded_at: v.driveUploadedAt,
      client_feedback: v.clientFeedback,
      editor_notes: v.editorNotes,
      is_revised: v.isRevised,
      revised_at: v.revisedAt,
      created_at: v.createdAt,
      updated_at: v.updatedAt,
    }));
    await supabase.from('videos').upsert(records);
  }

  const db = getLocalDatabase();
  db.videos.push(...videos);
  saveLocalDatabase(db);
  return true;
}

export async function dbDeleteVideo(videoId: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    await supabase.from('videos').delete().eq('id', videoId);
  }
  const db = getLocalDatabase();
  db.videos = db.videos.filter(v => v.id !== videoId);
  saveLocalDatabase(db);
  return true;
}
