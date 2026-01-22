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
                blueprint: {
                    bg: "#050A14", // Very deep navy, almost black
                    grid: "#0A1F35", // Slightly lighter for grid lines
                    card: "#0B1626", // Card background
                    text: "#E2E8F0", // Slate 200 for readable text
                    accent: "#38BDF8", // Sky 400 - Main blueprint lines
                    highlight: "#2DD4BF", // Teal 400 - Secondary accents
                    muted: "#94A3B8", // Slate 400 - Secondary text
                }
            },
            fontFamily: {
                mono: ['var(--font-jetbrains-mono)', 'monospace'],
                sans: ['var(--font-inter)', 'sans-serif'],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [],
};
export default config;
