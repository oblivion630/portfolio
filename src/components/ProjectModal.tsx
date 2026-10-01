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
                className="bg-white w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-xl shadow-2xl"
            >
                {/* Header */}
                <div className="sticky top-0 bg-white/95 backdrop-blur p-6 border-b border-line flex justify-between items-start gap-4">
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-accent mb-1">{project.category}</div>
                        <h2 id="project-title" className="text-2xl font-bold text-ink">{project.title}</h2>
                    </div>
                    <button onClick={onClose} aria-label="Close" className="p-2 -mr-2 text-muted hover:text-ink rounded-full hover:bg-paper">
                        <X size={22} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-8">
                    <p className="text-body leading-relaxed">{project.description}</p>

                    {(project.problem || project.solution || project.results) && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[["Problem", project.problem], ["Solution", project.solution], ["Results", project.results]]
                                .filter(([, text]) => text)
                                .map(([label, text]) => (
                                    <div key={label} className="bg-paper p-4 rounded-lg border border-line">
                                        <h4 className="text-sm font-semibold text-ink mb-2">{label}</h4>
                                        <p className="text-body text-sm">{text}</p>
                                    </div>
                                ))}
                        </div>
                    )}

                    <div>
                        <h3 className="font-semibold text-ink mb-4 flex items-center gap-2">
                            <CheckCircle size={18} className="text-accent" />
                            Key achievements
                        </h3>
                        <ul className="space-y-3">
                            {project.bullets.map((bullet, idx) => (
                                <li key={idx} className="flex gap-3 text-body leading-relaxed">
                                    <span className="mt-2.5 h-1 w-1 rounded-full bg-accent flex-shrink-0" />
                                    <span>{bullet}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-ink mb-3">Tools & methods</h3>
                        <div className="flex flex-wrap gap-2">
                            {project.tools.map(tool => (
                                <span key={tool} className="px-3 py-1 bg-accent-soft text-accent-dark text-sm rounded-full">
                                    {tool}
                                </span>
                            ))}
                        </div>
                    </div>

                    {project.links && project.links.length > 0 && (
                        <div className="pt-6 border-t border-line flex flex-wrap gap-3">
                            {project.links.map(link => (
                                <a
                                    key={link.label}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-white font-semibold text-sm hover:bg-accent-dark transition-colors"
                                >
                                    <FileText size={16} /> {link.label}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
