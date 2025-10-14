import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
  token: string | null;
};

const initialState: AuthState = {
  token: null,
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
    },
    hydrateFromStorage(state) {
      if (typeof window !== "undefined") {
        const t = localStorage.getItem("accessToken");
        state.token = t ? t : null;
      }
    },
    logout(state) {
      state.token = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }
    },
  },
});

export const { setToken, hydrateFromStorage, logout } = slice.actions;
export const authReducer = slice.reducer;
