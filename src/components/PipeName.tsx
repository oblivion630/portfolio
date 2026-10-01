"use client";

import React, { useEffect, useState } from 'react';
import { shade } from '@/lib/color';

// Block letters built as pipe spools, all on the same 4-wide x 6-tall grid.
// Each run is a polyline of straight pipe; liquid flows through the runs in order.
type Pt = [number, number];
const LETTERS: Record<string, { w: number; runs: Pt[][] }> = {
    H: { w: 4, runs: [[[0, 0], [0, 6]], [[4, 0], [4, 6]], [[0, 3], [4, 3]]] },
    E: { w: 4, runs: [[[4, 0], [0, 0], [0, 6], [4, 6]], [[0, 3], [3, 3]]] },
    K: { w: 4, runs: [[[0, 0], [0, 6]], [[4, 0], [4, 1], [0, 3], [4, 5], [4, 6]]] },
    M: { w: 4, runs: [[[0, 6], [0, 0], [2, 3], [4, 0], [4, 6]]] },
    A: { w: 4, runs: [[[0, 6], [0, 0], [4, 0], [4, 6]], [[0, 3.2], [4, 3.2]]] },
    T: { w: 4, runs: [[[0, 0], [4, 0]], [[2, 0], [2, 6]]] },
    W: { w: 4, runs: [[[0, 0], [0, 6], [2, 3], [4, 6], [4, 0]]] },
    S: { w: 4, runs: [[[4, 0], [0, 0], [0, 3], [4, 3], [4, 6], [0, 6]]] },
};

const FLUIDS = ["#14B8A6", "#F59E0B", "#8B5CF6", "#0EA5E9", "#F43F5E", "#84CC16"];
const R = 0.62;        // pipe outer radius
const BORE = 0.7;      // liquid channel
const GAP = 2.3;       // space between letters
const ROW_GAP = 2.6;   // space between the two words
const PAD = 1.1;       // room for fittings at the edges
const FITTING = 0.7;   // half-size of elbow/tee fittings
const FLANGE_IN = 0.12; // how far a flange plate sits behind the pipe end
// Open pipe ends are extended so their flange lines up with the outer edge of the elbows,
// keeping every letter the same overall size whether it ends in a flange or a fitting.
const END_EXTENSION = FITTING - FLANGE_IN;
const FILL = 1.3;      // seconds to fill a letter
const HOLD = 0.5;      // seconds full
const DRAIN = 1.3;     // seconds to drain

type Seg = { x: number; y: number; angle: number; length: number; start: number }; // start: distance along the letter's flow path
type Flange = { x: number; y: number; angle: number };
type Letter = { key: string; x: number; y: number; segs: Seg[]; total: number; fittings: Pt[]; flanges: Flange[] };

const same = (a: Pt, b: Pt) => Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6;

// Does point p lie on segment a–b (used to find where a branch tees into another run)?
function onSegment(p: Pt, a: Pt, b: Pt) {
    const cross = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
    const within = Math.min(a[0], b[0]) - 1e-6 <= p[0] && p[0] <= Math.max(a[0], b[0]) + 1e-6
        && Math.min(a[1], b[1]) - 1e-6 <= p[1] && p[1] <= Math.max(a[1], b[1]) + 1e-6;
    return Math.abs(cross) < 1e-6 && within;
}

