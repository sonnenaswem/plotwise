import type { Config } from "tailwindcss";
 
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"],
      },
      colors: {
        brand: {
          navy:       "#0D2137",
          lime:       "#A3E635",
          "lime-dark":  "#639922",
          "lime-deep":  "#3B6D11",
          "lime-muted": "#EAF3DE",
        },
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #0D2137 0%, #0E7490 100%)",
      },
    },
  },
  plugins: [],
};
 
export default config;