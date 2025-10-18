// src/services/orders.api.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base";
import type { ApiOk, Paginated } from "@/types";
import type { Order, UpdateOrderDTO } from "@/types/order";

/** যেকোনো শেইপ → { items, total, page, limit } */
function normalizeOrdersPayload(raw: any): Paginated<Order> {
  const box = raw?.data ?? raw;

  // array খোঁজ: items/docs/data/results / অথবা প্রথম কোনো অ্যারে
  let items: Order[] =
    box?.items ??
    box?.docs ??
    box?.data ??
    box?.results ??
    (Array.isArray(box) ? box : undefined) ??
    [];

  if (!Array.isArray(items)) {
    const firstArr = Object.values(box || {}).find((v) => Array.isArray(v));
    items = Array.isArray(firstArr) ? (firstArr as Order[]) : [];
  }

  const page = Number(box?.page ?? raw?.page ?? 1) || 1;
  const limit = Number(box?.limit ?? raw?.limit ?? (items.length || 50)) || 50;
  const total =
    Number(box?.total ?? raw?.total ?? items.length ?? 0) || items.length || 0;

  return { items, total, page, limit };
}

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery,
  tagTypes: ["Orders"],
  endpoints: (builder) => ({
    listOrders: builder.query<
      ApiOk<Paginated<Order>>,
      { page?: number; limit?: number; status?: Order["status"] } | void
    >({
      query: (args) => {
        const page = String(args?.page ?? 1);
        // ✅ ব্যাকএন্ড limit<=60 চাইলে এখানে ক্ল্যাম্প করলাম
        const rawLimit = Number(args?.limit ?? 24);
        const safeLimit =
          !Number.isFinite(rawLimit) || rawLimit <= 0
            ? 24
            : Math.min(rawLimit, 60);
        const params = new URLSearchParams({ page, limit: String(safeLimit) });
        if (args?.status) params.set("status", args.status);
        return `/orders?${params.toString()}`;
      },
      transformResponse: (raw: any): ApiOk<Paginated<Order>> => {
        return { ok: true, data: normalizeOrdersPayload(raw) };
      },
      providesTags: (result) =>
        result?.data?.items?.length
          ? [
              ...result.data.items.map((o) => ({
                type: "Orders" as const,
                id: o._id,
              })),
              { type: "Orders" as const, id: "LIST" },
            ]
          : [{ type: "Orders" as const, id: "LIST" }],
      // চাইলে auto-refresh:
      // keepUnusedDataFor: 30,
      // refetchOnMountOrArgChange: true,
      // pollingInterval: 30000,
    }),

    getOrder: builder.query<ApiOk<Order>, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (r) =>
        r
          ? [{ type: "Orders", id: r.data._id }]
          : [{ type: "Orders", id: "LIST" }],
    }),

    updateOrderStatus: builder.mutation<
      ApiOk<Order>,
      { id: string; body: UpdateOrderDTO }
    >({
      query: ({ id, body }) => ({
        url: `/orders/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (r) =>
        r
          ? [
              { type: "Orders", id: r.data._id },
              { type: "Orders", id: "LIST" },
            ]
          : [{ type: "Orders", id: "LIST" }],
    }),

    deleteOrder: builder.mutation<ApiOk<{ id: string }>, string>({
      query: (id) => ({ url: `/orders/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Orders", id: "LIST" }],
    }),
  }),
});

export const {
  useListOrdersQuery,
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
} = ordersApi;
