import { NextResponse } from 'next/server';
import { dbGetPages, dbGetVideos, dbSaveVideo, getLocalDatabase } from '@/lib/storage';
import { fetchDriveFolderFiles, matchFileWithVideo } from '@/lib/drive';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pageId, manualFileList, apiKey } = body;

    if (!pageId) {
      return NextResponse.json({ success: false, error: "Thiếu pageId" }, { status: 400 });
    }

    const pages = await dbGetPages();
    const page = pages.find(p => p.id === pageId);
    if (!page) {
      return NextResponse.json({ success: false, error: "Không tìm thấy Page" }, { status: 404 });
    }

    const allVideos = await dbGetVideos(pageId);
    const db = getLocalDatabase();
    let filesToMatch: { name: string; id?: string; url?: string }[] = [];

    // METHOD A: From Google Drive API
    const effectiveApiKey = process.env.GOOGLE_DRIVE_API_KEY || apiKey || db.settings.googleApiKey;
    
    if (page.driveFolderId && effectiveApiKey) {
      const driveRes = await fetchDriveFolderFiles(page.driveFolderId, effectiveApiKey);
      if (driveRes.success && driveRes.files.length > 0) {
        filesToMatch = driveRes.files.map(f => ({
          name: f.name,
          id: f.id,
          url: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`
        }));
      } else if (!driveRes.success && (!manualFileList || !manualFileList.trim())) {
        return NextResponse.json({
          success: false,
          error: `Google Drive API báo lỗi: ${driveRes.error}. (Lưu ý: Thư mục Drive cần bật quyền "Bất kỳ ai có liên kết đều xem được")`
        }, { status: 400 });
      }
    }

    // METHOD B: From manual file list
    if (manualFileList && typeof manualFileList === 'string' && manualFileList.trim()) {
      const lines = manualFileList.split('\n').map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        const driveMatch = line.match(/(https:\/\/drive\.google\.com\/[^\s]+)/);
        const url = driveMatch ? driveMatch[1] : undefined;
        const name = line.replace(/(https:\/\/drive\.google\.com\/[^\s]+)/, '').trim() || line;
        
        filesToMatch.push({
          name: name,
          url: url,
        });
      }
    }

    if (filesToMatch.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Không tìm thấy file nào để đối soát. Hãy kiểm tra kết nối Google Drive hoặc dán danh sách tên file video vào ô Quét nhanh."
      }, { status: 400 });
    }

    // Auto-matching
    const matchedResults: { videoId: string; stt: number; title: string; fileName: string; url?: string }[] = [];

    for (const file of filesToMatch) {
      let bestMatch: { video: any; confidence: number } | null = null;

      for (const video of allVideos) {
        const matchResult = matchFileWithVideo(file.name, video.stt, video.title);
        if (matchResult.isMatch) {
          if (!bestMatch || matchResult.confidence > bestMatch.confidence) {
            bestMatch = { video, confidence: matchResult.confidence };
          }
        }
      }

      if (bestMatch) {
        const current = bestMatch.video;
        const updatedStatus = current.status === 'not_started' ? 'uploaded_drive' : current.status;
        const videoUrl = file.url || current.driveVideoUrl || (file.id ? `https://drive.google.com/file/d/${file.id}/view` : '');

        const updated = {
          ...current,
          status: updatedStatus,
          driveFileName: file.name,
          driveFileId: file.id || current.driveFileId,
          driveVideoUrl: videoUrl,
          driveUploadedAt: current.driveUploadedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await dbSaveVideo(updated);

        matchedResults.push({
          videoId: current.id,
          stt: current.stt,
          title: current.title,
          fileName: file.name,
          url: videoUrl
        });
      }
    }

    return NextResponse.json({
      success: true,
      scannedFilesCount: filesToMatch.length,
      matchedCount: matchedResults.length,
      matchedResults,
      message: `Đã quét ${filesToMatch.length} file, tự động nhận diện & cập nhật thành công ${matchedResults.length} video!`
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
