/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ["'Playfair Display'", "serif"],
        sans: ["system-ui", "sans-serif"],
      },
      colors: {
        teal: {
          50: "#f0fdf9",
          100: "#d0f5f0",
          200: "#a5ebe8",
          300: "#6ba8a3",
          400: "#4a8d8a",
          500: "#2d7671",
          600: "#1f5f59",
          700: "#174943",
          800: "#0f3530",
          900: "#0a2622",
          950: "#051e1b",
        },
        amber: {
          50: "#f5eee5",
          100: "#f0e6d6",
          200: "#e8d5bc",
          300: "#dfc2a3",
          400: "#d4a574",
          500: "#c98a51",
          600: "#b8753f",
          700: "#9d6535",
          800: "#7d552c",
          900: "#5c4224",
        },
      },
      boxShadow: {
        subtle: "0 2px 8px rgba(0, 0, 0, 0.05)",
        soft: "0 4px 12px rgba(0, 0, 0, 0.08)",
      },
      backgroundImage: {
        "gradient-lacani": "linear-gradient(135deg, #f0fdf9 0%, #fff 50%, #f5eee5 100%)",
      },
    },
  },
  plugins: [],
}
