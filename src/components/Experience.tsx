"use client";

import React from 'react';
import Section from './Section';
import { Profile } from '@/data/profile';
import { Briefcase } from 'lucide-react';

export default function Experience({ profile }: { profile: Profile }) {
    return (
        <Section id="experience" title="Experience">
            <div className="space-y-12">
                {profile.experience.map((exp, index) => (
                    <div key={exp.id} className="relative pl-8 md:pl-0">

                        {/* Timeline Line (Desktop: Center) - simplifying to left aligned for better mobile/desktop consistency in this aesthetic */}
                        <div className="absolute left-0 top-0 bottom-0 w-px bg-blueprint-grid md:left-[17px]"></div>

                        <div className="relative flex flex-col md:flex-row gap-8 items-start group">
                            {/* Node on timeline */}
                            <div className="absolute left-[-4px] top-1.5 w-[9px] h-[9px] rounded-full bg-blueprint-bg border-2 border-blueprint-grid group-hover:border-blueprint-accent transition-colors md:left-[13px] z-10" />

                            <div className="md:w-full space-y-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                    <div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-blueprint-highlight transition-colors">
                                            {exp.role}
                                        </h3>
                                        <div className="text-blueprint-accent font-mono text-sm">
                                            {exp.company}
                                        </div>
                                    </div>
                                    <div className="font-mono text-gray-400 text-sm bg-blueprint-card/50 px-3 py-1 rounded border border-blueprint-grid">
                                        {exp.date} | {exp.location}
                                    </div>
                                </div>

                                <ul className="space-y-2">
                                    {exp.bullets.map((bullet, i) => (
                                        <li key={i} className="text-gray-300 text-sm flex gap-3">
                                            <span className="text-blueprint-grid mt-1.5 w-1 h-1 bg-current rounded-full flex-shrink-0" />
                                            {bullet}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    );
}
