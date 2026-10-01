"use client";

import React, { useState, useEffect } from 'react';
import { Menu, X, FileText } from 'lucide-react';
import { Profile } from '@/data/profile';
import TankButton from './TankButton';

const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Experience', href: '#experience' },
    { name: 'Projects', href: '#projects' },
    { name: 'Skills', href: '#skills' },
    { name: 'Contact', href: '#contact' },
];

export default function Navbar({ profile }: { profile: Profile }) {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-colors duration-200 ${scrolled || isOpen ? 'bg-white/90 backdrop-blur-md border-b border-line' : 'bg-transparent'}`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    <a href="#" className="font-bold text-lg tracking-tight text-ink">
                        {profile.name}
                    </a>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a key={link.name} href={link.href} className="text-sm font-medium text-body hover:text-accent transition-colors">
                                {link.name}
                            </a>
                        ))}
                        <TankButton
                            href={profile.resumeUrl}
                            liquid="#0E7490"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-ink text-white"
                        >
                            <FileText size={16} /> Resume
                        </TankButton>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label={isOpen ? "Close menu" : "Open menu"}
                        className="md:hidden p-2 -mr-2 rounded-md text-ink hover:bg-line"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-t border-line bg-white">
                    <div className="px-4 py-3 space-y-1">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className="block px-3 py-2 rounded-md text-base font-medium text-body hover:bg-paper hover:text-accent"
                            >
                                {link.name}
                            </a>
                        ))}
                        <a
                            href={profile.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-3 py-2 rounded-md text-base font-semibold text-accent"
                        >
                            Download Resume
                        </a>
                    </div>
                </div>
            )}
        </nav>
    );
}
