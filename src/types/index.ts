export type VideoStatus = 'not_started' | 'uploaded_drive' | 'scheduled_fb' | 'published_fb';

export type ClientReaction = 'seen' | 'approved' | 'suggest_edit' | 'alert';

export interface ClientFeedback {
  rating?: number; // 1 to 5 stars
  feeling?: 'love' | 'good' | 'need_edit' | 'alert';
  notes?: string;
  reviewerName?: string;
  reaction?: ClientReaction;
  updatedAt?: string;
}

export interface VideoItem {
  id: string;
  pageId: string;
  stt: number;
  title: string;
  caption?: string;
  scheduledDate?: string; // YYYY-MM-DD
  scheduledTime?: string; // HH:mm
  status: VideoStatus;
  
  // Google Drive info
  driveFileId?: string;
  driveVideoUrl?: string;
  driveFileName?: string;
  driveFileSize?: string;
  driveUploadedAt?: string;

  // Review & Feedback
  clientFeedback?: ClientFeedback;
  editorNotes?: string;
  isRevised?: boolean; // Editor has updated/fixed the video based on feedback
  revisedAt?: string;

  createdAt: string;
  updatedAt: string;
}

export interface FanPage {
  id: string;
  name: string;
  slug: string;
  avatar?: string;
  fbPageUrl?: string; // Link trực tiếp tới Fanpage Facebook
  driveFolderId?: string;
  driveFolderUrl?: string;
  description?: string;
  totalVideos?: number;
  createdAt: string;
}

export interface DatabaseSchema {
  pages: FanPage[];
  videos: VideoItem[];
  settings: {
    googleApiKey?: string;
    appName?: string;
  };
}
