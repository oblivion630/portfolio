"use client";

import React, { useState, useMemo } from 'react';
import Section from './Section';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';
import { Profile, Project } from '@/data/profile';
import { Filter } from 'lucide-react';

export default function Projects({ profile }: { profile: Profile }) {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [filter, setFilter] = useState("All");

    // Extract unique categories
    const categories = useMemo(() => {
        const cats = new Set(profile.projects.map(p => p.category));
        return ["All", ...Array.from(cats)];
    }, [profile.projects]);

    // Featured Projects
    const featuredProjects = profile.projects.filter(p => p.featured);

    // Filtered Projects (excluding featured if we want to separate them, or just all matching filter?)
    // Let's show filtered list below.
    const filteredProjects = profile.projects.filter(p => {
        if (filter === "All") return true;
        return p.category === filter;
    });

    return (
        <Section id="projects" title="Operations">



            {/* Filterable Archive */}
            <div>
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-blueprint-grid pb-4 gap-4">
                    <h3 className="text-xl font-mono text-white flex items-center gap-2">
                        PROJECT_ARCHIVE
                    </h3>

                    {/* Filter Chips */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        <div className="flex items-center gap-2 text-gray-500 mr-2">
                            <Filter size={14} />
                            <span className="text-xs font-mono uppercase">Filter:</span>
                        </div>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-3 py-1 text-xs font-mono rounded transition-all border ${filter === cat
                                    ? 'bg-blueprint-accent/20 border-blueprint-accent text-blueprint-accent'
                                    : 'bg-transparent border-blueprint-grid text-gray-400 hover:border-gray-500'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map(project => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onClick={setSelectedProject}
                        />
                    ))}
                    {filteredProjects.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500 font-mono">
                            No modules found with parameter: {filter}
                        </div>
                    )}
                </div>
            </div>

            <ProjectModal
                project={selectedProject}
                onClose={() => setSelectedProject(null)}
            />
        </Section>
    );
}
