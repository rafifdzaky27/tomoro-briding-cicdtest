// app/(app)/layout.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentUser");
    }
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="hidden w-60 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="border-b border-slate-200 px-4 py-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            HPI • INTERNAL
          </div>
          <div className="mt-1 text-lg font-bold tracking-tight">
            Bridging Tomoro
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Rekening koran → Tomoro
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-2 py-4 text-sm">
          {/* Main */}
          <SidebarLink href="/dashboard" active={pathname === "/dashboard"}>
            Dashboard
          </SidebarLink>

          {/* Monitoring section */}
          <div className="mt-4 border-t border-slate-200 pt-4 text-[11px] font-semibold text-slate-500">
            Monitoring
          </div>

          <SidebarLink
            href="/upload"
            active={pathname.startsWith("/upload")}
          >
            Upload Data
          </SidebarLink>

          <SidebarLink
            href="/sales"
            active={pathname.startsWith("/sales")}
          >
            Sales Tomoro
          </SidebarLink>

          <SidebarLink
            href="/buku-bank"
            active={pathname.startsWith("/buku-bank")}
          >
            Buku Bank
          </SidebarLink>

          <SidebarLink
            href="/rekonsiliasi"
            active={pathname.startsWith("/rekonsiliasi")}
          >
            Rekonsiliasi
          </SidebarLink>
          
          <SidebarLink
            href="/faktur-penjualan"
            active={pathname.startsWith("/faktur-penjualan")}
          >
            Faktur Penjualan
          </SidebarLink>

          <SidebarLink
            href="/edit-value"
            active={pathname.startsWith("/edit-value")}
          >
            Edit Value
          </SidebarLink>

          <SidebarLink href="#" active={false}>
            Rekening Koran
          </SidebarLink>
          <SidebarLink href="#" active={false}>
            Mapping Outlet
          </SidebarLink>
          <SidebarLink href="#" active={false}>
            Logs &amp; Error
          </SidebarLink>
          <SidebarLink href="#" active={false}>
            Settings
          </SidebarLink>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </nav>

        <div className="border-t border-slate-200 px-4 py-3 text-[11px] text-slate-400">
          © {new Date().getFullYear()} Bridging Tomoro
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col">
        {/* Top bar (mobile) */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Bridging Tomoro
            </div>
            <div className="text-sm font-semibold text-slate-900">
              Dashboard
            </div>
          </div>
          <Link
            href="/login"
            className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            Login
          </Link>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: ReactNode;
}) {
  const base =
    "flex items-center rounded-md px-2 py-1.5 text-sm transition-colors";
  const activeCls = "bg-blue-50 text-blue-700 font-medium";
  const normalCls = "text-slate-700 hover:bg-slate-100 hover:text-slate-900";

  return (
    <Link href={href} className={`${base} ${active ? activeCls : normalCls}`}>
      {children}
    </Link>
  );
}