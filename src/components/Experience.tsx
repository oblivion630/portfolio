import React from 'react';
import Section from './Section';
import { Profile } from '@/data/profile';

export default function Experience({ profile }: { profile: Profile }) {
    return (
        <Section id="experience" title="Experience" eyebrow="Work history" className="bg-white">
            <ol className="relative border-l-2 border-line ml-1.5 space-y-12">
                {profile.experience.map((exp, index) => (
                    <li key={exp.id} className="pl-8 relative">
                        <span className={`absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-white ${index === 0 ? 'bg-accent ring-4 ring-accent-soft' : 'bg-slate-300'}`} />

                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 md:gap-6 mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-ink">{exp.role}</h3>
                                <div className="text-accent font-semibold">{exp.company}</div>
                            </div>
                            <div className="text-sm text-muted md:text-right whitespace-nowrap">
                                <div className="font-medium text-body">{exp.date}</div>
                                <div>{exp.location}</div>
                            </div>
                        </div>

                        <ul className="space-y-2.5">
                            {exp.bullets.map((bullet, i) => (
                                <li key={i} className="flex gap-3 text-body leading-relaxed">
                                    <span className="mt-2.5 h-1 w-1 rounded-full bg-muted flex-shrink-0" />
                                    {bullet}
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ol>
        </Section>
    );
}
