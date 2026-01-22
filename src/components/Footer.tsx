import React from 'react';

export default function Footer() {
    return (
        <footer className="py-8 border-t border-blueprint-grid bg-blueprint-bg">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <p className="text-gray-500 font-mono text-sm">
                    © {new Date().getFullYear()} Chemical Engineering Portfolio. Designed with <span className="text-blueprint-accent">Next.js</span> & <span className="text-blueprint-accent">Tailwind</span>.
                </p>
                <div className="mt-2 text-[10px] text-gray-700 font-mono">
                    SYSTEM_STATUS: NOMINAL // RENDER_TIME: {Date.now()}
                </div>
            </div>
        </footer>
    );
}
