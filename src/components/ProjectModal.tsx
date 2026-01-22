"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, FileText, CheckCircle } from 'lucide-react';
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
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blueprint-bg/80 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-blueprint-card border border-blueprint-grid w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-lg shadow-2xl relative"
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-blueprint-card/95 backdrop-blur z-10 p-6 border-b border-blueprint-grid flex justify-between items-start">
                        <div>
                            <div className="font-mono text-blueprint-accent text-xs mb-2 uppercase tracking-wide">
                                {project.category} // ID: {project.id}
                            </div>
                            <h2 className="text-2xl font-bold text-white">{project.title}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-8">

                        {/* Problem / Solution / Results Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-blueprint-bg/50 p-4 rounded border border-blueprint-grid/50">
                                <h4 className="font-mono text-blueprint-highlight text-sm mb-2">PROBLEM</h4>
                                <p className="text-gray-300 text-sm">{project.problem || "N/A"}</p>
                            </div>
                            <div className="bg-blueprint-bg/50 p-4 rounded border border-blueprint-grid/50">
                                <h4 className="font-mono text-blueprint-highlight text-sm mb-2">SOLUTION</h4>
                                <p className="text-gray-300 text-sm">{project.solution || project.description}</p>
                            </div>
                            <div className="bg-blueprint-bg/50 p-4 rounded border border-blueprint-grid/50">
                                <h4 className="font-mono text-blueprint-highlight text-sm mb-2">RESULTS</h4>
                                <p className="text-gray-300 text-sm">{project.results || "InProgress"}</p>
                            </div>
                        </div>

                        {/* Bullets */}
                        <div>
                            <h3 className="text-lg font-mono font-bold text-white mb-4 flex items-center gap-2">
                                <CheckCircle size={20} className="text-blueprint-accent" />
                                Key Achievements
                            </h3>
                            <ul className="space-y-3">
                                {project.bullets.map((bullet, idx) => (
                                    <li key={idx} className="flex gap-3 text-gray-300">
                                        <span className="text-blueprint-grid mt-1">▹</span>
                                        <span>{bullet}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Tools */}
                        <div>
                            <h3 className="text-lg font-mono font-bold text-white mb-4">Tech Specs</h3>
                            <div className="flex flex-wrap gap-2">
                                {project.tools.map(tool => (
                                    <span key={tool} className="px-3 py-1 bg-blueprint-grid/20 border border-blueprint-grid text-blueprint-accent text-sm font-mono rounded">
                                        {tool}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Links */}
                        {project.links && project.links.length > 0 && (
                            <div className="pt-6 border-t border-blueprint-grid">
                                <div className="flex gap-4">
                                    {project.links.map(link => (
                                        <a
                                            key={link.label}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-blueprint-highlight hover:underline"
                                        >
                                            <ExternalLink size={16} /> {link.label}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
