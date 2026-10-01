import React from 'react';
import { Project } from '@/data/profile';
import { ArrowUpRight } from 'lucide-react';

interface ProjectCardProps {
    project: Project;
    onClick: (project: Project) => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
    return (
        <button
            type="button"
            onClick={() => onClick(project)}
            className="group text-left bg-white border border-line rounded-xl p-6 h-full flex flex-col hover:border-accent hover:shadow-lg transition-all"
        >
            <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-accent bg-accent-soft px-2.5 py-1 rounded-full">
                    {project.category}
                </span>
                <ArrowUpRight size={18} className="text-muted group-hover:text-accent transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-ink mb-2">{project.title}</h3>
            <p className="text-body leading-relaxed mb-5">{project.impact}</p>

            <div className="mt-auto flex flex-wrap gap-2">
                {project.tools.map(tool => (
                    <span key={tool} className="text-xs text-muted bg-paper border border-line px-2 py-1 rounded">
                        {tool}
                    </span>
                ))}
            </div>
            <span className="mt-5 text-sm font-semibold text-accent group-hover:underline">View details{project.links?.length ? " & reports" : ""} →</span>
        </button>
    );
}
