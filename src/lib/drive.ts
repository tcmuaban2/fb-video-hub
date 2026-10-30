export function extractDriveFolderId(input: string): string {
  if (!input) return "";
  const trimmed = input.trim();
  // If it's already an ID (no slashes)
  if (!trimmed.includes("/") && !trimmed.includes(".")) {
    return trimmed;
  }
  // Try matching /folders/{id}
  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch && folderMatch[1]) {
    return folderMatch[1];
  }
  // Try matching id={id}
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) {
    return idMatch[1];
  }
  return trimmed;
}

export function extractDriveFileId(input: string): string {
  if (!input) return "";
  const trimmed = input.trim();
  if (!trimmed.includes("/") && !trimmed.includes(".")) {
    return trimmed;
  }
  const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch && fileMatch[1]) {
    return fileMatch[1];
  }
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) {
    return idMatch[1];
  }
  return trimmed;
}

export function matchFileWithVideo(
  fileName: string, 
  stt: number, 
  title: string
): { isMatch: boolean; confidence: number } {
  const cleanFileName = fileName.toLowerCase().replace(/[\-_]/g, ' ').trim();
  const cleanTitle = title.toLowerCase().replace(/[\-_]/g, ' ').trim();
  
  // Format stt: "1", "01", "001"
  const sttStr = stt.toString();
  const sttPad = stt < 10 ? `0${stt}` : `${stt}`;

  // Check STT patterns: "01", " 01 ", "stt 01", "video 01", "[01]"
  const sttPatterns = [
    new RegExp(`\\b${sttPad}\\b`),
    new RegExp(`\\b${sttStr}\\b`),
    new RegExp(`^${sttPad}[^0-9]`),
    new RegExp(`^${sttStr}[^0-9]`),
    new RegExp(`\\[${sttPad}\\]`),
    new RegExp(`\\[${sttStr}\\]`),
  ];

  const hasSttMatch = sttPatterns.some(pattern => pattern.test(cleanFileName));

  // Check title similarity: at least 3 consecutive words or key keywords
  const titleWords = cleanTitle.split(/\s+/).filter(w => w.length > 2);
  let matchedWords = 0;
  for (const word of titleWords) {
    if (cleanFileName.includes(word)) {
      matchedWords++;
    }
  }

  const titleMatchRatio = titleWords.length > 0 ? matchedWords / titleWords.length : 0;

  if (hasSttMatch && titleMatchRatio > 0.3) {
    return { isMatch: true, confidence: 0.95 };
  }

  if (hasSttMatch) {
    return { isMatch: true, confidence: 0.85 };
  }

  if (titleMatchRatio > 0.6) {
    return { isMatch: true, confidence: 0.75 };
  }

  return { isMatch: false, confidence: 0 };
}

export interface DriveFileInfo {
  id: string;
  name: string;
  mimeType?: string;
  size?: string;
  webViewLink?: string;
  webContentLink?: string;
  createdTime?: string;
}

/**
 * Scan Google Drive Folder via official Google Drive API if apiKey provided,
 * or fallback simulation/mock parsing.
 */
export async function fetchDriveFolderFiles(
  folderId: string, 
  apiKey?: string
): Promise<{ success: boolean; files: DriveFileInfo[]; error?: string }> {
  if (!folderId) {
    return { success: false, files: [], error: "Chưa cấu hình Folder ID" };
  }

  const cleanFolderId = extractDriveFolderId(folderId);

  if (apiKey) {
    try {
      const query = encodeURIComponent(`'${cleanFolderId}' in parents and trashed = false`);
      const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,size,webViewLink,createdTime)&key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.error) {
        return { success: false, files: [], error: data.error.message || "Lỗi Google Drive API" };
      }

      const files: DriveFileInfo[] = (data.files || []).map((f: any) => ({
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        size: f.size ? `${(parseInt(f.size) / (1024 * 1024)).toFixed(1)} MB` : undefined,
        webViewLink: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`,
        createdTime: f.createdTime
      }));

      return { success: true, files };
    } catch (err: any) {
      return { success: false, files: [], error: err.message || "Không thể kết nối Google Drive" };
    }
  }

  // Without direct API key, return mock preview or prompt for API key / manual paste
  return { 
    success: false, 
    files: [], 
    error: "Chưa nhập Google Drive API Key. Bạn có thể dán API Key trong Cài Đặt hoặc dán danh sách file / link trực tiếp." 
  };
}

