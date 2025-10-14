"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminLoginMutation } from "@/services/auth.api";
import { useAppDispatch } from "@/store/hooks";
import { setToken } from "@/features/auth/auth.slice";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading }] = useAdminLoginMutation();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await login({ email, password }).unwrap();
      if (res.ok && res.data?.accessToken) {
        localStorage.setItem("accessToken", res.data.accessToken);
        dispatch(setToken(res.data.accessToken));
        router.replace("/dashboard");
      } else {
        setError("Invalid credentials");
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f1f7ed] to-white">
      <div className="container py-10 md:py-16">
        {/* Card wrapper: mobile এক কলাম, md থেকে দুই কলাম */}
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-stretch">
          {/* Left: brand / organic illustration vibe */}
          <div className="card p-6 md:p-8 bg-[#f6fbf4] border-[#e3f1e8] flex flex-col justify-center">
            <div className="inline-flex items-center gap-2">
              <span className="text-2xl">🌿</span>
              <h2 className="text-2xl md:text-3xl font-semibold text-[#1b4332]">
                Welcome back
              </h2>
            </div>
            <p className="text-sm md:text-base text-neutral-600 mt-3 leading-relaxed">
              Manage your <span className="font-medium">organic products</span>,
              categories, and orders with a clean and calming dashboard. Keep
              your store fresh. 🌱
            </p>

            {/* Some organic badges */}
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="px-3 py-1 text-xs rounded-full bg-white border border-[#d9ebdf] text-[#1b4332]">
                Eco-friendly
              </span>
              <span className="px-3 py-1 text-xs rounded-full bg-white border border-[#d9ebdf] text-[#1b4332]">
                Minimal UI
              </span>
              <span className="px-3 py-1 text-xs rounded-full bg-white border border-[#d9ebdf] text-[#1b4332]">
                Secure Access
              </span>
            </div>
          </div>

          {/* Right: login form */}
          <div className="card p-6 md:p-8">
            <h1 className="text-xl md:text-2xl font-semibold text-[#2d6a4f]">
              Admin Login
            </h1>
            <p className="text-sm text-neutral-600 mt-1">
              Use your credentials to access the admin dashboard.
            </p>

            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm mb-1 text-neutral-700">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@organic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-neutral-700">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {error}
                </div>
              )}

              <button
                className="w-full rounded-xl px-4 py-2 bg-[#2d6a4f] text-white hover:bg-[#1b4332] transition"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>

              {/* hotline hint */}
              <p className="text-xs text-neutral-500 text-center mt-2">
                Need help? Call{" "}
                {process.env.NEXT_PUBLIC_HOTLINE || "01700000000"}
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
