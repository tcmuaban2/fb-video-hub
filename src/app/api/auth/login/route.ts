import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (password === '16032005') {
      return NextResponse.json({ success: true, message: 'Đăng nhập thành công' });
    }

    return NextResponse.json(
      { success: false, error: 'Mật khẩu quản trị không chính xác' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