function buildLetter(runs: Pt[][]) {
    const segs: Seg[] = [];
    const fittings: Pt[] = [];
    const flanges: Flange[] = [];
    let total = 0;

    const isTee = (end: Pt, r: number) => runs.some((other, o) => o !== r && other.some((p, k) =>
        k < other.length - 1 && onSegment(end, p, other[k + 1])));
    const extend = (end: Pt, next: Pt): Pt => {
        const len = Math.hypot(end[0] - next[0], end[1] - next[1]);
        return [end[0] + (end[0] - next[0]) / len * END_EXTENSION, end[1] + (end[1] - next[1]) / len * END_EXTENSION];
    };

    runs.forEach((original, r) => {
        const n = original.length;
        const openStart = !isTee(original[0], r);
        const openEnd = !isTee(original[n - 1], r);
        const run = original.map((p, i) =>
            i === 0 && openStart ? extend(p, original[1]) : i === n - 1 && openEnd ? extend(p, original[n - 2]) : p);

        for (let i = 0; i < run.length - 1; i++) {
            const [a, b] = [run[i], run[i + 1]];
            const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
            segs.push({ x: a[0], y: a[1], angle: Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI, length, start: total });
            total += length;
        }
        run.slice(1, -1).forEach(p => fittings.push(p)); // elbows

        // Open ends get a flange; ends that land on another run become a tee.
        ([[run[0], run[1], openStart], [run[n - 1], run[n - 2], openEnd]] as [Pt, Pt, boolean][]).forEach(([end, next, open]) => {
            if (!open) fittings.push(end);
            else flanges.push({ x: end[0], y: end[1], angle: Math.atan2(next[1] - end[1], next[0] - end[0]) * 180 / Math.PI });
        });
    });

    // A point listed twice (e.g. a branch meeting an elbow) only needs one fitting.
    const unique = fittings.filter((p, i) => fittings.findIndex(q => same(p, q)) === i);
    return { segs, total, fittings: unique, flanges };
}

function layout(words: string[]) {
    const letters: Letter[] = [];
    let width = 0;
    words.forEach((word, row) => {
        let x = PAD;
        word.split("").forEach((ch, i) => {
            const glyph = LETTERS[ch];
            letters.push({ key: `${row}-${i}`, x, y: PAD + row * (6 + ROW_GAP), ...buildLetter(glyph.runs) });
            x += glyph.w + GAP;
        });
        width = Math.max(width, x - GAP + PAD);
    });
    const height = PAD * 2 + words.length * 6 + (words.length - 1) * ROW_GAP;
    return { letters, width, height };
}

type Flow = { id: number; letter: number; color: number };

