import { Suspense } from "react";
import TopbarContent from "./TopbarContent";

// Simple loading for topbar
function TopbarLoading() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl animate-pulse" />
          <div className="hidden sm:block">
            <div className="h-6 bg-gray-200 rounded w-32 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Topbar() {
  return (
    <Suspense fallback={<TopbarLoading />}>
      <TopbarContent />
    </Suspense>
  );
}
