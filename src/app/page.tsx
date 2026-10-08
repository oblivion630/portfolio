import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Projects from '@/components/Projects';
import Experience from '@/components/Experience';
import Skills from '@/components/Skills';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import BackgroundPipes from '@/components/BackgroundPipes';
import { profile } from '@/data/profile';

export default function Home() {
    return (
        <main className="relative min-h-screen flex flex-col">
            <BackgroundPipes />
            <Navbar profile={profile} />
            <Hero profile={profile} />
            {/* Ordered for a recruiter's skim: headline numbers, then standout work, background, skills, full history */}
            <Projects profile={profile} />
            <About profile={profile} />
            <Skills profile={profile} />
            <Experience profile={profile} />
            <Contact profile={profile} />
            <Footer profile={profile} />
        </main>
    );
}
