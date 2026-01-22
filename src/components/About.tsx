import React from 'react';
import Section from './Section';
import { Profile } from '@/data/profile';
import { MapPin, GraduationCap, Calendar, Zap } from 'lucide-react';

export default function About({ profile }: { profile: Profile }) {
    return (
        <Section id="about" title="About">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Text */}
                <div className="md:col-span-2 space-y-6 text-gray-300 leading-relaxed font-light">
                    <p className="text-lg">{profile.about.summary}</p>

                    <div className="space-y-2">
                        <h3 className="font-mono text-blueprint-highlight text-sm uppercase mb-3">Core Competencies</h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {profile.about.highlights.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                    <div className="mt-1.5 w-1.5 h-1.5 bg-blueprint-accent rounded-sm" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Quick Specs Card */}
                <div className="bg-blueprint-card/50 border border-blueprint-grid p-6 rounded-lg backdrop-blur-sm h-fit">
                    <h3 className="font-mono text-white text-lg mb-4 border-b border-blueprint-grid pb-2"> // SPEC_SHEET</h3>

                    <div className="space-y-4 font-mono text-sm">
                        <div className="flex items-center gap-3 text-gray-400">
                            <MapPin size={16} className="text-blueprint-accent" />
                            <span>{profile.location}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400">
                            <GraduationCap size={16} className="text-blueprint-accent" />
                            <div>
                                <div className="text-white">{profile.about.education.degree}</div>
                                <div className="text-xs text-gray-500">{profile.about.education.school}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400">
                            <Calendar size={16} className="text-blueprint-accent" />
                            <span>{profile.about.education.graduation}</span>
                        </div>
                        <div className="flex items-start gap-3 text-gray-400 pt-2 border-t border-blueprint-grid/50 mt-2">
                            <Zap size={16} className="text-blueprint-highlight mt-1" />
                            <div className="text-xs">
                                Interests: Process Safety, Renewable Energy, Automation
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );
}
