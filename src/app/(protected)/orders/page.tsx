"use client";

import { useMemo, useState } from "react";
import {
  ClipboardList,
  Search,
  Eye,
  X,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Package,
  User,
  Phone,
  Calendar,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { Toaster, toast } from "react-hot-toast";

import {
  useListOrdersQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
} from "@/services/orders.api";
import type { Order, OrderStatus } from "@/types/order";

/** date → bn-BD */
const bnDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("bn-BD", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

/** Status badge config (UPPERCASE) */
const STATUS_UI: Record<
  OrderStatus,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { label: string; bg: string; text: string; Icon: React.ComponentType<any> }
> = {
  PENDING: {
    label: "Pending",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    Icon: Clock,
  },
  IN_PROGRESS: {
    label: "In Progress",
    bg: "bg-blue-100",
    text: "text-blue-700",
    Icon: AlertCircle,
  },
  IN_SHIPPING: {
    label: "In Shipping",
    bg: "bg-indigo-100",
    text: "text-indigo-700",
    Icon: AlertCircle,
  },
  DELIVERED: {
    label: "Delivered",
    bg: "bg-green-100",
    text: "text-green-700",
    Icon: CheckCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-red-100",
    text: "text-red-700",
    Icon: XCircle,
  },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const s = STATUS_UI[status];
  const I = s.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}
    >
      <I className="w-3.5 h-3.5" />
      {s.label}
    </span>
  );
}

