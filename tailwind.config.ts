import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Zen Precision tokens (direct CSS var references)
        bg: {
          primary: "var(--bg-primary)",
        },
        surface: {
          1: "var(--surface-1)",
          2: "var(--surface-2)",
          3: "var(--surface-3-callout)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          disabled: "var(--text-disabled)",
        },
        accent: {
          primary: "var(--accent-primary)",
        },
        semantic: {
          success: "var(--semantic-success)",
          warning: "var(--semantic-warning)",
          alert: "var(--semantic-alert)",
        },
        divider: "var(--divider)",
        overlay: {
          press: "var(--overlay-press)",
          backdrop: "var(--overlay-backdrop)",
        },

        // Legacy compatibility
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        DEFAULT: "var(--radius)",
      },
      fontSize: {
        display: ["28px", { lineHeight: "1.4", fontWeight: "600" }],
        title: ["22px", { lineHeight: "1.4", fontWeight: "500" }],
        section: ["18px", { lineHeight: "1.5", fontWeight: "500" }],
        body: ["17px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-sm": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        meta: ["15px", { lineHeight: "1.5", fontWeight: "500" }],
        "meta-sm": ["14px", { lineHeight: "1.5", fontWeight: "500" }],
      },
      transitionDuration: {
        fast: "var(--motion-fast)",
        base: "var(--motion-base)",
        slow: "var(--motion-slow)",
      },
      transitionTimingFunction: {
        standard: "var(--easing-standard)",
        decelerate: "var(--easing-decelerate)",
        accelerate: "var(--easing-accelerate)",
      },
      minHeight: {
        "tap-target": "48px",
      },
      minWidth: {
        "tap-target": "48px",
      },
    },
  },
  plugins: [],
};

export default config;
