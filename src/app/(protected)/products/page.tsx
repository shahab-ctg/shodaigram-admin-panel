import { Suspense } from "react";
import ProductsContent from "./ProductsContent";

// Loading component
function ProductsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-emerald-100/60" />
                <div className="p-5 space-y-2">
                  <div className="h-4 bg-emerald-100 rounded w-3/4" />
                  <div className="h-3 bg-emerald-100 rounded w-1/3" />
                  <div className="flex gap-2 pt-3">
                    <div className="h-9 bg-emerald-100 rounded flex-1" />
                    <div className="h-9 bg-emerald-100 rounded flex-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent />
    </Suspense>
  );
}
