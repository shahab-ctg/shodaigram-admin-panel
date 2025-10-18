
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base";
import type { Category, CategoryStatus } from "@/types/category";

type CreateCategoryDTO = {
  title: string;
  slug: string;
  image?: string;
  status?: CategoryStatus; 
};

type UpdateCategoryDTO = Partial<CreateCategoryDTO>;

export const categoriesApi = createApi({
  reducerPath: "categoriesApi",
  baseQuery,
  tagTypes: ["Categories"],
  endpoints: (builder) => ({
    listCategories: builder.query<{ ok: boolean; data: Category[] }, void>({
      query: () => ({ url: "/categories", method: "GET" }),
      providesTags: ["Categories"],
    }),

    createCategory: builder.mutation<
      { ok: boolean; data: { id: string; slug: string } },
      CreateCategoryDTO
    >({
      query: (body) => ({
        url: "admin/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Categories"],
    }),

    
    updateCategory: builder.mutation<
      { ok: boolean; data: Category },
      { id: string; body: UpdateCategoryDTO }
    >({
      query: ({ id, body }) => ({
        url: `/admin/categories/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Categories"],
    }),

    deleteCategory: builder.mutation<
      { ok: boolean; data: { id: string } },
      string
    >({
      query: (id) => ({
        url: `/admin/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Categories"],
    }),
  }),
});

export const {
  useListCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
