"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Download, Linkedin, Mail, ExternalLink } from 'lucide-react';
import { Profile } from '@/data/profile';

export default function Hero({ profile, animated }: { profile: Profile; animated: boolean }) {

    return (
        <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full z-10">

                {/* Left: Content */}
                <div className="flex flex-col space-y-6">
                    <div className="inline-flex items-center space-x-2 text-blueprint-highlight">
                        <span className="w-2 h-2 bg-current rounded-full animate-pulse" />
                        <span className="font-mono text-sm tracking-widest uppercase">Process Status: Online</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
                        {profile.name}
                    </h1>
                    <h2 className="text-xl md:text-2xl font-mono text-gray-400">
                        {profile.title}
                    </h2>
                    <p className="max-w-lg text-lg text-gray-300 border-l-2 border-blueprint-accent pl-4">
                        {profile.tagline}
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <a
                            href={profile.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-6 py-3 bg-blueprint-accent text-blueprint-bg font-bold rounded hover:bg-blueprint-highlight transition-all"
                        >
                            <Download size={18} /> Resume
                        </a>
                        <a
                            href={profile.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-6 py-3 border border-blueprint-grid text-gray-300 hover:border-blueprint-accent hover:text-white transition-all rounded"
                        >
                            <Linkedin size={18} /> LinkedIn
                        </a>
                        <a
                            href={`mailto:${profile.email}`}
                            className="flex items-center gap-2 px-6 py-3 border border-blueprint-grid text-gray-300 hover:border-blueprint-accent hover:text-white transition-all rounded"
                        >
                            <Mail size={18} /> Email
                        </a>
                    </div>
                </div>

                {/* Right: Complex PFD Image */}
                <div className="relative h-[400px] lg:h-[500px] w-full flex items-center justify-center border border-blueprint-grid/30 rounded-lg bg-blueprint-card/20 backdrop-blur-sm tech-border p-2 overflow-hidden group">
                    <img
                        src="/hero-pfd-final.jpg"
                        alt="Process Flow Diagram"
                        className="w-full h-full object-contain opacity-90 group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-4 right-4 text-[10px] font-mono text-blueprint-highlight/80 border border-blueprint-highlight/30 px-2 py-1 bg-black/40 backdrop-blur-md">
                        SYSTEM_ID: PFD-8X-2026
                    </div>
                </div>
            </div>
        </section>
    );
}
