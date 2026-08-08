import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#4CAF50",
          dark: "#2E7D32",
          light: "#A5D6A7",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
