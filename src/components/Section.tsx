import React from 'react';

interface SectionProps {
    id: string;
    title: string;
    eyebrow?: string;
    children: React.ReactNode;
    className?: string;
}

export default function Section({ id, title, eyebrow, children, className = "" }: SectionProps) {
    return (
        <section id={id} className={`py-16 md:py-24 border-t border-line ${className}`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="mb-10">
                    {eyebrow && (
                        <div className="text-xs font-semibold tracking-[0.18em] uppercase text-accent mb-2">{eyebrow}</div>
                    )}
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-ink">{title}</h2>
                </div>
                {children}
            </div>
        </section>
    );
}
