"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken, isAuthed } from "@/lib/auth";
import clsx from "clsx";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/orders", label: "Orders" },
];

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-neutral-200">
      <div className="container flex items-center gap-4 py-3">
        <div className="font-semibold">
          {process.env.NEXT_PUBLIC_BRAND || "Shodaigram Admin"}
        </div>
        <nav className="ml-6 hidden md:flex gap-3">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={clsx(
                "px-3 py-2 rounded-lg hover:bg-neutral-100",
                pathname === n.href &&
                  "bg-neutral-900 text-white hover:bg-neutral-900"
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {isAuthed() && (
            <button
              className="btn-outline"
              onClick={() => {
                clearToken();
                router.push("/login");
              }}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
