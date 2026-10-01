"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { shade } from '@/lib/color';

const FLUIDS = ["#14B8A6", "#F59E0B", "#8B5CF6", "#0EA5E9", "#F43F5E", "#84CC16"];
const CONTENT_WIDTH = 1152; // matches max-w-6xl
const SPEED = 300;          // px per second for a fluid slug
const R = 7;                // pipe outer radius
const BORE = 8;             // inner diameter the liquid fills
const COUPLING_EVERY = 220; // px between pipe couplings

type ValveKind = 'leak' | 'steam' | 'burst' | 'flush';
const VALVE_KINDS: ValveKind[] = ['leak', 'steam', 'burst', 'flush'];
const VALVE_HINTS: Record<ValveKind, string> = {
    leak: "This valve looks a little worn…",
    steam: "Pressure relief valve",
    burst: "Open the valve",
    flush: "Main line valve",
};

// Straight pipe run, drawn in its own local frame: from (0,0) along +x for `length`, rotated by `angle`.
type Segment = { x1: number; y1: number; x2: number; y2: number; angle: number; length: number };
type Valve = { x: number; y: number; seg: number; kind: ValveKind };
type Network = { width: number; height: number; segments: Segment[]; valves: Valve[]; fittings: [number, number][] };
type Flow = { id: number; seg: number; color: number; reverse: boolean; fast?: boolean };
type Effect = { id: number; kind: 'leak' | 'steam'; x: number; y: number; color: string };

const randomIndex = (n: number) => Math.floor(Math.random() * n);

function seg(x1: number, y1: number, x2: number, y2: number): Segment {
    return { x1, y1, x2, y2, angle: Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI, length: Math.hypot(x2 - x1, y2 - y1) };
}

// Pipes run along the border between each section, plus down both side gutters on wide screens.
function buildNetwork(main: HTMLElement, kinds: ValveKind[]): Network {
    const width = main.clientWidth;
    const height = main.scrollHeight;
    const rows = Array.from(main.querySelectorAll<HTMLElement>(':scope > section[id], :scope > footer')).map(el => el.offsetTop);
    const gutter = (width - CONTENT_WIDTH) / 2;
    const sides = gutter >= 56;
    const left = sides ? Math.round(gutter / 2) : -R * 2;
    const right = sides ? width - Math.round(gutter / 2) : width + R * 2;

    const segments: Segment[] = [];
    const valves: Valve[] = [];
    const fittings: [number, number][] = [];

    rows.forEach((y, i) => {
        valves.push({ x: Math.round(width * (i % 2 ? 0.78 : 0.22)), y, seg: segments.length, kind: kinds[i % kinds.length] });
        segments.push(seg(left, y, right, y));
        if (sides) fittings.push([left, y], [right, y]);
        if (sides && i > 0) {
            segments.push(seg(left, rows[i - 1], left, y));
            segments.push(seg(right, rows[i - 1], right, y));
        }
    });

    return { width, height, segments, valves, fittings };
}

// A slug of liquid in local coordinates, travelling toward +x with its front meniscus at x = 0.
function Slug({ length, color }: { length: number; color: number }) {
    const base = FLUIDS[color];
    return (
        <>
            {/* Thin film left wetting the bottom of the pipe behind the slug */}
            <rect x={-length - 60} y={BORE / 2 - 2.4} width={70} height={2.4} rx={1.2} fill={base} opacity={0.35} />
            <rect x={-length} y={-BORE / 2} width={length} height={BORE} rx={BORE / 2} fill={`url(#fluid-${color})`} />
            {/* Surface sheen */}
            <rect x={-length + BORE / 2} y={-BORE / 2 + 1.2} width={length - BORE} height={1.3} rx={0.65} fill="#fff" opacity={0.5} />
            {/* Entrained bubbles */}
            <circle cx={-length * 0.28} cy={0.8} r={1.3} fill="#fff" opacity={0.7} />
            <circle cx={-length * 0.52} cy={-0.6} r={0.9} fill="#fff" opacity={0.6} />
            <circle cx={-length * 0.74} cy={1.2} r={1.1} fill="#fff" opacity={0.65} />
            <circle cx={-length * 0.85} cy={-0.2} r={0.7} fill={shade(base, 0.6)} opacity={0.8} />
        </>
    );
}

