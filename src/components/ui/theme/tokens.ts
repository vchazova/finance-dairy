export const tokens = {
  radius: "rounded-2xl",
  focusButton:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(var(--color-primary))]/60",
  focusInput:
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-[hsl(var(--color-primary))]/40 focus-visible:border-[hsl(var(--color-primary))]",
  disabled:
    "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
  shadow: "shadow-sm",

  color: {
    fg: "[hsl(var(--fg))]",
    fgMuted: "[hsl(var(--fg-muted))]",
    bg: "[hsl(var(--bg))]",
    card: "[hsl(var(--card))]",
    border: "[hsl(var(--border))]",
    primary: "[hsl(var(--color-primary))]",
    primaryFg: "[hsl(var(--color-primary-fg))]",
    secondary: "[hsl(var(--color-secondary))]",
    secondaryFg: "[hsl(var(--color-secondary-fg))]",
    success: "[hsl(var(--color-success))]",
    warning: "[hsl(var(--color-warning))]",
    info: "[hsl(var(--color-info))]",
    danger: "[hsl(var(--color-danger))]",
  },
};
