"use client";

import React from 'react';
import Section from './Section';
import { Profile } from '@/data/profile';

export default function Skills({ profile }: { profile: Profile }) {
    return (
        <Section id="skills" title="Technical Specs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {profile.skills.map((skillGroup) => (
                    <div key={skillGroup.category} className="bg-blueprint-card/30 border border-blueprint-grid p-6 rounded hover:border-blueprint-accent/50 transition-colors">
                        <h3 className="font-mono text-blueprint-highlight mb-4 uppercase tracking-wider text-sm border-b border-blueprint-grid/50 pb-2 inline-block">
                            {skillGroup.category}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {skillGroup.items.map((skill) => (
                                <span
                                    key={skill}
                                    className="px-3 py-1.5 bg-blueprint-bg border border-blueprint-grid text-gray-300 text-sm rounded hover:text-white hover:border-blueprint-accent transition-all cursor-default"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    );
}
