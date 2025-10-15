"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Leaf, ShoppingBag, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAdminLoginMutation } from "@/services/auth.api";
import { useAppDispatch } from "@/store/hooks";
import { setToken } from "@/features/auth/auth.slice";

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);

  const [login, { isLoading }] = useAdminLoginMutation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    try {
      const res = await login({ email, password }).unwrap();
      if (res.ok && res.data?.accessToken) {
        localStorage.setItem("accessToken", res.data.accessToken);
        dispatch(setToken(res.data.accessToken));
        router.replace("/dashboard");
      } else {
        setApiError("Invalid credentials");
      }
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 flex items-center justify-center p-4">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-lime-200 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply blur-3xl opacity-20 animate-pulse delay-1000" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-2xl mb-4 transform hover:scale-110 transition">
            <Leaf className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-green-600 mb-2">
            Shodaigram
          </h1>
          <p className="text-emerald-700/90 font-medium text-lg">
            Admin Dashboard
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-emerald-600">
            <ShoppingBag className="w-4 h-4" />
            <span>Organic Products Management</span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-emerald-100">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              Welcome back! 🌿
            </h2>
            <p className="text-gray-500 text-sm">
              Sign in to manage your organic store
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-emerald-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@shodaigram.com"
                  required
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition bg-white/60 text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-emerald-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition bg-white/60 text-gray-800 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-emerald-600 hover:text-emerald-700 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 focus:ring-2 cursor-pointer"
                />
                <span className="ml-2 text-gray-600 group-hover:text-emerald-700 transition">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-5 h-5 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>

            {apiError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {apiError}
              </div>
            )}
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-emerald-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Secure Admin Access
              </span>
            </div>
          </div>

          {/* Security note */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <Lock className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-emerald-900 mb-1">
                  Protected Admin Panel
                </h4>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  This area is restricted to authorized administrators only. All
                  activities are logged for security.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Page Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Shodaigram. All rights reserved.</p>
          <p className="mt-1 text-emerald-600">🌱 Growing organic, naturally</p>
        </div>
      </div>
    </main>
  );
}
