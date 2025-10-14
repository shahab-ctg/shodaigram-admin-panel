export default function Footer() {
  const brand = process.env.NEXT_PUBLIC_BRAND || "Shodaigram Admin";
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-neutral-200 bg-gradient-to-b from-white to-[#f4f7f2]">
      <div className="container py-6 grid gap-4 md:grid-cols-3">
        <div>
          <div className="text-lg font-semibold text-[#2d6a4f]">{brand}</div>
          <p className="text-sm text-neutral-600 mt-1">
            Organic products management — clean & minimal admin for a healthier
            store.
          </p>
        </div>
        <div>
          <div className="font-medium text-neutral-800">Quick Links</div>
          <ul className="text-sm text-neutral-600 mt-2 space-y-1">
            <li>Dashboard</li>
            <li>Products</li>
            <li>Categories</li>
            <li>Orders</li>
          </ul>
        </div>
        <div>
          <div className="font-medium text-neutral-800">Support</div>
          <p className="text-sm text-neutral-600 mt-2">
            Need help? Call us:{" "}
            <span className="font-medium">
              {process.env.NEXT_PUBLIC_HOTLINE || "01700000000"}
            </span>
          </p>
        </div>
      </div>
      <div className="border-t border-neutral-200">
        <div className="container py-3 text-xs text-neutral-500">
          © {year} {brand}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
