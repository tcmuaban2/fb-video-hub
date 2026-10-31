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
    let driveApiScanned = false;

    // METHOD A: From Google Drive API
    const effectiveApiKey = process.env.GOOGLE_DRIVE_API_KEY || apiKey || db.settings.googleApiKey;
    
    if (page.driveFolderId && effectiveApiKey) {
      const driveRes = await fetchDriveFolderFiles(page.driveFolderId, effectiveApiKey);
      if (driveRes.success) {
        driveApiScanned = true;
        if (driveRes.files && driveRes.files.length > 0) {
          filesToMatch = driveRes.files.map(f => ({
            name: f.name,
            id: f.id,
            url: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`
          }));
        }
      } else if (!manualFileList || !manualFileList.trim()) {
        return NextResponse.json({
          success: false,
          error: `Google Drive API báo lỗi: ${driveRes.error}. (Lưu ý: Thư mục Drive cần bật quyền "Bất kỳ ai có liên kết đều xem được")`
        }, { status: 400 });
      }
    }

    // METHOD B: From manual file list (if provided)
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

    // REAL-TIME RECONCILIATION:
    // If no files were found in the folder
    if (filesToMatch.length === 0) {
      // Reconcile: If folder is empty, clear old drive links from videos on this page
      let clearedCount = 0;
      for (const video of allVideos) {
        if (video.driveFileName || video.driveFileId || video.driveVideoUrl) {
          const resetStatus = video.status === 'uploaded_drive' ? 'not_started' : video.status;
          await dbSaveVideo({
            ...video,
            driveFileName: undefined,
            driveFileId: undefined,
            driveVideoUrl: undefined,
            driveUploadedAt: undefined,
            status: resetStatus,
            updatedAt: new Date().toISOString()
          });
          clearedCount++;
        }
      }

      return NextResponse.json({
        success: true,
        scannedFilesCount: 0,
        matchedCount: 0,
        message: driveApiScanned 
          ? `Thư mục Drive hiện đang trống (0 file video). Đã đồng bộ trạng thái: các video hiển thị Chưa có file trên Drive.`
          : `Không tìm thấy file nào trong danh sách quét.`
      });
    }

    // When files exist in the folder: match and reconcile
    const matchedResults: { videoId: string; stt: number; title: string; fileName: string; url?: string }[] = [];
    const matchedVideoIds = new Set<string>();

    // Step 1: Find best matches for videos
    for (const video of allVideos) {
      let bestFile: { name: string; id?: string; url?: string; confidence: number } | null = null;

      for (const file of filesToMatch) {
        const matchResult = matchFileWithVideo(file.name, video.stt, video.title);
        if (matchResult.isMatch) {
          if (!bestFile || matchResult.confidence > bestFile.confidence) {
            bestFile = { ...file, confidence: matchResult.confidence };
          }
        }
      }

      if (bestFile) {
        matchedVideoIds.add(video.id);
        const updatedStatus = video.status === 'not_started' ? 'uploaded_drive' : video.status;
        const videoUrl = bestFile.url || (bestFile.id ? `https://drive.google.com/file/d/${bestFile.id}/view` : '');

        const updated = {
          ...video,
          status: updatedStatus,
          driveFileName: bestFile.name,
          driveFileId: bestFile.id || video.driveFileId,
          driveVideoUrl: videoUrl,
          driveUploadedAt: video.driveUploadedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await dbSaveVideo(updated);

        matchedResults.push({
          videoId: video.id,
          stt: video.stt,
          title: video.title,
          fileName: bestFile.name,
          url: videoUrl
        });
      } else {
        // Not matched in current folder: if it previously had a drive file, clear it!
        if (video.driveFileName || video.driveFileId || video.driveVideoUrl) {
          const resetStatus = video.status === 'uploaded_drive' ? 'not_started' : video.status;
          await dbSaveVideo({
            ...video,
            driveFileName: undefined,
            driveFileId: undefined,
            driveVideoUrl: undefined,
            driveUploadedAt: undefined,
            status: resetStatus,
            updatedAt: new Date().toISOString()
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      scannedFilesCount: filesToMatch.length,
      matchedCount: matchedResults.length,
      matchedResults,
      message: `Đã quét ${filesToMatch.length} file, tự động nhận diện & cập nhật thành công ${matchedResults.length} video real-time!`
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
