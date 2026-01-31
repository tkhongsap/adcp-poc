import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Claude.ai-inspired color palette
        claude: {
          cream: "#F5F4EF",
          orange: "#DA7756",
          "text-primary": "#1A1915",
          "text-secondary": "#5D5D5A",
          border: "#E5E4DF",
          "border-light": "#EEEEE8",
          sidebar: "#1A1915",
          "user-bubble": "#E8E7E2",
        },
      },
    },
  },
  plugins: [],
};
export default config;
