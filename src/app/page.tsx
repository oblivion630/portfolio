"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Projects from '@/components/Projects';
import Experience from '@/components/Experience';
import Skills from '@/components/Skills';
import Footer from '@/components/Footer';
import BlueprintBackground from '@/components/BlueprintBackground';
import { profile } from '@/data/profile';

export default function Home() {
    const [animated, setAnimated] = useState(true);

    return (
        <main className="min-h-screen relative flex flex-col">
            {/* Background Layer */}
            <BlueprintBackground animated={animated} />

            {/* Navigation */}
            <Navbar animated={animated} setAnimated={setAnimated} />

            {/* Main Content */}
            <div className="relative z-10 flex flex-col gap-10 md:gap-20">
                <Hero profile={profile} animated={animated} />

                <About profile={profile} />

                <Projects profile={profile} />

                <Experience profile={profile} />

                <Skills profile={profile} />

                <Footer />
            </div>
        </main>
    );
}
