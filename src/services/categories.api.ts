import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base";
import type {
  Category,
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from "@/types/category";
import type { ApiOk } from "@/types";

export const categoriesApi = createApi({
  reducerPath: "categoriesApi",
  baseQuery,
  tagTypes: ["Categories"],
  endpoints: (builder) => ({
    listCategories: builder.query<ApiOk<Category[]>, void>({
      query: () => "/categories",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((c) => ({
                type: "Categories" as const,
                id: c._id,
              })),
              { type: "Categories" as const, id: "LIST" },
            ]
          : [{ type: "Categories" as const, id: "LIST" }],
    }),

    createCategory: builder.mutation<
      ApiOk<{ id: string; slug: string }>,
      CreateCategoryDTO
    >({
      query: (body) => ({ url: "/admin/categories", method: "POST", body }),
      invalidatesTags: [{ type: "Categories", id: "LIST" }],
    }),

    updateCategory: builder.mutation<
      ApiOk<Category>,
      { id: string; body: UpdateCategoryDTO }
    >({
      query: ({ id, body }) => ({
        url: `/admin/categories/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (r) =>
        r
          ? [
              { type: "Categories", id: r.data._id },
              { type: "Categories", id: "LIST" },
            ]
          : [{ type: "Categories", id: "LIST" }],
    }),

    deleteCategory: builder.mutation<ApiOk<{ id: string }>, string>({
      query: (id) => ({ url: `/admin/categories/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Categories", id: "LIST" }],
    }),
  }),
});

export const {
  useListCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
