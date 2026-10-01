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
    title: 'Hekmat Kawas | Chemical Engineering – Process & Metallurgy',
    description: 'Hekmat Kawas — Chemical Engineering (TMU, Dec 2026) and Junior Metallurgist. Open to new graduate roles in process engineering, metallurgy, and R&D.',
    openGraph: {
        title: 'Hekmat Kawas | Chemical Engineering Portfolio',
        description: 'Open to new graduate roles in process engineering, metallurgy, and R&D.',
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
            <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased selection:bg-accent/20`}>
                {children}
            </body>
        </html>
    );
}