/** Simple confirm dialog */
function Confirm({
  open,
  title,
  subtitle,
  confirmLabel = "Confirm",
  tone = "primary",
  loading,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  confirmLabel?: string;
  tone?: "primary" | "danger";
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  const btnClass =
    tone === "danger"
      ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
      : "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500";
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-emerald-100">
        <div className="px-6 pt-6">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle ? (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex gap-3 p-6">
          <button
            onClick={onCancel}
            className="flex-1 px-5 py-2.5 rounded-xl border border-emerald-200 text-gray-700 font-medium hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-5 py-2.5 rounded-xl text-white font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 transition ${btnClass}`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  /** local UI state */
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [page, setPage] = useState(1);
  const limit = 24;

  const [selected, setSelected] = useState<Order | null>(null);
  const [openDetails, setOpenDetails] = useState(false);

  /** destructive confirms */
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  /** RTK Query calls (aligned to your service) */
  const { data, isLoading, isFetching, error } = useListOrdersQuery({
    page,
    limit,
    status: (statusFilter as Order["status"]) || undefined,
  });
  const [doUpdate, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
  const [doDelete, { isLoading: isDeleting }] = useDeleteOrderMutation();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const items: Order[] = Array.isArray(data?.data?.items)
    ? data!.data.items
    : [];

  const total = data?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  /** client-side search (id/name) – memoized */
  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return items;
    return items.filter(
      (o) =>
        o._id.toLowerCase().includes(ql) ||
        o.customer?.name?.toLowerCase().includes(ql)
    );
  }, [items, q]);

  const askStatusChange = (s: OrderStatus) => {
    if (s === "DELIVERED" || s === "CANCELLED") setPendingStatus(s);
    else doStatusChange(s);
  };

  const doStatusChange = async (s: OrderStatus) => {
    if (!selected) return;
    try {
      await doUpdate({ id: selected._id, body: { status: s } }).unwrap();
      toast.success(`Status updated to "${STATUS_UI[s].label}"`);
      setSelected({ ...selected, status: s });
      // refetch list implicitly via tags; or optimistic UI already changed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      toast.error(String(e?.data?.message || e?.data?.code || "Update failed"));

      console.error(e);
    } finally {
      setPendingStatus(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await doDelete(pendingDelete).unwrap();
      toast.success("Order deleted");
      setPendingDelete(null);
      setOpenDetails(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      toast.error(String(e?.data?.message || e?.data?.code || "Delete failed"));

      console.error(e);
    }
  };

  /** skeleton while loading */
  const Skeleton = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 animate-pulse">
      <div className="p-6 space-y-4">
        <div className="h-5 bg-emerald-100 rounded w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="h-4 bg-emerald-100 rounded" />
          <div className="h-4 bg-emerald-100 rounded" />
          <div className="h-4 bg-emerald-100 rounded" />
        </div>
        <div className="h-4 bg-emerald-100 rounded w-1/2" />
      </div>
    </div>
  );

  return (
    <>
      <Toaster position="top-right" />

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-green-600 mb-2 flex items-center gap-3">
              <ClipboardList className="w-9 sm:w-10 h-9 sm:h-10 text-emerald-600" />
              Orders
            </h1>
            <p className="text-gray-600">
              View & manage customer orders from your database
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-4 sm:p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                <input
                  type="text"
                  placeholder="Search by order ID or customer name..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as OrderStatus | "");
                  setPage(1);
                }}
                className="px-4 py-3 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition md:w-64"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_SHIPPING">In Shipping</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* List */}
          {isLoading || isFetching ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">
                Failed to load orders. Please try again.
              </p>
            </div>
          ) : filtered.length ? (
            <div className="space-y-4">
              {filtered.map((o) => (
                <div
                  key={o._id}
                  className="bg-white rounded-2xl shadow-sm border border-emerald-100 hover:shadow-md transition"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg sm:text-xl font-bold text-emerald-700 break-all">
                            {o._id}
                          </h3>
                          <StatusBadge status={o.status} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <User className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="text-gray-700 truncate">
                              {o.customer.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">
                              {o.customer.phone}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">
                              {bnDate(o.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Amount + actions */}
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="text-right">
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">
                            Grand Total
                          </p>
                          <p className="text-xl sm:text-2xl font-bold text-emerald-600">
                            ৳{o.totals.grandTotal}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelected(o);
                            setOpenDetails(true);
                          }}
                          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition"
                        >
                          <Eye className="w-5 h-5" />
                          <span className="hidden sm:inline">Details</span>
                        </button>
                      </div>
                    </div>

                    {/* Summary line */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        {o.lines.length} item{o.lines.length > 1 ? "s" : ""} •
                        Subtotal ৳{o.totals.subTotal} • Shipping ৳
                        {o.totals.shipping}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-xl border border-emerald-200 text-gray-700 hover:bg-emerald-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page <span className="font-semibold">{page}</span> of{" "}
                    <span className="font-semibold">{totalPages}</span>
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-xl border border-emerald-200 text-gray-700 hover:bg-emerald-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-12 text-center">
              <ClipboardList className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-600">
                Try adjusting your filters or search
              </p>
            </div>
          )}
        </div>

        {/* Details modal */}
        {openDetails && selected && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl my-8 border border-emerald-100">
              <div className="sticky top-0 bg-white border-b border-emerald-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Order Details
                  </h2>
                  <p className="text-sm text-emerald-600 break-all">
                    {selected._id}
                  </p>
                </div>
                <button
                  onClick={() => setOpenDetails(false)}
                  className="p-2 hover:bg-emerald-50 rounded-xl transition"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-5 border border-emerald-100">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-600" />
                    Customer
                  </h3>
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-semibold text-gray-800">
                        {selected.customer.name}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-semibold text-gray-800">
                        {selected.customer.phone}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-600">Area:</span>
                      <span className="font-semibold text-gray-800">
                        {selected.customer.area}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-600">Address:</span>
                      <span className="font-semibold text-gray-800 text-right">
                        {selected.customer.address}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lines */}
                <div>
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-emerald-600" />
                    Items
                  </h3>
                  <div className="space-y-3">
                    {selected.lines.map((l, idx) => (
                      <div
                        key={`${l.productId}-${idx}`}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
                      >
                        {l.image ? (
                          <Image
                            src={l.image}
                            alt={l.title}
                            width={320}
                            height={240}
                            sizes="(max-width: 768px) 64px, 80px"
                            className="w-16 h-16 rounded-lg object-cover"
                            onError={(e) =>
                              ((
                                e.currentTarget as HTMLImageElement
                              ).style.display = "none")
                            }
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-emerald-100" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 line-clamp-1">
                            {l.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            ৳{l.price} × {l.qty}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-emerald-600">
                            ৳{l.price * l.qty}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t-2 border-emerald-200 grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">
                        ৳{selected.totals.subTotal}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-semibold">
                        ৳{selected.totals.shipping}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-between text-base">
                      <span className="font-bold text-gray-800">
                        Grand Total
                      </span>
                      <span className="text-2xl font-bold text-emerald-600">
                        ৳{selected.totals.grandTotal}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Update Status */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-5 border border-emerald-100">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-emerald-600" />
                    Update Status
                  </h3>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">Current:</span>
                    <StatusBadge status={selected.status} />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {(
                      [
                        "PENDING",
                        "IN_PROGRESS",
                        "IN_SHIPPING",
                        "DELIVERED",
                        "CANCELLED",
                      ] as OrderStatus[]
                    ).map((s) => {
                      const disabled = selected.status === s || isUpdating;
                      const base =
                        "px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 border";
                      const active =
                        "bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed";
                      const ready =
                        "bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-100";
                      const Icon = STATUS_UI[s].Icon;
                      return (
                        <button
                          key={s}
                          onClick={() => askStatusChange(s)}
                          disabled={disabled}
                          className={`${base} ${disabled ? active : ready}`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="hidden xs:inline">
                            {STATUS_UI[s].label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {isUpdating && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-emerald-600">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm font-medium">Updating...</span>
                    </div>
                  )}
                </div>

                {/* Delete order */}
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => setPendingDelete(selected._id)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-100 font-semibold transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Order
                  </button>
                </div>
              </div>
            </div>

            {/* Final confirms */}
            <Confirm
              open={!!pendingStatus}
              title={
                pendingStatus === "CANCELLED"
                  ? "Cancel this order?"
                  : pendingStatus === "DELIVERED"
                  ? "Mark as delivered?"
                  : "Change status?"
              }
              subtitle={
                pendingStatus === "CANCELLED"
                  ? "The order will be marked as CANCELLED."
                  : pendingStatus === "DELIVERED"
                  ? "The order will be marked as DELIVERED."
                  : undefined
              }
              confirmLabel={
                pendingStatus === "CANCELLED"
                  ? "Yes, cancel"
                  : pendingStatus === "DELIVERED"
                  ? "Yes, deliver"
                  : "Confirm"
              }
              tone={pendingStatus === "CANCELLED" ? "danger" : "primary"}
              loading={isUpdating}
              onCancel={() => setPendingStatus(null)}
              onConfirm={() => pendingStatus && doStatusChange(pendingStatus)}
            />

            <Confirm
              open={!!pendingDelete}
              title="Delete this order?"
              subtitle="This action cannot be undone."
              confirmLabel="Delete"
              tone="danger"
              loading={isDeleting}
              onCancel={() => setPendingDelete(null)}
              onConfirm={confirmDelete}
            />
          </div>
        )}
      </div>
    </>
  );
}
