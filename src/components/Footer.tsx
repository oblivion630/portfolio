import React from 'react';
import { Profile } from '@/data/profile';

export default function Footer({ profile }: { profile: Profile }) {
    return (
        <footer className="py-8 border-t border-line bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between gap-2 text-sm text-muted">
                <p>© {new Date().getFullYear()} {profile.name}</p>
                <p>{profile.location} · <a href={`mailto:${profile.email}`} className="hover:text-accent">{profile.email}</a></p>
            </div>
        </footer>
    );
}
