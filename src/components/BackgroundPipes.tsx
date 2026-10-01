"use client";

import React, { useEffect, useRef, useState } from 'react';

const FLUIDS = ["#14B8A6", "#F59E0B", "#8B5CF6", "#0EA5E9", "#F43F5E", "#84CC16"];
const CONTENT_WIDTH = 1152; // matches max-w-6xl
const SPEED = 320;          // px per second for a fluid slug

type Segment = { d: string; rev: string; length: number };
type Network = { width: number; height: number; segments: Segment[]; valves: [number, number][]; tees: [number, number][] };
type Flow = { id: number; seg: number; color: string; reverse: boolean };

function seg(x1: number, y1: number, x2: number, y2: number): Segment {
    return { d: `M${x1} ${y1}L${x2} ${y2}`, rev: `M${x2} ${y2}L${x1} ${y1}`, length: Math.hypot(x2 - x1, y2 - y1) };
}

// Pipes run along the border between each section, plus down both side gutters on wide screens.
function buildNetwork(main: HTMLElement): Network {
    const width = main.clientWidth;
    const height = main.scrollHeight;
    const rows = Array.from(main.querySelectorAll<HTMLElement>(':scope > section[id], :scope > footer')).map(el => el.offsetTop);
    const gutter = (width - CONTENT_WIDTH) / 2;
    const sides = gutter >= 56;
    const left = sides ? Math.round(gutter / 2) : 0;
    const right = sides ? width - left : width;

    const segments: Segment[] = [];
    const valves: [number, number][] = [];
    const tees: [number, number][] = [];

    rows.forEach((y, i) => {
        segments.push(seg(left, y, right, y));
        valves.push([Math.round(width * (i % 2 ? 0.78 : 0.22)), y]);
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
    const [net, setNet] = useState<Network | null>(null);
    const [flows, setFlows] = useState<Flow[]>([]);

    // Measure the page and rebuild the network whenever its size changes.
    useEffect(() => {
        const main = ref.current?.parentElement;
        if (!main) return;
        const update = () => setNet(buildNetwork(main));
        update();
        const observer = new ResizeObserver(update);
        observer.observe(main);
        return () => observer.disconnect();
    }, []);

    // Every few seconds, send a slug of coloured fluid through a random pipe.
    const segmentCount = net?.segments.length ?? 0;
    useEffect(() => {
        if (!segmentCount || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        let id = 0;
        let timer: ReturnType<typeof setTimeout>;
        const tick = () => {
            setFlows(prev => prev.length >= 3 ? prev : [...prev, {
                id: id++,
                seg: Math.floor(Math.random() * segmentCount),
                color: FLUIDS[Math.floor(Math.random() * FLUIDS.length)],
                reverse: Math.random() < 0.5,
            }]);
            timer = setTimeout(tick, 1500 + Math.random() * 2000);
        };
        timer = setTimeout(tick, 1200);
        return () => clearTimeout(timer);
    }, [segmentCount]);

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
                                style={{ '--flow-duration': `${Math.max(1.5, s.length / SPEED)}s` } as React.CSSProperties}
                                onAnimationEnd={() => setFlows(prev => prev.filter(p => p.id !== f.id))}
                            />
                        );
                    })}

                    {net.tees.map(([x, y], i) => <circle key={`t${i}`} cx={x} cy={y} r={7} fill="#C3CEDB" />)}

                    {/* Gate valves: a bow-tie symbol with a handwheel stem */}
                    {net.valves.map(([x, y], i) => (
                        <g key={`v${i}`} transform={`translate(${x} ${y})`} stroke="#94A3B8" strokeWidth={1.75} strokeLinejoin="round">
                            <path d="M-10 -7L10 7V-7L-10 7Z" fill="#FFFFFF" />
                            <path d="M0 0V-13M-6 -13H6" />
                        </g>
                    ))}
                </>
            )}
        </svg>
    );
}
