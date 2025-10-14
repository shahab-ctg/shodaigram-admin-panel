"use client";
import Guard from "@/components/Guard";
import Page from "@/components/Page";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type ProductItem = {
  _id: string;
  title: string;
  slug: string;
  price: number;
  stock?: number;
  status: "ACTIVE" | "DRAFT" | "HIDDEN";
  isDiscounted?: boolean;
};
type ListRes = { ok: boolean; data: { items: ProductItem[]; total: number } };

export default function ProductsPage() {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    api<ListRes>("/products?page=1&limit=50")
      .then((res) => setItems(res.data.items))
      .catch((e) => setErr(String(e)));
  }, []);
  return (
    <Guard>
      <Page
        title="Products"
        actions={
          <Link href="/products/new" className="btn">
            Add Product
          </Link>
        }
      >
        {err && <div className="text-sm text-red-600 mb-2">{err}</div>}
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p._id} className="border-t">
                  <td className="font-medium">{p.title}</td>
                  <td>৳ {p.price}</td>
                  <td>{p.stock ?? 0}</td>
                  <td>
                    <span className="badge">{p.status}</span>
                  </td>
                  <td className="text-right">
                    <Link href={`/products/${p._id}`} className="btn-outline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Page>
    </Guard>
  );
}
