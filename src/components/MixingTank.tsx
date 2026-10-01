"use client";

import React, { useEffect, useState } from 'react';

// Two feeds go in, get mixed, and the blended batch drains out. Pairs mix the way people expect.
const BATCHES: { a: string; b: string; mix: string }[] = [
    { a: "#0EA5E9", b: "#FACC15", mix: "#22C55E" }, // blue + yellow -> green
    { a: "#F43F5E", b: "#3B82F6", mix: "#8B5CF6" }, // red + blue -> purple
    { a: "#FACC15", b: "#F43F5E", mix: "#F97316" }, // yellow + red -> orange
    { a: "#EC4899", b: "#FACC15", mix: "#FB7185" }, // pink + yellow -> coral
];

// Batch cycle, in seconds
const FILL = 1.8, MIX = 2.2, DRAIN = 1.5, PAUSE = 0.6;
const CYCLE = FILL + MIX + DRAIN + PAUSE;
const FULL = 0.72;           // working level as a fraction of the tank height

// Tank interior (viewBox units)
const TOP = 9, BOTTOM = 27, LEFT = 9, RIGHT = 23;
const HEIGHT = BOTTOM - TOP;
const INTERIOR = `M${LEFT} ${TOP}H${RIGHT}V24Q${RIGHT} ${BOTTOM} 20 ${BOTTOM}H12Q${LEFT} ${BOTTOM} ${LEFT} 24Z`;

const ease = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

function lerpColor(from: string, to: string, t: number) {
    const a = parseInt(from.slice(1), 16), b = parseInt(to.slice(1), 16);
    const ch = (shift: number) => Math.round(((a >> shift) & 255) + ((((b >> shift) & 255) - ((a >> shift) & 255)) * t));
    return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
}

export default function MixingTank() {
    // Elapsed time and impeller angle; a still, mixed tank until the animation starts (and for reduced motion).
    const [state, setState] = useState({ time: FILL + MIX * 0.99, angle: 0.6, batch: 0 });

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        let frame = 0, last = performance.now(), time = 0, angle = 0, batch = Math.floor(Math.random() * BATCHES.length);
        const step = (now: number) => {
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            time += dt;
            if (time >= CYCLE) { time -= CYCLE; batch = (batch + 1) % BATCHES.length; }
            const mixing = time > FILL && time < FILL + MIX;
            angle += dt * (mixing ? 16 : 3);
            setState({ time, angle, batch });
            frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
    }, []);

    const { time, angle, batch } = state;
    const { a, b, mix } = BATCHES[batch];

    // Phase progress
    const fill = clamp01(time / FILL);
    const mixing = clamp01((time - FILL) / MIX);
    const drain = clamp01((time - FILL - MIX) / DRAIN);
    const level = time < FILL ? FULL * ease(fill) : time < FILL + MIX ? FULL : FULL * (1 - ease(drain));

    // First half of the fill is feed A (left inlet), second half is feed B (right inlet).
    const pouringA = time < FILL / 2;
    const pouringB = time >= FILL / 2 && time < FILL;
    const draining = time >= FILL + MIX && drain < 1;

    const surface = BOTTOM - level * HEIGHT;
    const interfaceY = BOTTOM - Math.min(level, FULL / 2) * HEIGHT;
    const blend = time < FILL ? 0 : ease(mixing);
    const lower = lerpColor(a, mix, blend);
    const upper = lerpColor(b, mix, blend);

    // Vortex dip in the surface while the impeller is running hard
    const vortex = time > FILL && time < FILL + MIX ? 1.6 * Math.sin(Math.PI * mixing) : 0;
    const surfacePath = `M${LEFT - 1} ${surface}Q16 ${surface + vortex * 2} ${RIGHT + 1} ${surface}V${BOTTOM + 1}H${LEFT - 1}Z`;

    // Side view of a spinning two-blade impeller: each blade's apparent length follows cos/sin of the angle.
    const bladeA = 4.2 * Math.cos(angle), bladeB = 4.2 * Math.sin(angle);

    return (
        <svg viewBox="0 0 32 32" className="h-8 w-8 flex-shrink-0" aria-hidden="true">
            <defs>
                <clipPath id="tank-interior"><path d={INTERIOR} /></clipPath>
            </defs>

            {/* Feed pipes */}
            <path d="M1 5.5H11V9" fill="none" stroke="#64748B" strokeWidth={1.8} strokeLinejoin="round" />
            <path d="M31 5.5H21V9" fill="none" stroke="#64748B" strokeWidth={1.8} strokeLinejoin="round" />

            {/* Vessel and liquid */}
            <path d={INTERIOR} fill="#F8FAFC" />
            <g clipPath="url(#tank-interior)">
                {level > 0.001 && (
                    <>
                        <path d={surfacePath} fill={upper} />
                        <rect x={LEFT - 1} y={interfaceY} width={RIGHT - LEFT + 2} height={BOTTOM - interfaceY + 1} fill={lower} />
                        {/* Light catching the liquid surface */}
                        <rect x={LEFT} y={surface} width={RIGHT - LEFT} height={0.7} fill="#fff" opacity={0.35} />
                    </>
                )}
            </g>

            {/* Feed streams falling onto the liquid */}
            {pouringA && <line x1={11} y1={9} x2={11} y2={surface} stroke={a} strokeWidth={1.3} />}
            {pouringB && <line x1={21} y1={9} x2={21} y2={surface} stroke={b} strokeWidth={1.3} />}

            {/* Agitator: motor, shaft and impeller */}
            <rect x={13.2} y={2} width={5.6} height={4.6} rx={0.8} fill="#334155" />
            <rect x={13.2} y={2} width={5.6} height={1.4} rx={0.6} fill="#64748B" />
            <line x1={16} y1={6.6} x2={16} y2={23} stroke="#334155" strokeWidth={1} />
            <line x1={16 - bladeB} y1={23} x2={16 + bladeB} y2={23} stroke="#64748B" strokeWidth={1.4} strokeLinecap="round" />
            <line x1={16 - bladeA} y1={23} x2={16 + bladeA} y2={23} stroke="#1E293B" strokeWidth={1.4} strokeLinecap="round" />

            <path d={INTERIOR} fill="none" stroke="#0F172A" strokeWidth={1.4} />

            {/* Outlet and product stream */}
            <path d="M23 24.5H28.5V28" fill="none" stroke="#64748B" strokeWidth={1.8} strokeLinejoin="round" />
            {draining && <line x1={28.5} y1={28} x2={28.5} y2={32} stroke={mix} strokeWidth={1.3} />}
        </svg>
    );
}
