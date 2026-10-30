import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/storage';

export async function GET() {
  const db = getDatabase();
  const envKey = process.env.GOOGLE_DRIVE_API_KEY || '';
  return NextResponse.json({ 
    success: true, 
    settings: {
      ...db.settings,
      googleApiKey: envKey || db.settings.googleApiKey || '',
      isEnvConfigured: Boolean(envKey)
    } 
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { googleApiKey, appName } = body;

    const db = getDatabase();
    if (googleApiKey !== undefined) db.settings.googleApiKey = googleApiKey.trim();
    if (appName !== undefined) db.settings.appName = appName.trim();

    saveDatabase(db);
    return NextResponse.json({ success: true, settings: db.settings, message: "Đã lưu cài đặt!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
