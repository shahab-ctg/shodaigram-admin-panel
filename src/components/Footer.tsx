// components/Footer.tsx
"use client";

import Link from "next/link";
import {
  Leaf,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Heart,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const brand = process.env.NEXT_PUBLIC_BRAND || "ShodaiGram";
  const hotline = process.env.NEXT_PUBLIC_HOTLINE || "01700000000";

  return (
    <footer className="bg-gradient-to-br from-emerald-900 via-green-800 to-emerald-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <Leaf className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-bold">{brand}</h3>
                <p className="text-xs text-emerald-300">Admin Panel</p>
              </div>
            </div>
            <p className="text-emerald-200 text-sm leading-relaxed mb-4">
              Managing fresh & authentic organic products from farm to your
              doorstep. Building trust through quality.
            </p>
            <div className="flex items-center gap-2 text-sm text-emerald-300">
              <Heart className="w-4 h-4 fill-emerald-300" />
              <span>Growing organic, naturally</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-emerald-400 rounded-full"></span>
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-emerald-200">
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-white hover:pl-2 transition-all duration-200 inline-block"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-white hover:pl-2 transition-all duration-200 inline-block"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="hover:text-white hover:pl-2 transition-all duration-200 inline-block"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="hover:text-white hover:pl-2 transition-all duration-200 inline-block"
                >
                  Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-emerald-400 rounded-full"></span>
              Contact Us
            </h4>
            <ul className="space-y-3 text-emerald-200 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Chittagong, Bangladesh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <a
                  href={`tel:${hotline}`}
                  className="hover:text-white transition-colors"
                >
                  +880 {hotline}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <a
                  href="mailto:admin@shodaigram.com"
                  className="hover:text-white transition-colors"
                >
                  admin@shodaigram.com
                </a>
              </li>
            </ul>
          </div>

          {/* Social & Info */}
          <div>
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-emerald-400 rounded-full"></span>
              Connect With Us
            </h4>
            <div className="flex gap-3 mb-6">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-emerald-800 hover:bg-emerald-700 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-emerald-800 hover:bg-emerald-700 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-emerald-800 hover:bg-emerald-700 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-emerald-800 hover:bg-emerald-700 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
            <div className="bg-emerald-800/50 border border-emerald-700 rounded-xl p-4">
              <p className="text-xs text-emerald-300 mb-2 font-semibold">
                Admin Panel Hours
              </p>
              <p className="text-sm text-emerald-200">24/7 System Access</p>
              <p className="text-xs text-emerald-300 mt-1">
                Support: 8 AM - 10 PM
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-emerald-800 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-emerald-300">
            <p>
              © {currentYear}{" "}
              <span className="font-semibold text-white">{brand}</span>. All
              rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-emerald-700">|</span>
              <Link
                href="/terms"
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