export default function BackgroundPipes() {
    const ref = useRef<SVGSVGElement>(null);
    const nextId = useRef(0);
    const [net, setNet] = useState<Network | null>(null);
    const [flows, setFlows] = useState<Flow[]>([]);
    const [effects, setEffects] = useState<Effect[]>([]);
    const [turning, setTurning] = useState<Set<number>>(new Set());

    // Measure the page and rebuild the network whenever its size changes.
    // Valve behaviours are shuffled once per visit so each valve is a surprise.
    useEffect(() => {
        const main = ref.current?.parentElement;
        if (!main) return;
        const kinds = [...VALVE_KINDS].sort(() => Math.random() - 0.5);
        const update = () => setNet(buildNetwork(main, kinds));
        update();
        const observer = new ResizeObserver(update);
        observer.observe(main);
        return () => observer.disconnect();
    }, []);

    const addFlow = useCallback((flow: Omit<Flow, 'id'>) => {
        setFlows(prev => [...prev, { ...flow, id: nextId.current++ }]);
    }, []);

    // Every few seconds, send a slug of coloured liquid through a random pipe.
    const segmentCount = net?.segments.length ?? 0;
    useEffect(() => {
        if (!segmentCount || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        let timer: ReturnType<typeof setTimeout>;
        const tick = () => {
            setFlows(prev => prev.length >= 3 ? prev : [...prev, {
                id: nextId.current++,
                seg: randomIndex(segmentCount),
                color: randomIndex(FLUIDS.length),
                reverse: Math.random() < 0.5,
            }]);
            timer = setTimeout(tick, 1500 + Math.random() * 2000);
        };
        timer = setTimeout(tick, 1200);
        return () => clearTimeout(timer);
    }, [segmentCount]);

    const operate = (index: number, valve: Valve) => {
        if (!net) return;
        setTurning(prev => new Set(prev).add(index));
        setTimeout(() => setTurning(prev => { const s = new Set(prev); s.delete(index); return s; }), 700);

        const color = randomIndex(FLUIDS.length);
        if (valve.kind === 'burst') {
            [0, 220, 440].forEach((delay, i) =>
                setTimeout(() => addFlow({ seg: valve.seg, color, reverse: i % 2 === 1, fast: true }), delay));
        } else if (valve.kind === 'flush') {
            net.segments.forEach((_, seg) => addFlow({ seg, color, reverse: false }));
        } else {
            const id = nextId.current++;
            setEffects(prev => [...prev, { id, kind: valve.kind as Effect['kind'], x: valve.x, y: valve.y, color: FLUIDS[color] }]);
            setTimeout(() => setEffects(prev => prev.filter(e => e.id !== id)), 5000);
        }
    };

    const frame = (s: Segment, reverse = false) =>
        reverse ? `translate(${s.x2} ${s.y2}) rotate(${s.angle + 180})` : `translate(${s.x1} ${s.y1}) rotate(${s.angle})`;

    return (
        <svg
            ref={ref}
            aria-hidden="true"
            className="absolute top-0 left-0 z-[1] pointer-events-none"
            width={net?.width ?? 0}
            height={net?.height ?? 0}
        >
            <defs>
                {/* Glass tube: darker at the walls, bright through the middle (gradient runs across the pipe) */}
                <linearGradient id="pipe-glass" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#94A3B8" />
                    <stop offset="0.14" stopColor="#D6DEE7" />
                    <stop offset="0.4" stopColor="#F8FAFC" />
                    <stop offset="0.75" stopColor="#E2E8F0" />
                    <stop offset="1" stopColor="#8796AA" />
                </linearGradient>
                <linearGradient id="pipe-bore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#D5DDE6" />
                    <stop offset="0.5" stopColor="#F1F5F9" />
                    <stop offset="1" stopColor="#DCE3EB" />
                </linearGradient>
                <linearGradient id="pipe-steel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#475569" />
                    <stop offset="0.25" stopColor="#CBD5E1" />
                    <stop offset="0.45" stopColor="#F1F5F9" />
                    <stop offset="0.8" stopColor="#94A3B8" />
                    <stop offset="1" stopColor="#475569" />
                </linearGradient>
                <linearGradient id="pipe-steel-diag" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#E2E8F0" />
                    <stop offset="0.5" stopColor="#94A3B8" />
                    <stop offset="1" stopColor="#475569" />
                </linearGradient>
                {/* Liquid: lit from above, deeper colour at the bottom of the pipe */}
                {FLUIDS.map((c, i) => (
                    <linearGradient key={c} id={`fluid-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor={shade(c, 0.45)} />
                        <stop offset="0.45" stopColor={c} />
                        <stop offset="1" stopColor={shade(c, -0.35)} />
                    </linearGradient>
                ))}
            </defs>

            {net && (
                <>
                    {/* Tube walls and empty bore */}
                    {net.segments.map((s, i) => (
                        <g key={`p${i}`} transform={frame(s)}>
                            <rect x={0} y={-R} width={s.length} height={R * 2} fill="url(#pipe-glass)" />
                            <rect x={0} y={-BORE / 2} width={s.length} height={BORE} fill="url(#pipe-bore)" opacity={0.85} />
                        </g>
                    ))}

                    {/* Liquid slugs, clipped to the bore so they flow in and out of the pipe ends */}
                    {flows.filter(f => f.seg < net.segments.length).map(f => {
                        const s = net.segments[f.seg];
                        const slug = Math.min(160, Math.max(70, s.length * 0.18));
                        const seconds = Math.max(f.fast ? 0.5 : 1.5, (s.length + slug) / (f.fast ? SPEED * 3 : SPEED));
                        return (
                            <g key={f.id} transform={frame(s, f.reverse)} clipPath={`url(#bore-${f.id})`}>
                                <clipPath id={`bore-${f.id}`}>
                                    <rect x={0} y={-BORE / 2} width={s.length} height={BORE} />
                                </clipPath>
                                <g
                                    className="animate-slug"
                                    style={{ '--flow-duration': `${seconds}s`, '--slug-travel': `${s.length + slug + 60}px` } as React.CSSProperties}
                                    onAnimationEnd={() => setFlows(prev => prev.filter(p => p.id !== f.id))}
                                >
                                    <Slug length={slug} color={f.color} />
                                </g>
                            </g>
                        );
                    })}

                    {/* Glass highlight over the liquid, and steel couplings along each run */}
                    {net.segments.map((s, i) => (
                        <g key={`h${i}`} transform={frame(s)}>
                            <rect x={0} y={-R + 1.6} width={s.length} height={1.6} fill="#fff" opacity={0.75} />
                            {Array.from({ length: Math.floor(s.length / COUPLING_EVERY) }, (_, k) => (k + 1) * COUPLING_EVERY - COUPLING_EVERY / 2)
                                .map(x => (
                                    <g key={x}>
                                        <rect x={x - 5} y={-R - 2.5} width={10} height={R * 2 + 5} rx={1.5} fill="url(#pipe-steel)" />
                                        <line x1={x} y1={-R - 2.5} x2={x} y2={R + 2.5} stroke="#475569" strokeWidth={0.6} opacity={0.6} />
                                    </g>
                                ))}
                        </g>
                    ))}

                    {/* Tee fittings where the side pipes meet the headers */}
                    {net.fittings.map(([x, y], i) => (
                        <rect key={`f${i}`} x={x - 11} y={y - 11} width={22} height={22} rx={4} fill="url(#pipe-steel-diag)" stroke="#64748B" strokeWidth={0.75} />
                    ))}

                    {/* Leaks drip from under the valve; relief valves vent a puff of steam */}
                    {effects.map(e => (
                        <g key={e.id} transform={`translate(${e.x} ${e.y})`}>
                            {e.kind === 'leak'
                                ? [0, 0.55, 1.1, 1.65, 2.2].map((delay, i) => (
                                    <g key={i} transform={`translate(${(i % 2) * 3 - 1.5} ${R})`}>
                                        <path
                                            d="M0 4Q-3.5 9 0 11Q3.5 9 0 4Z"
                                            fill={e.color}
                                            className="animate-drip"
                                            style={{ animationDelay: `${delay}s` }}
                                        />
                                    </g>
                                ))
                                : [0, 0.15, 0.3, 0.45, 0.6, 0.75].map((delay, i) => (
                                    <circle
                                        key={i}
                                        cx={(i % 3 - 1) * 5}
                                        cy={-30}
                                        r={5}
                                        fill="#CBD5E1"
                                        className="animate-steam"
                                        style={{ animationDelay: `${delay}s` }}
                                    />
                                ))}
                        </g>
                    ))}

                    {/* Gate valves: steel body and bonnet with a red handwheel. Click to operate. */}
                    {net.valves.map((v, i) => (
                        <g
                            key={`v${i}`}
                            transform={`translate(${v.x} ${v.y})`}
                            className="pointer-events-auto cursor-pointer group"
                            onClick={() => operate(i, v)}
                        >
                            <title>{VALVE_HINTS[v.kind]}</title>
                            <circle r={24} cy={-8} fill="transparent" />
                            <g className="transition-[filter] duration-200 group-hover:[filter:drop-shadow(0_0_4px_rgba(14,116,144,0.7))]">
                                <path d="M-13 -10L13 10V-10L-13 10Z" fill="url(#pipe-steel-diag)" stroke="#475569" strokeWidth={1} strokeLinejoin="round" />
                                <circle r={3.5} fill="#64748B" stroke="#334155" strokeWidth={0.75} />
                                <rect x={-2.5} y={-22} width={5} height={12} fill="url(#pipe-steel)" stroke="#475569" strokeWidth={0.6} />
                                <ellipse
                                    cy={-23}
                                    rx={10}
                                    ry={2.8}
                                    fill="none"
                                    stroke="#DC2626"
                                    strokeWidth={2.4}
                                    className={turning.has(i) ? 'animate-handwheel' : ''}
                                />
                            </g>
                        </g>
                    ))}
                </>
            )}
        </svg>
    );
}
