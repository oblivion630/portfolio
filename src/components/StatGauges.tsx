"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Profile } from '@/data/profile';

const DURATION = 1600; // ms for needles and counters to settle
const SWEEP = 240;     // degrees of dial travel

// Counts up the last number in a stat ("$725K+", "89 → 91%") while keeping the rest of the text.
function withNumber(value: string, progress: number) {
    const matches = Array.from(value.matchAll(/\d[\d,]*/g));
    const last = matches[matches.length - 1];
    if (!last || last.index === undefined) return value;
    const target = Number(last[0].replace(/,/g, ''));
    // For "a → b" readings, start the count from a rather than zero.
    const start = matches.length > 1 ? Number(matches[0][0].replace(/,/g, '')) : 0;
    const current = Math.round(start + (target - start) * progress);
    const text = last[0].includes(',') ? current.toLocaleString('en-US') : String(current);
    return value.slice(0, last.index) + text + value.slice(last.index + last[0].length);
}

function Gauge({ reading }: { reading: number }) {
    const angle = -SWEEP / 2 + SWEEP * reading;
    const ticks = Array.from({ length: 9 }, (_, i) => -SWEEP / 2 + (SWEEP / 8) * i);
    return (
        <svg viewBox="-24 -24 48 48" className="h-12 w-12 flex-shrink-0" aria-hidden="true">
            <circle r={22} fill="#F8FAFC" stroke="#CBD5E1" strokeWidth={2} />
            {/* Red-line zone at the top end of the dial */}
            <path d={arc(SWEEP / 2 - 45, SWEEP / 2, 17)} stroke="#F43F5E" strokeWidth={3} fill="none" opacity={0.7} />
            {ticks.map(t => (
                <line key={t} x1={0} y1={-19} x2={0} y2={-15} stroke="#94A3B8" strokeWidth={1.2} transform={`rotate(${t})`} />
            ))}
            <g transform={`rotate(${angle})`}>
                <line x1={0} y1={3} x2={0} y2={-16} stroke="#0E7490" strokeWidth={2} strokeLinecap="round" />
            </g>
            <circle r={3} fill="#0F172A" />
        </svg>
    );
}

// SVG arc between two dial angles (0deg = straight up).
function arc(from: number, to: number, r: number) {
    const point = (deg: number) => {
        const rad = (deg - 90) * Math.PI / 180;
        return `${(r * Math.cos(rad)).toFixed(2)} ${(r * Math.sin(rad)).toFixed(2)}`;
    };
    return `M${point(from)}A${r} ${r} 0 0 1 ${point(to)}`;
}

export default function StatGauges({ stats }: { stats: Profile['stats'] }) {
    const ref = useRef<HTMLDListElement>(null);
    const [progress, setProgress] = useState(1); // server render shows final values

    // Reset to zero before first paint, then run once the strip scrolls into view.
    useLayoutEffect(() => {
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setProgress(0);
    }, []);

    useEffect(() => {
        const el = ref.current;
        if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        let frame = 0;
        let fallback: ReturnType<typeof setTimeout>;
        const finish = () => { cancelAnimationFrame(frame); setProgress(1); };
        window.addEventListener('beforeprint', finish);
        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            observer.disconnect();
            // Browsers pause animation frames in background tabs; make sure the real numbers always land.
            fallback = setTimeout(finish, DURATION + 200);
            const start = performance.now();
            const step = (now: number) => {
                const t = Math.min(1, (now - start) / DURATION);
                setProgress(1 - Math.pow(1 - t, 3)); // ease-out
                if (t < 1) frame = requestAnimationFrame(step);
            };
            frame = requestAnimationFrame(step);
        }, { threshold: 0 });
        observer.observe(el);
        return () => {
            observer.disconnect();
            cancelAnimationFrame(frame);
            clearTimeout(fallback);
            window.removeEventListener('beforeprint', finish);
        };
    }, []);

    return (
        <dl ref={ref} className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px rounded-xl overflow-hidden border border-line bg-line">
            {stats.map((stat) => (
                <div key={stat.label} className="bg-white p-5 md:p-6 flex items-start gap-4">
                    <Gauge reading={stat.gauge * progress} />
                    <div>
                        <dt className="sr-only">{stat.label}</dt>
                        <dd className="text-2xl md:text-3xl font-bold tracking-tight text-ink tabular-nums">{withNumber(stat.value, progress)}</dd>
                        <dd className="mt-1 text-sm leading-snug text-muted">{stat.label}</dd>
                    </div>
                </div>
            ))}
        </dl>
    );
}
