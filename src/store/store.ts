import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "@/features/auth/auth.slice";
import { authApi } from "@/services/auth.api";
import { productsApi } from "@/services/products.api";
import { categoriesApi } from "@/services/categories.api";
import { ordersApi } from "@/services/orders.api";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(
      authApi.middleware,
      productsApi.middleware,
      categoriesApi.middleware,
      ordersApi.middleware
    ),
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
