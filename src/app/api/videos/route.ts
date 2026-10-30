import { NextResponse } from 'next/server';
import { dbGetVideos, dbSaveVideo, dbSaveBulkVideos, dbDeleteVideo } from '@/lib/storage';
import { VideoItem } from '@/types';
import { extractDriveFileId } from '@/lib/drive';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pageId = searchParams.get('pageId') || undefined;
  const status = searchParams.get('status') || undefined;
  const search = searchParams.get('search') || undefined;

  const videos = await dbGetVideos(pageId, status, search);
  return NextResponse.json({ success: true, videos });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pageId, mode } = body;

    if (!pageId) {
      return NextResponse.json({ success: false, error: "Thiếu pageId" }, { status: 400 });
    }

    const currentVideos = await dbGetVideos(pageId);
    let maxStt = currentVideos.reduce((max, v) => (v.stt > max ? v.stt : max), 0);

    // MODE 1: BULK IMPORT
    if (mode === 'bulk') {
      const { rawTitles, startDate, defaultTime } = body;
      if (!rawTitles || typeof rawTitles !== 'string') {
        return NextResponse.json({ success: false, error: "Chưa nhập danh sách title" }, { status: 400 });
      }

      const lines = rawTitles
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);

      if (lines.length === 0) {
        return NextResponse.json({ success: false, error: "Danh sách rỗng" }, { status: 400 });
      }

      let currentDate = startDate ? new Date(startDate) : new Date();
      const newItems: VideoItem[] = [];

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        maxStt += 1;

        let cleanTitle = line.replace(/^(\d+[\.\-\_\:\)\s]+)/, '').trim();
        if (!cleanTitle) cleanTitle = line;

        const dateStr = currentDate.toISOString().split('T')[0];

        const newItem: VideoItem = {
          id: `vid-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
          pageId,
          stt: maxStt,
          title: cleanTitle,
          scheduledDate: dateStr,
          scheduledTime: defaultTime || "11:30",
          status: 'not_started',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        newItems.push(newItem);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      await dbSaveBulkVideos(newItems);

      return NextResponse.json({ 
        success: true, 
        message: `Đã nhập thành công ${newItems.length} video mới`,
        importedCount: newItems.length,
        videos: newItems
      });
    }

    // MODE 2: SINGLE VIDEO CREATION
    const { title, stt, caption, scheduledDate, scheduledTime, driveVideoUrl } = body;
    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: "Tiêu đề không được để trống" }, { status: 400 });
    }

    const videoStt = stt ? parseInt(stt, 10) : maxStt + 1;
    const driveFileId = driveVideoUrl ? extractDriveFileId(driveVideoUrl) : undefined;

    const newVideo: VideoItem = {
      id: `vid-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      pageId,
      stt: videoStt,
      title: title.trim(),
      caption: caption || '',
      scheduledDate: scheduledDate || new Date().toISOString().split('T')[0],
      scheduledTime: scheduledTime || "12:00",
      status: driveVideoUrl ? 'uploaded_drive' : 'not_started',
      driveFileId: driveFileId,
      driveVideoUrl: driveVideoUrl || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await dbSaveVideo(newVideo);

    return NextResponse.json({ success: true, video: newVideo });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu ID video" }, { status: 400 });
    }

    const allVideos = await dbGetVideos();
    const existing = allVideos.find(v => v.id === id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Không tìm thấy video" }, { status: 404 });
    }

    if (updates.driveVideoUrl !== undefined) {
      updates.driveFileId = extractDriveFileId(updates.driveVideoUrl);
      if (updates.driveVideoUrl && existing.status === 'not_started') {
        updates.status = 'uploaded_drive';
        updates.driveUploadedAt = new Date().toISOString();
      }
    }

    if (updates.isRevised) {
      updates.revisedAt = new Date().toISOString();
    }

    const updatedVideo: VideoItem = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await dbSaveVideo(updatedVideo);
    return NextResponse.json({ success: true, video: updatedVideo });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu ID video" }, { status: 400 });
    }

    await dbDeleteVideo(id);
    return NextResponse.json({ success: true, message: "Đã xóa video" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
