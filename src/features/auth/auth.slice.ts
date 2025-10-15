import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/** Auth slice state */
export type AuthState = {
  /** JWT বা null */
  token: string | null;
  /** localStorage থেকে লোডিং শেষ হয়েছে কি না */
  isHydrated: boolean;
};

const initialState: AuthState = {
  token: null,
  isHydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /** লগইনের পর টোকেন সেট/আপডেট */
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
      state.isHydrated = true;
      if (typeof window !== "undefined") {
        if (action.payload) {
          localStorage.setItem("accessToken", action.payload);
        } else {
          localStorage.removeItem("accessToken");
        }
      }
    },
    /** অ্যাপ লোডে localStorage → স্টোর */
    hydrateFromStorage(state) {
      if (typeof window !== "undefined") {
        const t = localStorage.getItem("accessToken");
        state.token = t ? t : null;
      }
      state.isHydrated = true;
    },
    /** লগআউট */
    logout(state) {
      state.token = null;
      state.isHydrated = true;
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }
    },
  },
});

export const { setToken, hydrateFromStorage, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;

/** Selectors */
export const selectToken = (root: { auth: AuthState }) => root.auth.token;
export const selectIsAuthed = (root: { auth: AuthState }) =>
  Boolean(root.auth.token);
export const selectIsAuthHydrated = (root: { auth: AuthState }) =>
  root.auth.isHydrated;
