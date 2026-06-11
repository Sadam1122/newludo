import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./server/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ludo: {
          black: "#050505",
          charcoal: "#111111",
          red: "#EF1F28",
          gold: "#F7C600",
          green: "#25D366",
          ink: "#F8EDE7",
          muted: "#A3A3A3",
          border: "#2A2A2A",
        },
      },
      boxShadow: {
        panel: "0 20px 70px rgba(0, 0, 0, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
