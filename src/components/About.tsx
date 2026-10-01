import React from 'react';
import Section from './Section';
import { Profile } from '@/data/profile';
import { MapPin, GraduationCap, Briefcase, Target } from 'lucide-react';

export default function About({ profile }: { profile: Profile }) {
    const current = profile.experience[0];
    const facts = [
        { icon: GraduationCap, label: profile.about.education.degree, sub: `${profile.about.education.school} · ${profile.about.education.graduation}` },
        { icon: Briefcase, label: current.role, sub: `${current.company} · ${current.date}` },
        { icon: MapPin, label: "Location", sub: profile.location },
        { icon: Target, label: "Interests", sub: "Hydrometallurgy, Battery Recycling, Process Design, Process Safety" },
    ];

    return (
        <Section id="about" title="About" eyebrow="Profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    <p className="text-lg leading-relaxed text-body">{profile.about.summary}</p>

                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink mb-4">Core competencies</h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {profile.about.highlights.map((item) => (
                                <li key={item} className="flex items-start gap-3 p-3 rounded-lg bg-white border border-line text-sm text-body">
                                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <aside className="rounded-xl bg-white border border-line p-6 h-fit space-y-5">
                    {facts.map(({ icon: Icon, label, sub }) => (
                        <div key={label} className="flex gap-3">
                            <Icon size={18} className="text-accent mt-0.5 flex-shrink-0" />
                            <div>
                                <div className="font-medium text-ink">{label}</div>
                                <div className="text-sm text-muted">{sub}</div>
                            </div>
                        </div>
                    ))}
                </aside>
            </div>
        </Section>
    );
}
