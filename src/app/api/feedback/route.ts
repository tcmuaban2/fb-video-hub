import { NextResponse } from 'next/server';
import { dbGetVideos, dbSaveVideo } from '@/lib/storage';
import { ClientFeedback } from '@/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { videoId, notes, reviewerName, rating, feeling, reaction } = body;

    if (!videoId) {
      return NextResponse.json({ success: false, error: "Thiếu ID video" }, { status: 400 });
    }

    const allVideos = await dbGetVideos();
    const existing = allVideos.find(v => v.id === videoId);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Không tìm thấy video" }, { status: 404 });
    }

    const currentFeedback = existing.clientFeedback || {};

    const updatedFeedback: ClientFeedback = {
      ...currentFeedback,
      ...(rating !== undefined && { rating: Number(rating) }),
      ...(feeling && { feeling }),
      ...(notes !== undefined && { notes: notes.trim() }),
      ...(reviewerName && { reviewerName: reviewerName.trim() }),
      ...(reaction && { reaction }),
      updatedAt: new Date().toISOString()
    };

    const updatedVideo = {
      ...existing,
      clientFeedback: updatedFeedback,
      updatedAt: new Date().toISOString()
    };

    await dbSaveVideo(updatedVideo);

    return NextResponse.json({
      success: true,
      message: "Đã lưu ghi chú thành công!",
      video: updatedVideo
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
