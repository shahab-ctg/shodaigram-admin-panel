"use client";
import Guard from "@/components/Guard";
import Page from "@/components/Page";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type CategoryItem = {
  _id: string;
  title: string;
  slug: string;
  status: "ACTIVE" | "HIDDEN";
};

export default function CategoriesPage() {
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<{ ok: boolean; data: CategoryItem[] }>("/categories")
      .then((res) => setItems(res.data))
      .catch((e) => setErr(String(e)));
  }, []);

  return (
    <Guard>
      <Page
        title="Categories"
        actions={
          <Link href="/categories/new" className="btn">
            Add Category
          </Link>
        }
      >
        {err && <div className="text-sm text-red-600 mb-2">{err}</div>}
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c._id} className="border-t">
                  <td className="font-medium">{c.title}</td>
                  <td>{c.slug}</td>
                  <td>
                    <span className="badge">{c.status}</span>
                  </td>
                  <td className="text-right">
                    <Link href={`/categories/${c._id}`} className="btn-outline">
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
