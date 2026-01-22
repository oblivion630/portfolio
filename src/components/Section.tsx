"use client";

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface SectionProps {
    id: string;
    title: string;
    children: React.ReactNode;
    className?: string;
}

export default function Section({ id, title, children, className = "" }: SectionProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });

    return (
        <section id={id} ref={ref} className={`py-20 relative ${className}`}>
            <div className="max-w-7xl mx-auto px-6">
                {/* Header with Valve Animation */}
                <div className="flex items-center gap-4 mb-12">
                    <motion.div
                        className="relative w-12 h-12 flex items-center justify-center border border-blueprint-accent rounded-full text-blueprint-accent"
                        initial={{ rotate: 0 }}
                        animate={isInView ? { rotate: 90 } : { rotate: 0 }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                    >
                        {/* Valve Icon */}
                        <div className="w-1 h-8 bg-current absolute" />
                        <div className="w-8 h-1 bg-current absolute" />
                        <div className="w-4 h-4 bg-blueprint-bg z-10 rounded-full border border-current" />
                    </motion.div>

                    <h2 className="text-3xl font-mono font-bold text-white tracking-widest uppercase">
                        {title}
                        <motion.span
                            className="block h-1 bg-blueprint-accent mt-2"
                            initial={{ width: 0 }}
                            animate={isInView ? { width: '100%' } : { width: 0 }}
                            transition={{ duration: 1, delay: 0.5 }}
                        />
                    </h2>

                    <div className="flex-1 h-px bg-blueprint-grid ml-4 opactiy-50" />
                    <span className="font-mono text-gray-600 text-sm">SEC-{title.substring(0, 3).toUpperCase()}</span>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {children}
                </motion.div>
            </div>
        </section>
    );
}
