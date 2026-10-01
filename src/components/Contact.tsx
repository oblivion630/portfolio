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
        <Section id="contact" title="Let's talk" eyebrow="Contact">
            <p className="text-lg text-body mb-8 max-w-2xl">
                Open to full-time new graduate roles in process engineering, metallurgy, and R&D, and available to start now.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {links.map(({ href, icon: Icon, label, value, external }) => (
                    <a
                        key={label}
                        href={href}
                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="flex items-center gap-4 p-5 bg-white border border-line rounded-xl hover:border-accent hover:shadow-md transition-all group"
                    >
                        <div className="w-11 h-11 flex items-center justify-center rounded-full bg-accent-soft text-accent flex-shrink-0">
                            <Icon size={20} />
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</div>
                            <div className="font-medium text-ink group-hover:text-accent truncate">{value}</div>
                        </div>
                    </a>
                ))}
            </div>
        </Section>
    );
}
