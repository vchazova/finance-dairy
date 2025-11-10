import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", "[data-theme='dark']"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "hsl(var(--bg))",
        card: "hsl(var(--card))",
        border: "hsl(var(--border))",
        fg: "hsl(var(--fg))",
        "fg-muted": "hsl(var(--fg-muted))",
        primary: "hsl(var(--color-primary))",
        "primary-fg": "hsl(var(--color-primary-fg))",
        secondary: "hsl(var(--color-secondary))",
        "secondary-fg": "hsl(var(--color-secondary-fg))",
        info: "hsl(var(--color-info))",
        success: "hsl(var(--color-success))",
        warning: "hsl(var(--color-warning))",
        danger: "hsl(var(--color-danger))",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};
export default config;
