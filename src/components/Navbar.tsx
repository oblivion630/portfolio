"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Settings } from 'lucide-react';

interface NavbarProps {
    animated: boolean;
    setAnimated: (val: boolean) => void;
}

export default function Navbar({ animated, setAnimated }: NavbarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'About', href: '#about' },
        { name: 'Projects', href: '#projects' },
        { name: 'Experience', href: '#experience' },
        { name: 'Skills', href: '#skills' },
        { name: 'Contact', href: '#contact' },
    ];

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-blueprint-bg/90 backdrop-blur-md border-b border-blueprint-grid' : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 max-sm:px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo / Name */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="font-mono font-bold text-xl tracking-tighter text-blueprint-accent">
                            <span className="text-blueprint-highlight">P-FD</span>.PROFILE
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-gray-300 hover:text-blueprint-highlight transition-colors font-mono text-sm uppercase tracking-wide"
                                >
                                    {link.name}
                                </Link>
                            ))}

                            {/* Toggle Animation */}
                            <button
                                onClick={() => setAnimated(!animated)}
                                className={`flex items-center gap-2 px-3 py-1 rounded border border-blueprint-grid text-xs font-mono transition-all ${animated ? 'bg-blueprint-accent/10 text-blueprint-accent' : 'text-gray-500'
                                    }`}
                                title={animated ? "Disable Animations" : "Enable Animations"}
                            >
                                <Settings size={14} className={animated ? "animate-spin" : ""} />
                                {animated ? "LIVE" : "STATIC"}
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-blueprint-grid focus:outline-none"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-blueprint-bg border-b border-blueprint-grid">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className="text-gray-300 hover:text-blueprint-highlight block px-3 py-2 rounded-md text-base font-medium font-mono"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <button
                            onClick={() => {
                                setAnimated(!animated);
                                setIsOpen(false);
                            }}
                            className="w-full text-left text-gray-300 hover:text-blueprint-highlight block px-3 py-2 rounded-md text-base font-medium font-mono"
                        >
                            {animated ? "Disable Animations" : "Enable Animations"}
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}
