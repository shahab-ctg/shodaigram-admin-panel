"use client";
import Guard from "@/components/Guard";
import Page from "@/components/Page";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type HealthRes = { ok: boolean; service: string; ts: string };

export default function Dashboard() {
  const [health, setHealth] = useState<HealthRes | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    api<HealthRes>("/health")
      .then(setHealth)
      .catch((e) => setErr(String(e)));
  }, []);
  return (
    <Guard>
      <Page title="Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4">
            <div className="text-sm text-neutral-500">API Health</div>
            <div className="text-lg font-semibold mt-1">
              {health?.ok ? "OK" : "..."}
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              {health?.service}
            </div>
            {err && <div className="text-xs text-red-600 mt-2">{err}</div>}
          </div>
          <div className="card p-4">
            <div className="text-sm text-neutral-500">Orders Today</div>
            <div className="text-2xl font-semibold mt-1">—</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-neutral-500">Revenue</div>
            <div className="text-2xl font-semibold mt-1">—</div>
          </div>
        </div>
      </Page>
    </Guard>
  );
}
