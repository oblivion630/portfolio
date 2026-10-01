import React from 'react';
import Section from './Section';
import { Profile } from '@/data/profile';
import { Mail, Linkedin, FileText } from 'lucide-react';

export default function Contact({ profile }: { profile: Profile }) {
    const links = [
        { href: `mailto:${profile.email}`, icon: Mail, label: "Email", value: profile.email },
        { href: profile.linkedin, icon: Linkedin, label: "LinkedIn", value: "Connect on LinkedIn", external: true },
        { href: profile.resumeUrl, icon: FileText, label: "Resume", value: "Download PDF", external: true },
    ];

    return (
        <Section id="contact" title="Contact">
            <p className="text-gray-300 text-lg mb-8 max-w-2xl">
                Open to full-time new graduate roles in process engineering, metallurgy, and R&D, and available to start now.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {links.map(({ href, icon: Icon, label, value, external }) => (
                    <a
                        key={label}
                        href={href}
                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="flex items-center gap-4 p-4 bg-blueprint-card border border-blueprint-grid rounded hover:border-blueprint-accent transition-all group"
                    >
                        <div className="w-10 h-10 flex items-center justify-center bg-blueprint-bg border border-blueprint-grid rounded-full text-blueprint-accent">
                            <Icon size={20} />
                        </div>
                        <div>
                            <div className="text-xs font-mono text-gray-500 uppercase">{label}</div>
                            <div className="text-white group-hover:text-blueprint-highlight">{value}</div>
                        </div>
                    </a>
                ))}
            </div>
        </Section>
    );
}
