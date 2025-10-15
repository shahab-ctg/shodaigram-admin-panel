// components/Topbar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/features/auth/auth.slice";
import { useListCategoriesQuery } from "@/services/categories.api";
import clsx from "clsx";
import {
  Search,
  ShoppingBag,
  Phone,
  LogOut,
  Menu,
  X,
  Leaf,
  Package,
  FolderTree,
  LayoutDashboard,
  ClipboardList,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/categories", label: "Categories", icon: FolderTree },
  { href: "/orders", label: "Orders", icon: ClipboardList },
];

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const sp = useSearchParams();
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);

  const [q, setQ] = useState<string>(sp.get("q") ?? "");
  const [cat, setCat] = useState<string>(sp.get("category") ?? "");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data, isLoading } = useListCategoriesQuery();
  const cats = data?.data ?? [];

  const brand = process.env.NEXT_PUBLIC_BRAND || "ShodaiGram";
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

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header */}
        <div className="flex items-center gap-4 py-4">
          {/* Logo & Brand */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 shrink-0 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Leaf className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div className="hidden sm:block">
              <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-green-600">
                {brand}
              </div>
              <div className="text-xs text-emerald-600 font-medium">
                Admin Panel
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 ml-4">
            {NAV.map((n) => {
              const Icon = n.icon;
              const isActive = pathname === n.href;

              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{n.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Search Bar */}
          <form
            onSubmit={onSearch}
            className="hidden md:flex items-center gap-2 ml-auto max-w-2xl flex-1"
          >
            <div className="flex-1 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                <input
                  placeholder="Search products..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all bg-white/50"
                />
              </div>
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                disabled={isLoading}
                className="px-4 py-2.5 border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all bg-white/50 min-w-[160px]"
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
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
            >
              Search
            </button>
            {(q || cat) && (
              <button
                type="button"
                onClick={onClear}
                className="px-4 py-2.5 border-2 border-emerald-200 text-emerald-700 font-medium rounded-xl hover:bg-emerald-50 transition-all"
              >
                Clear
              </button>
            )}
          </form>

          {/* Right Actions */}
          <div className="hidden sm:flex items-center gap-2 ml-2">
            <a
              title="Call us"
              href={`tel:${hotline}`}
              className="flex items-center gap-2 px-4 py-2.5 border-2 border-emerald-200 text-emerald-700 font-medium rounded-xl hover:bg-emerald-50 transition-all"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm">{hotline}</span>
            </a>
            {token && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border-2 border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <form onSubmit={onSearch} className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
              <input
                placeholder="Search products..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all bg-white/50"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-all bg-white/50"
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
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl shadow-md"
              >
                Search
              </button>
            </div>
            {(q || cat) && (
              <button
                type="button"
                onClick={onClear}
                className="w-full px-4 py-2.5 border-2 border-emerald-200 text-emerald-700 font-medium rounded-xl hover:bg-emerald-50 transition-all"
              >
                Clear Filters
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-emerald-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            {NAV.map((n) => {
              const Icon = n.icon;
              const isActive = pathname === n.href;

              return (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
                    isActive
                      ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{n.label}</span>
                </Link>
              );
            })}

            <div className="pt-2 mt-2 border-t border-emerald-100 space-y-2">
              <a
                href={`tel:${hotline}`}
                className="flex items-center gap-3 px-4 py-3 border-2 border-emerald-200 text-emerald-700 font-medium rounded-xl hover:bg-emerald-50 transition-all"
              >
                <Phone className="w-5 h-5" />
                <span>{hotline}</span>
              </a>
              {token && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 border-2 border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
