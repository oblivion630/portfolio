"use client";

import React from 'react';
import { Project } from '@/data/profile';
import { ArrowUpRight } from 'lucide-react';

interface ProjectCardProps {
    project: Project;
    onClick: (project: Project) => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
    return (
        <div
            onClick={() => onClick(project)}
            className="group relative bg-blueprint-card border border-blueprint-grid p-6 rounded hover:border-blueprint-accent transition-all cursor-pointer h-full flex flex-col hover:shadow-[0_0_15px_rgba(56,189,248,0.1)]"
        >
            {/* Tech Corners */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blueprint-grid group-hover:border-blueprint-accent transition-colors" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-blueprint-grid group-hover:border-blueprint-accent transition-colors" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-blueprint-grid group-hover:border-blueprint-accent transition-colors" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-blueprint-grid group-hover:border-blueprint-accent transition-colors" />

            {/* Content */}
            <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-blueprint-highlight uppercase tracking-wider bg-blueprint-highlight/10 px-2 py-0.5 rounded">
                        {project.category}
                    </span>
                    <ArrowUpRight size={16} className="text-gray-500 group-hover:text-blueprint-accent transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-100 group-hover:text-white mb-2 line-clamp-2">
                    {project.title}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-3 mb-4">
                    {project.impact}
                </p>
            </div>

            {/* Footer */}
            <div className="mt-auto">
                <div className="flex flex-wrap gap-2 text-xs font-mono text-gray-500">
                    {project.tools.slice(0, 3).map(tool => (
                        <span key={tool} className="border-b border-gray-700 pb-0.5">
                            {tool}
                        </span>
                    ))}
                    {project.tools.length > 3 && <span>+{project.tools.length - 3}</span>}
                </div>
            </div>
        </div>
    );
}
