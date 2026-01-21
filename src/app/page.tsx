// app/page.tsx
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
        Bridging Tomoro
      </h1>

      <p className="mt-3 text-sm text-slate-600">
        Selamat datang di sistem Bridging Tomoro. Ini adalah landing page sederhana
        tanpa sidebar. Gunakan menu Login untuk masuk dan melihat Dashboard.
      </p>

      <p className="mt-4 text-xs text-slate-500">
        Klik tombol di bawah untuk masuk ke aplikasi. Setelah login, kamu bisa
        mengakses <code>/dashboard</code> untuk monitoring proses bridging.
      </p>

      {/* Tombol aksi */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Login
        </Link>

        <Link
          href="/register"
          className="inline-flex items-center justify-center rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Register
        </Link>
      </div>
    </main>
  );
}
