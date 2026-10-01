import React from 'react';
import { Download, Linkedin, Mail } from 'lucide-react';
import { Profile } from '@/data/profile';
import PipeName from './PipeName';

export default function Hero({ profile }: { profile: Profile }) {
    return (
        <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 bg-white bg-grid-paper">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 items-center">

                    {/* Left: Pitch */}
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 animate-ping" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                            Open to work · New grad roles · Available now
                        </div>

                        <h1>
                            <span className="sr-only">{profile.name}</span>
                            <PipeName name={profile.name} />
                        </h1>
                        <p className="text-xl md:text-2xl font-medium text-accent">
                            {profile.title}
                        </p>
                        <p className="max-w-xl text-lg leading-relaxed text-body">
                            {profile.tagline}
                        </p>

                        <div className="flex flex-wrap gap-3 pt-2">
                            <a
                                href={profile.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-5 py-3 rounded-md bg-accent text-white font-semibold hover:bg-accent-dark transition-colors"
                            >
                                <Download size={18} /> Download Resume
                            </a>
                            <a
                                href={profile.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-5 py-3 rounded-md border border-line bg-white text-ink font-medium hover:border-accent hover:text-accent transition-colors"
                            >
                                <Linkedin size={18} /> LinkedIn
                            </a>
                            <a
                                href={`mailto:${profile.email}`}
                                className="flex items-center gap-2 px-5 py-3 rounded-md border border-line bg-white text-ink font-medium hover:border-accent hover:text-accent transition-colors"
                            >
                                <Mail size={18} /> Email
                            </a>
                        </div>
                    </div>

                    {/* Right: Process flow image */}
                    <figure className="rounded-xl overflow-hidden border border-slate-800 bg-[#0B1626] shadow-xl">
                        <img
                            src="/hero-pfd-final.jpg"
                            alt="Process flow diagram illustration"
                            className="w-full h-auto"
                        />
                    </figure>
                </div>

                {/* Key numbers */}
                <dl className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-px rounded-xl overflow-hidden border border-line bg-line">
                    {profile.stats.map((stat) => (
                        <div key={stat.label} className="bg-white p-5 md:p-6">
                            <dt className="sr-only">{stat.label}</dt>
                            <dd className="text-2xl md:text-3xl font-bold tracking-tight text-ink">{stat.value}</dd>
                            <dd className="mt-1 text-sm leading-snug text-muted">{stat.label}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}
