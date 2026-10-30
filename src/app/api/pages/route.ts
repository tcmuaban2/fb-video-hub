import { NextResponse } from 'next/server';
import { dbGetPages, dbSavePage, dbDeletePage, dbGetVideos, getLocalDatabase } from '@/lib/storage';
import { FanPage } from '@/types';
import { extractDriveFolderId } from '@/lib/drive';

export async function GET() {
  const pages = await dbGetPages();
  const allVideos = await dbGetVideos();
  const db = getLocalDatabase();

  const pagesWithStats = pages.map(page => {
    const pageVideos = allVideos.filter(v => v.pageId === page.id);
    return {
      ...page,
      stats: {
        total: pageVideos.length,
        notStarted: pageVideos.filter(v => v.status === 'not_started').length,
        uploaded: pageVideos.filter(v => v.status === 'uploaded_drive').length,
        scheduled: pageVideos.filter(v => v.status === 'scheduled_fb').length,
        published: pageVideos.filter(v => v.status === 'published_fb').length,
        hasFeedback: pageVideos.filter(v => v.clientFeedback?.notes && v.clientFeedback.notes.trim().length > 0).length,
      }
    };
  });

  return NextResponse.json({ 
    success: true, 
    pages: pagesWithStats,
    settings: db.settings 
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, avatar, fbPageUrl, driveFolderUrl, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: "Tên Page không được để trống" }, { status: 400 });
    }

    const folderId = extractDriveFolderId(driveFolderUrl || '');

    const newPage: FanPage = {
      id: `page-${Date.now()}`,
      name: name.trim(),
      slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      avatar: avatar || '📱',
      fbPageUrl: fbPageUrl ? fbPageUrl.trim() : '',
      driveFolderId: folderId,
      driveFolderUrl: driveFolderUrl ? driveFolderUrl.trim() : '',
      description: description || '',
      createdAt: new Date().toISOString()
    };

    await dbSavePage(newPage);

    return NextResponse.json({ success: true, page: newPage });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, avatar, fbPageUrl, driveFolderUrl, description } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu page ID" }, { status: 400 });
    }

    const pages = await dbGetPages();
    const existing = pages.find(p => p.id === id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Không tìm thấy Page" }, { status: 400 });
    }

    const folderId = driveFolderUrl !== undefined ? extractDriveFolderId(driveFolderUrl) : existing.driveFolderId;

    const updatedPage: FanPage = {
      ...existing,
      ...(name && { name: name.trim() }),
      ...(avatar !== undefined && { avatar }),
      ...(fbPageUrl !== undefined && { fbPageUrl: fbPageUrl.trim() }),
      ...(driveFolderUrl !== undefined && { driveFolderUrl: driveFolderUrl.trim(), driveFolderId: folderId }),
      ...(description !== undefined && { description }),
    };

    await dbSavePage(updatedPage);
    return NextResponse.json({ success: true, page: updatedPage });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu page ID" }, { status: 400 });
    }

    await dbDeletePage(id);

    return NextResponse.json({ success: true, message: "Đã xóa Page và các video liên quan" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
