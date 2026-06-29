import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-7xl font-extrabold text-orange-500">404</p>
      <h1 className="text-2xl font-bold text-slate-800">
        Halaman tidak ditemukan
      </h1>
      <p className="max-w-md text-slate-500">
        Maaf, halaman yang kamu cari tidak ada atau sudah dipindahkan.
      </p>
      <Link
        to="/"
        className="mt-2 rounded-full bg-orange-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
      >
        ← Kembali ke Beranda
      </Link>
    </div>
  );
}
