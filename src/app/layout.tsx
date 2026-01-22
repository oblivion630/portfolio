import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-jetbrains-mono',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Chemical Engineering Portfolio | Process Design & Optimization',
    description: 'Portfolio of a Final Year Chemical Engineering Student specializing in process design, kinetics, and sustainable technologies.',
    openGraph: {
        title: 'Chemical Engineering Portfolio',
        description: 'Process Design, Research, and Engineering Projects',
        type: 'website',
    }
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="scroll-smooth">
            <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-blueprint-bg text-slate-200 antialiased selection:bg-blueprint-accent/30 selection:text-white`}>
                {children}
            </body>
        </html>
    );
}
