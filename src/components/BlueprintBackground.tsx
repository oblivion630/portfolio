"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function BlueprintBackground({ animated = true }: { animated: boolean }) {
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        // Set initial size
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });

        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (windowSize.width === 0) return null; // Prevent hydration mismatch

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Base Grids */}
            <div className="absolute inset-0 bg-blueprint-grid opacity-30" />
            <div className="absolute inset-0 bg-blueprint-grid-lg opacity-20" />

            {/* Decorative Blueprint Elements (SVGs) */}
            <svg className="absolute w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="diagonal-hatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="0" x2="0" y2="10" className="stroke-blueprint-grid" strokeWidth="1" />
                    </pattern>
                </defs>

                {/* Decorative corner markers */}
                <path d="M 50 50 L 50 100 M 50 50 L 100 50" stroke="currentColor" className="text-blueprint-accent" fill="none" strokeWidth="2" />
                <path d="M 50 50 L 60 60" stroke="currentColor" className="text-blueprint-accent" fill="none" strokeWidth="1" />
                <text x="60" y="45" className="fill-blueprint-accent text-[10px] font-mono tracking-widest">FIG. 01-A</text>

                <path d={`M ${windowSize.width - 50} 50 L ${windowSize.width - 50} 100 M ${windowSize.width - 50} 50 L ${windowSize.width - 100} 50`} stroke="currentColor" className="text-blueprint-accent" fill="none" strokeWidth="2" />

                {/* Animated Pipes (Simple flows) */}
                {animated && (
                    <>
                        {/* Vertical Pipe Left */}
                        <motion.path
                            d={`M 150 0 L 150 ${windowSize.height}`}
                            stroke="url(#pipe-gradient-v)"
                            strokeWidth="2"
                            fill="none"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.2 }}
                            transition={{ duration: 3, ease: "easeInOut" }}
                        />

                        {/* Vertical Pipe Right */}
                        <motion.path
                            d={`M ${windowSize.width - 150} 0 L ${windowSize.width - 150} ${windowSize.height}`}
                            stroke="url(#pipe-gradient-v)"
                            strokeWidth="2"
                            fill="none"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.2 }}
                            transition={{ duration: 3, ease: "easeInOut", delay: 0.5 }}
                        />
                    </>
                )}

                <defs>
                    <linearGradient id="pipe-gradient-v" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#0a192f" stopOpacity="0" />
                        <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#0a192f" stopOpacity="0" />
                    </linearGradient>
                </defs>

            </svg>

            {/* Blur Vignette */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-blueprint-bg opacity-80" />
        </div>
    );
}
