import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base";
import type {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
  ProductListQuery,
} from "@/types/product";
import type { ApiOk, Paginated } from "@/types";

function buildQuery(q: ProductListQuery): string {
  const params = new URLSearchParams();
  if (q.page) params.set("page", String(q.page));
  if (q.limit) params.set("limit", String(q.limit));
  if (q.q?.trim()) params.set("q", q.q.trim());
  if (q.category) params.set("category", q.category);
  if (q.tag) params.set("tag", q.tag);
  if (q.discounted) params.set("discounted", q.discounted);
  const s = params.toString();
  return s ? `?${s}` : "";
}

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery,
  tagTypes: ["Products"],
  endpoints: (builder) => ({
    listProducts: builder.query<
      ApiOk<Paginated<Product>>,
      ProductListQuery | void
    >({
      query: (q) => `/products${buildQuery(q ?? { page: 1, limit: 20 })}`,
      providesTags: (result) =>
        result?.data.items
          ? [
              ...result.data.items.map((p) => ({
                type: "Products" as const,
                id: p._id,
              })),
              { type: "Products" as const, id: "LIST" },
            ]
          : [{ type: "Products" as const, id: "LIST" }],
    }),

    getProductBySlug: builder.query<ApiOk<Product>, string>({
      query: (slug) => `/products/${slug}`,
      providesTags: (r) =>
        r
          ? [{ type: "Products", id: r.data._id }]
          : [{ type: "Products", id: "LIST" }],
    }),

    createProduct: builder.mutation<
      ApiOk<{ id: string; slug: string }>,
      CreateProductDTO
    >({
      query: (body) => ({ url: "/admin/products", method: "POST", body }),
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),

    updateProduct: builder.mutation<
      ApiOk<Product>,
      { id: string; body: UpdateProductDTO }
    >({
      query: ({ id, body }) => ({
        url: `/admin/products/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (r) =>
        r
          ? [
              { type: "Products", id: r.data._id },
              { type: "Products", id: "LIST" },
            ]
          : [{ type: "Products", id: "LIST" }],
    }),

    deleteProduct: builder.mutation<ApiOk<{ id: string }>, string>({
      query: (id) => ({ url: `/admin/products/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),
  }),
});

export const {
  useListProductsQuery,
  useGetProductBySlugQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
