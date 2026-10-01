"use client";

import React, { useState } from 'react';
import Section from './Section';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';
import { Profile, Project } from '@/data/profile';

export default function Projects({ profile }: { profile: Profile }) {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    return (
        <Section id="projects" title="Projects" eyebrow="Design work">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile.projects.map(project => (
                    <ProjectCard key={project.id} project={project} onClick={setSelectedProject} />
                ))}
            </div>

            <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
        </Section>
    );
}
