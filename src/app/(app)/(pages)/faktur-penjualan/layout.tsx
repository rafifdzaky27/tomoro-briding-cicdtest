"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function FakturPenjualanLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { href: "/faktur-penjualan/input", label: "Input Faktur Penjualan" },
    { href: "/faktur-penjualan/setup-accurate", label: "Setup Accurate" },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white">
        <div className="flex flex-col gap-2 border-b px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-lg font-semibold">Faktur Penjualan</div>
            <div className="text-xs text-slate-500">
              Upload CSV/XLSX → mapping kolom → kirim JSON ke n8n.
            </div>
          </div>

          <div className="flex gap-2">
            {tabs.map((t) => {
              const active = pathname === t.href || pathname.startsWith(t.href + "/");
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={[
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-blue-600 text-white" : " demonstrated border border-slate-200 text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {t.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
