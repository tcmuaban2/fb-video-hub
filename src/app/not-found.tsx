import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf6ee] text-stone-800 p-4 text-center">
      <h2 className="text-4xl font-extrabold text-amber-700 mb-2">404</h2>
      <p className="text-base text-stone-600 mb-6">Trang bạn tìm kiếm không tồn tại.</p>
      <Link 
        href="/" 
        className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm transition shadow-md shadow-amber-600/20"
      >
        Quay lại Trang Chủ
      </Link>
    </div>
  );
}

