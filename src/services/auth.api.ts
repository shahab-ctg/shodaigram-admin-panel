import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base";
import type { AdminLoginDTO, AdminLoginRes } from "@/types/auth";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery,
  endpoints: (builder) => ({
    adminLogin: builder.mutation<AdminLoginRes, AdminLoginDTO>({
      query: (body) => ({
        url: "/admin/auth/login",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useAdminLoginMutation } = authApi;
