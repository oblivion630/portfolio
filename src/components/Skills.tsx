import React from 'react';
import Section from './Section';
import { Profile } from '@/data/profile';

export default function Skills({ profile }: { profile: Profile }) {
    return (
        <Section id="skills" title="Skills" eyebrow="Technical toolkit" className="bg-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {profile.skills.map((skillGroup) => (
                    <div key={skillGroup.category} className="rounded-xl border border-line bg-paper p-6">
                        <h3 className="font-semibold text-ink mb-4">{skillGroup.category}</h3>
                        <div className="flex flex-wrap gap-2">
                            {skillGroup.items.map((skill) => (
                                <span key={skill} className="px-3 py-1.5 bg-white border border-line text-body text-sm rounded-md">
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
