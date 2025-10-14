"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/features/auth/auth.slice";
import { useListCategoriesQuery } from "@/services/categories.api";
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
  const sp = useSearchParams();
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);

  const [q, setQ] = useState<string>(sp.get("q") ?? "");
  const [cat, setCat] = useState<string>(sp.get("category") ?? "");

  const { data, isLoading } = useListCategoriesQuery();
  const cats = data?.data ?? [];

  const brand = process.env.NEXT_PUBLIC_BRAND || "Shodaigram Admin";
  const hotline = process.env.NEXT_PUBLIC_HOTLINE || "01700000000";

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (cat) params.set("category", cat);
    router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const onClear = () => {
    setQ("");
    setCat("");
    router.push("/products");
  };

  const activeHref = useMemo(() => pathname, [pathname]);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-neutral-200">
      <div className="container flex items-center gap-3 py-3">
        <Link href="/dashboard" className="shrink-0 font-semibold">
          {brand}
        </Link>

        <nav className="hidden lg:flex items-center gap-1 ml-2">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={clsx(
                "px-3 py-2 rounded-lg hover:bg-neutral-100",
                activeHref === n.href &&
                  "bg-neutral-900 text-white hover:bg-neutral-900"
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <form
          onSubmit={onSearch}
          className="flex items-center gap-2 ml-auto w-full max-w-2xl"
        >
          <div className="flex-1 flex items-center gap-2">
            <input
              placeholder="Search products..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full"
            />
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="min-w-[160px]"
              disabled={isLoading}
            >
              <option value="">
                {isLoading ? "Loading..." : "All categories"}
              </option>
              {cats.map((c) => (
                <option key={c._id} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <button className="btn" type="submit">
            Search
          </button>
          {(q || cat) && (
            <button type="button" onClick={onClear} className="btn-outline">
              Clear
            </button>
          )}
        </form>

        <div className="hidden sm:flex items-center gap-2 ml-2">
          <a title="Call us" href={`tel:${hotline}`} className="btn-outline">
            📞 {hotline}
          </a>
          {token && (
            <button
              className="btn-outline"
              onClick={() => {
                dispatch(logout());
                router.push("/login");
              }}
            >
              Logout
            </button>
          )}
        </div>
      </div>

      <div className="container lg:hidden flex items-center gap-2 pb-3">
        <div className="flex gap-1 overflow-x-auto">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={clsx(
                "px-3 py-2 rounded-lg hover:bg-neutral-100 whitespace-nowrap",
                activeHref === n.href &&
                  "bg-neutral-900 text-white hover:bg-neutral-900"
              )}
            >
              {n.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
