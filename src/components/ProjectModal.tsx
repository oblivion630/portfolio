"use client";

import React, { useEffect } from 'react';
import { X, FileText, CheckCircle } from 'lucide-react';
import { Project } from '@/data/profile';

interface ProjectModalProps {
    project: Project | null;
    onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!project) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="project-title"
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-xl shadow-2xl"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-line flex justify-between items-start gap-4">
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-accent">{project.category}</div>
                        <h2 id="project-title" className="text-xl font-bold text-ink">{project.title}</h2>
                    </div>
                    <button onClick={onClose} aria-label="Close" className="p-1.5 -mr-1.5 text-muted hover:text-ink rounded-full hover:bg-paper">
                        <X size={20} />
                    </button>
                </div>

                {/* Body: story on the left, tools and documents on the right */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-[1fr_220px] gap-6 text-sm">
                    <div className="space-y-5">
                        <p className="text-body leading-relaxed">{project.description}</p>

                        {(project.problem || project.solution || project.results) && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[["Problem", project.problem], ["Solution", project.solution], ["Results", project.results]]
                                    .filter(([, text]) => text)
                                    .map(([label, text]) => (
                                        <div key={label} className="bg-paper p-3 rounded-lg border border-line">
                                            <h4 className="font-semibold text-ink mb-1">{label}</h4>
                                            <p className="text-body">{text}</p>
                                        </div>
                                    ))}
                            </div>
                        )}

                        <div>
                            <h3 className="font-semibold text-ink mb-2 flex items-center gap-2">
                                <CheckCircle size={16} className="text-accent" />
                                Key achievements
                            </h3>
                            <ul className="space-y-2">
                                {project.bullets.map((bullet, idx) => (
                                    <li key={idx} className="flex gap-2.5 text-body leading-relaxed">
                                        <span className="mt-2 h-1 w-1 rounded-full bg-accent flex-shrink-0" />
                                        <span>{bullet}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <aside className="space-y-5 md:border-l md:border-line md:pl-6">
                        <div>
                            <h3 className="font-semibold text-ink mb-2">Tools & methods</h3>
                            <div className="flex flex-wrap gap-1.5">
                                {project.tools.map(tool => (
                                    <span key={tool} className="px-2.5 py-1 bg-accent-soft text-accent-dark text-xs rounded-full">
                                        {tool}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {project.links && project.links.length > 0 && (
                            <div className="flex flex-col gap-2">
                                {project.links.map(link => (
                                    <a
                                        key={link.label}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 rounded-md bg-accent text-white font-semibold hover:bg-accent-dark transition-colors"
                                    >
                                        <FileText size={15} /> {link.label}
                                    </a>
                                ))}
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
}
