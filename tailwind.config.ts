import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        organic: {
          50: "#f1f7ed",
          100: "#e3f1e8",
          200: "#d9ebdf",
          600: "#2d6a4f",
          700: "#1b4332",
        },
      },
      container: { center: true, padding: "1rem" },
      borderRadius: { "2xl": "1rem" },
    },
  },
  plugins: [],
};
export default config;
