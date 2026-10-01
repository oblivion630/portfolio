"use client";

import React, { useEffect, useState } from 'react';
import { shade } from '@/lib/color';

// Block letters drawn as pipe runs on a 4-wide x 6-tall grid (M and W are 5 wide).
// Each string is one continuous pipe so liquid can flow through it end to end.
const LETTERS: Record<string, { w: number; runs: string[] }> = {
    H: { w: 4, runs: ["M0 0V6", "M4 0V6", "M0 3H4"] },
    E: { w: 4, runs: ["M4 0H0V6H4", "M0 3H3"] },
    K: { w: 4, runs: ["M0 0V6", "M4 0L0.8 3L4 6"] },
    M: { w: 5, runs: ["M0 6V0L2.5 3L5 0V6"] },
    A: { w: 4, runs: ["M0 6V1.5Q0 0 1.5 0H2.5Q4 0 4 1.5V6", "M0 3.5H4"] },
    T: { w: 4, runs: ["M0 0H4", "M2 0V6"] },
    W: { w: 5, runs: ["M0 0V6L2.5 3L5 6V0"] },
    S: { w: 4, runs: ["M4 0H1Q0 0 0 1V2Q0 3 1 3H3Q4 3 4 4V5Q4 6 3 6H0"] },
};

const FLUIDS = ["#14B8A6", "#F59E0B", "#8B5CF6", "#0EA5E9", "#F43F5E", "#84CC16"];
// Tube layers from outside in: [colour, stroke width]
const TUBE: [string, number][] = [["#0F172A", 1.45], ["#94A3B8", 1.22], ["#E2E8F0", 0.95], ["#F1F5F9", 0.72]];
const GAP = 2.3;       // space between letters
const ROW_GAP = 2.6;   // space between the two words
const PAD = 0.8;       // room for the pipe wall at the edges

type Letter = { key: string; x: number; y: number; runs: string[]; ends: [number, number][] };

// Endpoints of each run get a flange so the letters read as pipe spools.
function runEnds(d: string): [number, number][] {
    const nums = d.match(/-?\d*\.?\d+/g)!.map(Number);
    const start: [number, number] = [nums[0], nums[1]];
    // Walk the path to find where it ends (handles M, H, V, L and Q commands).
    let x = nums[0], y = nums[1];
    const cmds = d.match(/[MHVLQ][^MHVLQ]*/g)!;
    for (const c of cmds.slice(1)) {
        const v = c.slice(1).trim().split(/[\s,]+/).map(Number);
        if (c[0] === 'H') x = v[0];
        else if (c[0] === 'V') y = v[0];
        else if (c[0] === 'L') { x = v[0]; y = v[1]; }
        else if (c[0] === 'Q') { x = v[2]; y = v[3]; }
    }
    return [start, [x, y]];
}

function layout(words: string[]) {
    const letters: Letter[] = [];
    let width = 0;
    words.forEach((word, row) => {
        let x = PAD;
        word.split("").forEach((ch, i) => {
            const glyph = LETTERS[ch];
            letters.push({
                key: `${row}-${i}`,
                x,
                y: PAD + row * (6 + ROW_GAP),
                runs: glyph.runs,
                ends: glyph.runs.flatMap(runEnds),
            });
            x += glyph.w + GAP;
        });
        width = Math.max(width, x - GAP + PAD);
    });
    const height = PAD * 2 + words.length * 6 + (words.length - 1) * ROW_GAP;
    return { letters, width, height };
}

type Flow = { id: number; letter: number; color: string };

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
                const color = FLUIDS[Math.floor(Math.random() * FLUIDS.length)];
                return [...prev, { id: id++, letter, color }];
            });
            timer = setTimeout(tick, 700 + Math.random() * 1100);
        };
        timer = setTimeout(tick, 600);
        return () => clearTimeout(timer);
    }, [letters.length]); // eslint-disable-line react-hooks/exhaustive-deps

    const done = (flowId: number) => setFlows(prev => prev.filter(f => f.id !== flowId));

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full max-w-[420px] h-auto overflow-visible"
            aria-hidden="true"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {letters.map(l => (
                <g key={l.key} transform={`translate(${l.x} ${l.y})`}>
                    {/* Tube built up in layers: dark outline, glass wall shading, then the empty bore */}
                    {TUBE.map(([color, width], layer) =>
                        l.runs.map((d, i) => <path key={`${layer}-${i}`} d={d} stroke={color} strokeWidth={width} />))}
                </g>
            ))}

            {/* Liquid: fills a letter from its inlet, holds, then drains out.
                Three strokes in step give it depth: deep edge, body colour, and a lit surface. */}
            {flows.map(f => {
                const l = letters[f.letter];
                const layers: [string, number][] = [[shade(f.color, -0.35), 0.72], [f.color, 0.5], [shade(f.color, 0.55), 0.16]];
                return (
                    <g key={f.id} transform={`translate(${l.x} ${l.y})`}>
                        {layers.map(([color, width], layer) => l.runs.map((d, i) => (
                            <path
                                key={`${layer}-${i}`}
                                d={d}
                                pathLength={100}
                                stroke={color}
                                strokeWidth={width}
                                strokeDasharray="100 100"
                                className="animate-fluid-fill"
                                onAnimationEnd={layer === 0 && i === 0 ? () => done(f.id) : undefined}
                            />
                        )))}
                    </g>
                );
            })}

            {/* Glass reflection over the liquid, then steel flanges at the pipe ends */}
            {letters.map(l => (
                <g key={`g${l.key}`} transform={`translate(${l.x} ${l.y})`}>
                    {l.runs.map((d, i) => <path key={i} d={d} stroke="#fff" strokeWidth={0.1} opacity={0.8} transform="translate(-0.22 -0.22)" />)}
                    {l.ends.map(([x, y], i) => (
                        <g key={`f${i}`}>
                            <circle cx={x} cy={y} r={0.88} fill="#334155" />
                            <circle cx={x - 0.2} cy={y - 0.2} r={0.42} fill="#94A3B8" />
                        </g>
                    ))}
                </g>
            ))}
        </svg>
    );
}
