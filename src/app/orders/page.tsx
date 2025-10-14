"use client";
import Guard from "@/components/Guard";
import Page from "@/components/Page";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

type OrderItem = {
  _id: string;
  status: "PENDING" | "IN_PROGRESS" | "IN_SHIPPING" | "DELIVERED" | "CANCELLED";
  totals: { subTotal: number; shipping: number; grandTotal: number };
  createdAt?: string;
};
type OrdersRes = { ok: boolean; data: { items: OrderItem[]; total: number } };

export default function OrdersPage() {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const load = () => {
    api<OrdersRes>("/orders?page=1&limit=50")
      .then((res) => setItems(res.data.items))
      .catch((e) => setErr(String(e)));
  };
  useEffect(() => {
    load();
  }, []);
  const updateStatus = async (id: string, status: OrderItem["status"]) => {
    try {
      await api(`/orders/${id}`, "PATCH", { status });
      load();
    } catch (e: unknown) {
      setErr((e as Error).message);
    }
  };
  return (
    <Guard>
      <Page title="Orders">
        {err && <div className="text-sm text-red-600 mb-2">{err}</div>}
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((o) => (
                <tr key={o._id} className="border-t">
                  <td className="font-mono text-xs">{o._id}</td>
                  <td>
                    <span className="badge">{o.status}</span>
                  </td>
                  <td>৳ {o.totals?.grandTotal ?? 0}</td>
                  <td className="space-x-2">
                    <button
                      className="btn-outline"
                      onClick={() => updateStatus(o._id, "IN_PROGRESS")}
                    >
                      In progress
                    </button>
                    <button
                      className="btn-outline"
                      onClick={() => updateStatus(o._id, "IN_SHIPPING")}
                    >
                      Shipping
                    </button>
                    <button
                      className="btn"
                      onClick={() => updateStatus(o._id, "DELIVERED")}
                    >
                      Delivered
                    </button>
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
