"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<null | { type: "success" | "error"; text: string }>(
    null
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    const email = form.email.trim();

    if (!email || !form.password) {
      setMessage({ type: "error", text: "Email dan password wajib diisi." });
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: form.password }),
      });

      const data: any = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage({ type: "error", text: data?.message || "Email atau password salah." });
        return;
      }

      const safeUser = data?.user;
      if (!safeUser?.id) {
        setMessage({ type: "error", text: "Respon login tidak valid." });
        return;
      }

      // ✅ Simpan user (masih seperti sebelumnya)
      if (typeof window !== "undefined") {
        localStorage.setItem("currentUser", JSON.stringify(safeUser));
      }

      setMessage({
        type: "success",
        text: "Login berhasil! Mengarahkan ke dashboard...",
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } catch (err: any) {
      console.error("Login error:", err);
      setMessage({
        type: "error",
        text: err?.message || "Terjadi kesalahan saat login.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
      <p className="mt-2 text-sm text-slate-600">Masuk dengan akun yang sudah terdaftar.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
            placeholder="Masukkan password"
            value={form.password}
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
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>
    </section>
  );
}