export default function PipeName({ name }: { name: string }) {
    const { letters, width, height } = layout(name.toUpperCase().split(" "));
    const [flows, setFlows] = useState<Flow[]>([]);

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        let id = 0;
        let timer: ReturnType<typeof setTimeout>;
        const tick = () => {
            setFlows(prev => {
                const busy = new Set(prev.map(f => f.letter));
                const free = letters.map((_, i) => i).filter(i => !busy.has(i));
                if (!free.length || prev.length >= 3) return prev;
                const letter = free[Math.floor(Math.random() * free.length)];
                return [...prev, { id: id++, letter, color: Math.floor(Math.random() * FLUIDS.length) }];
            });
            timer = setTimeout(tick, 700 + Math.random() * 1100);
        };
        timer = setTimeout(tick, 600);
        return () => clearTimeout(timer);
    }, [letters.length]); // eslint-disable-line react-hooks/exhaustive-deps

    const done = (flowId: number) => setFlows(prev => prev.filter(f => f.id !== flowId));
    const frame = (s: { x: number; y: number; angle: number }) => `translate(${s.x} ${s.y}) rotate(${s.angle})`;

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full max-w-[420px] h-auto overflow-visible"
            aria-hidden="true"
        >
            <defs>
                {/* Glass tube shading across the pipe: dark walls, bright centre */}
                <linearGradient id="name-glass" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#475569" />
                    <stop offset="0.16" stopColor="#B8C4D2" />
                    <stop offset="0.42" stopColor="#F1F5F9" />
                    <stop offset="0.78" stopColor="#CBD5E1" />
                    <stop offset="1" stopColor="#334155" />
                </linearGradient>
                <linearGradient id="name-bore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#CBD5E1" />
                    <stop offset="0.5" stopColor="#F1F5F9" />
                    <stop offset="1" stopColor="#D5DDE6" />
                </linearGradient>
                <linearGradient id="name-steel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#334155" />
                    <stop offset="0.3" stopColor="#94A3B8" />
                    <stop offset="0.5" stopColor="#E2E8F0" />
                    <stop offset="0.8" stopColor="#64748B" />
                    <stop offset="1" stopColor="#1E293B" />
                </linearGradient>
                <linearGradient id="name-steel-diag" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#CBD5E1" />
                    <stop offset="0.5" stopColor="#64748B" />
                    <stop offset="1" stopColor="#1E293B" />
                </linearGradient>
                {FLUIDS.map((c, i) => (
                    <linearGradient key={c} id={`name-fluid-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor={shade(c, 0.45)} />
                        <stop offset="0.45" stopColor={c} />
                        <stop offset="1" stopColor={shade(c, -0.4)} />
                    </linearGradient>
                ))}
                {/* Each pipe segment's bore, in its own frame, for clipping liquid */}
                {letters.map((l, li) => l.segs.map((s, si) => (
                    <clipPath key={`${li}-${si}`} id={`name-bore-${li}-${si}`}>
                        <rect x={0} y={-BORE / 2} width={s.length} height={BORE} />
                    </clipPath>
                )))}
            </defs>

            {letters.map((l, li) => {
                const flow = flows.find(f => f.letter === li);
                return (
                    <g key={l.key} transform={`translate(${l.x} ${l.y})`}>
                        {/* Pipe spools */}
                        {l.segs.map((s, si) => (
                            <g key={si} transform={frame(s)}>
                                <rect x={0} y={-R} width={s.length} height={R * 2} fill="url(#name-glass)" />
                                <rect x={0} y={-BORE / 2} width={s.length} height={BORE} fill="url(#name-bore)" opacity={0.9} />
                            </g>
                        ))}

                        {/* Liquid fills each spool in flow order, holds, then drains the same way */}
                        {flow && l.segs.map((s, si) => {
                            const fillDelay = (s.start / l.total) * FILL;
                            const fillTime = (s.length / l.total) * FILL;
                            const drainDelay = FILL + HOLD + (s.start / l.total) * DRAIN;
                            const drainTime = (s.length / l.total) * DRAIN;
                            const last = si === l.segs.length - 1;
                            return (
                                <g key={`${flow.id}-${si}`} transform={frame(s)} clipPath={`url(#name-bore-${li}-${si})`}>
                                    <g
                                        style={{
                                            '--len': `${s.length}px`,
                                            animation: `pipe-fill ${fillTime}s linear ${fillDelay}s both, pipe-drain ${drainTime}s linear ${drainDelay}s forwards`,
                                        } as React.CSSProperties}
                                        onAnimationEnd={last ? (e => e.animationName === 'pipe-drain' && done(flow.id)) : undefined}
                                    >
                                        <rect x={0} y={-BORE / 2} width={s.length} height={BORE} fill={`url(#name-fluid-${flow.color})`} />
                                        <rect x={0} y={-BORE / 2 + 0.1} width={s.length} height={0.1} fill="#fff" opacity={0.55} />
                                    </g>
                                </g>
                            );
                        })}

                        {/* Glass reflection running along the top of each spool */}
                        {l.segs.map((s, si) => (
                            <g key={`h${si}`} transform={frame(s)}>
                                <rect x={0} y={-R + 0.14} width={s.length} height={0.13} fill="#fff" opacity={0.8} />
                            </g>
                        ))}

                        {/* Steel elbows and tees at every joint */}
                        {l.fittings.map(([x, y], i) => (
                            <rect key={`f${i}`} x={x - FITTING} y={y - FITTING} width={FITTING * 2} height={FITTING * 2} rx={0.42}
                                fill="url(#name-steel-diag)" stroke="#1E293B" strokeWidth={0.08} />
                        ))}

                        {/* Flange plates on open ends, square to the pipe */}
                        {l.flanges.map((f, i) => (
                            <g key={`fl${i}`} transform={frame(f)}>
                                <rect x={-FLANGE_IN} y={-R - 0.32} width={0.42} height={(R + 0.32) * 2} rx={0.08}
                                    fill="url(#name-steel)" stroke="#1E293B" strokeWidth={0.06} />
                            </g>
                        ))}
                    </g>
                );
            })}
        </svg>
    );
}
