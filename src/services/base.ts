import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api/v1";

export const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token =
      state.auth.token ??
      (typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null);

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");
    return headers;
  },
});
