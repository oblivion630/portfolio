"use client";

import React, { useState } from 'react';
import Section from './Section';
import { Profile } from '@/data/profile';
import { Mail, Linkedin, Send } from 'lucide-react';

export default function Contact({ profile }: { profile: Profile }) {
    // Simple form state (no backend connected as per requirements, just aesthetic)
    const [formState, setFormState] = useState<'idle' | 'sending' | 'sent'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormState('sending');
        // Simulate send
        setTimeout(() => {
            setFormState('sent');
            // In a real app, this would send data.
            // Fallback to mailto is handled by a button if this is just "front-end only"
            window.location.href = `mailto:${profile.email}?subject=Contact from Portfolio`;
        }, 1000);
    };

    return (
        <Section id="contact" title="Initialize Contact">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                {/* Info */}
                <div className="space-y-6">
                    <p className="text-gray-300 text-lg">
                        Currently open to new opportunities in Process Engineering, R&D, and Data Analysis.
                    </p>

                    <div className="space-y-4">
                        <a
                            href={`mailto:${profile.email}`}
                            className="flex items-center gap-4 p-4 bg-blueprint-card border border-blueprint-grid rounded hover:border-blueprint-accent transition-all group"
                        >
                            <div className="w-10 h-10 flex items-center justify-center bg-blueprint-bg border border-blueprint-grid rounded-full text-blueprint-accent group-hover:scale-110 transition-transform">
                                <Mail size={20} />
                            </div>
                            <div>
                                <div className="text-xs font-mono text-gray-500 uppercase">Email Protocol</div>
                                <div className="text-white group-hover:text-blueprint-highlight">{profile.email}</div>
                            </div>
                        </a>

                        <a
                            href={profile.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 bg-blueprint-card border border-blueprint-grid rounded hover:border-blueprint-accent transition-all group"
                        >
                            <div className="w-10 h-10 flex items-center justify-center bg-blueprint-bg border border-blueprint-grid rounded-full text-blueprint-accent group-hover:scale-110 transition-transform">
                                <Linkedin size={20} />
                            </div>
                            <div>
                                <div className="text-xs font-mono text-gray-500 uppercase">Professional Network</div>
                                <div className="text-white group-hover:text-blueprint-highlight">Connect on LinkedIn</div>
                            </div>
                        </a>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-blueprint-card/50 p-6 rounded border border-blueprint-grid backdrop-blur-sm space-y-4">
                    <div>
                        <label className="block text-xs font-mono text-blueprint-highlight mb-1">ID (Name)</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-blueprint-bg border border-blueprint-grid rounded px-4 py-2 text-white focus:outline-none focus:border-blueprint-accent transition-colors"
                            placeholder="Enter name..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-mono text-blueprint-highlight mb-1">Signal (Email)</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-blueprint-bg border border-blueprint-grid rounded px-4 py-2 text-white focus:outline-none focus:border-blueprint-accent transition-colors"
                            placeholder="Enter email..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-mono text-blueprint-highlight mb-1">Payload (Message)</label>
                        <textarea
                            required
                            rows={4}
                            className="w-full bg-blueprint-bg border border-blueprint-grid rounded px-4 py-2 text-white focus:outline-none focus:border-blueprint-accent transition-colors resize-none"
                            placeholder="Enter message..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={formState !== 'idle'}
                        className="w-full py-3 bg-blueprint-accent text-blueprint-bg font-bold rounded hover:bg-blueprint-highlight transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {formState === 'idle' && <><Send size={18} /> TRANSMIT_MESSAGE</>}
                        {formState === 'sending' && "TRANSMITTING..."}
                        {formState === 'sent' && "TRANSMISSION_COMPLETE"}
                    </button>
                </form>
            </div>
        </Section>
    );
}
