import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // 🚀 將 NotoSerifTC 放在第一順位，它是我們的主力字體
        sans: ["NotoSerifTC", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    }
  },
  plugins: []
};

export default config;