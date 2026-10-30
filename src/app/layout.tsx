import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hệ Thống Quản Lý Đa Page & Video Hub | Tự Động Quét Google Drive',
  description: 'Quản lý lịch đăng video đa Fanpage Facebook, tự động nhận diện video Google Drive theo STT/Title, tiếp nhận đánh giá và ghi chú từ khách hàng.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}

