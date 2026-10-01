"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';

const FLUIDS = ["#14B8A6", "#F59E0B", "#8B5CF6", "#0EA5E9", "#F43F5E", "#84CC16"];
const CONTENT_WIDTH = 1152; // matches max-w-6xl
const SPEED = 320;          // px per second for a fluid slug

type ValveKind = 'leak' | 'steam' | 'burst' | 'flush';
const VALVE_KINDS: ValveKind[] = ['leak', 'steam', 'burst', 'flush'];
const VALVE_HINTS: Record<ValveKind, string> = {
    leak: "This valve looks a little worn…",
    steam: "Pressure relief valve",
    burst: "Open the valve",
    flush: "Main line valve",
};

type Segment = { d: string; rev: string; length: number };
type Valve = { x: number; y: number; seg: number; kind: ValveKind };
type Network = { width: number; height: number; segments: Segment[]; valves: Valve[]; tees: [number, number][] };
type Flow = { id: number; seg: number; color: string; reverse: boolean; fast?: boolean };
type Effect = { id: number; kind: 'leak' | 'steam'; x: number; y: number; color: string };

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

function seg(x1: number, y1: number, x2: number, y2: number): Segment {
    return { d: `M${x1} ${y1}L${x2} ${y2}`, rev: `M${x2} ${y2}L${x1} ${y1}`, length: Math.hypot(x2 - x1, y2 - y1) };
}

// Pipes run along the border between each section, plus down both side gutters on wide screens.
function buildNetwork(main: HTMLElement, kinds: ValveKind[]): Network {
    const width = main.clientWidth;
    const height = main.scrollHeight;
    const rows = Array.from(main.querySelectorAll<HTMLElement>(':scope > section[id], :scope > footer')).map(el => el.offsetTop);
    const gutter = (width - CONTENT_WIDTH) / 2;
    const sides = gutter >= 56;
    const left = sides ? Math.round(gutter / 2) : 0;
    const right = sides ? width - left : width;

    const segments: Segment[] = [];
    const valves: Valve[] = [];
    const tees: [number, number][] = [];

    rows.forEach((y, i) => {
        valves.push({ x: Math.round(width * (i % 2 ? 0.78 : 0.22)), y, seg: segments.length, kind: kinds[i % kinds.length] });
        segments.push(seg(left, y, right, y));
        if (sides) tees.push([left, y], [right, y]);
        if (sides && i > 0) {
            segments.push(seg(left, rows[i - 1], left, y));
            segments.push(seg(right, rows[i - 1], right, y));
        }
    });

    return { width, height, segments, valves, tees };
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

    // Every few seconds, send a slug of coloured fluid through a random pipe.
    const segmentCount = net?.segments.length ?? 0;
    useEffect(() => {
        if (!segmentCount || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        let timer: ReturnType<typeof setTimeout>;
        const tick = () => {
            setFlows(prev => prev.length >= 3 ? prev : [...prev, {
                id: nextId.current++,
                seg: Math.floor(Math.random() * segmentCount),
                color: pick(FLUIDS),
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

        const color = pick(FLUIDS);
        if (valve.kind === 'burst') {
            [0, 220, 440].forEach((delay, i) =>
                setTimeout(() => addFlow({ seg: valve.seg, color, reverse: i % 2 === 1, fast: true }), delay));
        } else if (valve.kind === 'flush') {
            net.segments.forEach((_, seg) => addFlow({ seg, color, reverse: false }));
        } else {
            const id = nextId.current++;
            setEffects(prev => [...prev, { id, kind: valve.kind as Effect['kind'], x: valve.x, y: valve.y, color }]);
            setTimeout(() => setEffects(prev => prev.filter(e => e.id !== id)), 5000);
        }
    };

    return (
        <svg
            ref={ref}
            aria-hidden="true"
            className="absolute top-0 left-0 z-[1] pointer-events-none"
            width={net?.width ?? 0}
            height={net?.height ?? 0}
            fill="none"
            strokeLinecap="round"
        >
            {net && (
                <>
                    {net.segments.map((s, i) => <path key={`w${i}`} d={s.d} stroke="#C3CEDB" strokeWidth={9} />)}
                    {net.segments.map((s, i) => <path key={`b${i}`} d={s.d} stroke="#FFFFFF" strokeWidth={4.5} />)}

                    {flows.filter(f => f.seg < net.segments.length).map(f => {
                        const s = net.segments[f.seg];
                        const seconds = Math.max(f.fast ? 0.6 : 1.5, s.length / (f.fast ? SPEED * 3 : SPEED));
                        return (
                            <path
                                key={f.id}
                                d={f.reverse ? s.rev : s.d}
                                pathLength={100}
                                stroke={f.color}
                                strokeOpacity={0.9}
                                strokeWidth={4.5}
                                strokeDasharray="22 200"
                                className="animate-fluid-slug"
                                style={{ '--flow-duration': `${seconds}s` } as React.CSSProperties}
                                onAnimationEnd={() => setFlows(prev => prev.filter(p => p.id !== f.id))}
                            />
                        );
                    })}

                    {net.tees.map(([x, y], i) => <circle key={`t${i}`} cx={x} cy={y} r={7} fill="#C3CEDB" />)}

                    {/* Leaks drip from under the valve; relief valves vent a puff of steam */}
                    {effects.map(e => (
                        <g key={e.id} transform={`translate(${e.x} ${e.y})`}>
                            {e.kind === 'leak'
                                ? [0, 0.55, 1.1, 1.65, 2.2].map((delay, i) => (
                                    <g key={i} transform={`translate(${(i % 2) * 3 - 1.5} 0)`}>
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
                                        cy={-16}
                                        r={5}
                                        fill="#CBD5E1"
                                        className="animate-steam"
                                        style={{ animationDelay: `${delay}s` }}
                                    />
                                ))}
                        </g>
                    ))}

                    {/* Gate valves: a bow-tie symbol with a handwheel. Click to operate. */}
                    {net.valves.map((v, i) => (
                        <g
                            key={`v${i}`}
                            transform={`translate(${v.x} ${v.y})`}
                            className="pointer-events-auto cursor-pointer group"
                            onClick={() => operate(i, v)}
                        >
                            <title>{VALVE_HINTS[v.kind]}</title>
                            <circle r={20} cy={-4} fill="transparent" />
                            <g stroke="#94A3B8" strokeWidth={1.75} strokeLinejoin="round" className="transition-[stroke] group-hover:stroke-[#0E7490]">
                                <path d="M-10 -7L10 7V-7L-10 7Z" fill="#FFFFFF" />
                                <path d="M0 0V-13" />
                                <path d="M-6 -13H6" strokeWidth={2.5} className={turning.has(i) ? 'animate-handwheel' : ''} />
                            </g>
                        </g>
                    ))}
                </>
            )}
        </svg>
    );
}
