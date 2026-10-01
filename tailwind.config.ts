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
                ink: "#0F172A",      // Headings and primary text
                body: "#334155",     // Paragraph text
                muted: "#64748B",    // Secondary text
                line: "#E2E8F0",     // Borders and dividers
                paper: "#F8FAFC",    // Page background
                accent: {
                    DEFAULT: "#0E7490", // Deep process teal
                    dark: "#155E75",
                    soft: "#ECFEFF",
                },
            },
            fontFamily: {
                mono: ['var(--font-jetbrains-mono)', 'monospace'],
                sans: ['var(--font-inter)', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
export default config;
