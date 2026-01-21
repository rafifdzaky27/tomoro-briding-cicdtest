"use client";

import { FormEvent, useState } from "react";

type Msg = null | { type: "success" | "error"; text: string };

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Msg>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name || !email || !form.password || !form.confirmPassword) {
      setMessage({ type: "error", text: "Semua field wajib diisi." });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage({ type: "error", text: "Password dan konfirmasi password tidak sama." });
      return;
    }

    if (form.password.length < 6) {
      setMessage({ type: "error", text: "Password minimal 6 karakter." });
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: form.password }),
      });

      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; message?: string }
        | null;

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data?.message || "Terjadi kesalahan saat register.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: data?.message || "Registrasi berhasil!",
      });

      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      console.error("Register error:", err);
      setMessage({
        type: "error",
        text: err?.message || "Terjadi kesalahan saat register.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight">Register</h1>
      <p className="mt-2 text-sm text-slate-600">
        Buat akun baru untuk mulai menggunakan aplikasi.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700" htmlFor="name">
            Nama Lengkap
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Nama kamu"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="email@example.com"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Minimal 6 karakter"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700" htmlFor="confirmPassword">
            Konfirmasi Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Ulangi password"
            value={form.confirmPassword}
            onChange={handleChange}
          />
        </div>

        {message && (
          <div
            className={`rounded-md px-3 py-2 text-xs ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Memproses..." : "Daftar"}
        </button>
      </form>
    </section>
  );
}
