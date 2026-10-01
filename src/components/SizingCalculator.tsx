"use client";

import React, { useState } from 'react';
import {
    G, lineHydraulics, diameterForVelocity, standardPipe, totalDynamicHead, pumpPower, npshAvailable, cstrVolume, pfrVolume,
    heatExchanger, tankSize, flash, FlowRegime,
} from '@/lib/sizing';

type Module = 'pump' | 'pipe' | 'hx' | 'tank' | 'reactor' | 'flash';

const MODULES: { id: Module; label: string; blurb: string }[] = [
    { id: 'pump', label: 'Pump', blurb: 'Total dynamic head, pump power and optional NPSH available for a single-line system.' },
    { id: 'pipe', label: 'Pipe sizing', blurb: 'Line size from a target velocity, rounded up to a standard Schedule 40 pipe, with pressure losses.' },
    { id: 'hx', label: 'Heat exchanger', blurb: 'Heat duty, cold-side outlet temperature, LMTD and required area from Q = U·A·ΔT_lm.' },
    { id: 'tank', label: 'Tank', blurb: 'Storage or surge vessel size from flow and hold-up time, as a cylinder of a chosen L/D ratio.' },
    { id: 'reactor', label: 'Reactors', blurb: 'CSTR and PFR volumes for a single irreversible reaction, −rA = k·CAⁿ, at a target conversion.' },
    { id: 'flash', label: 'Flash drum', blurb: 'Isothermal flash with constant K-values: vapour fraction and phase compositions from Rachford–Rice.' },
];

// Defaults match the original Python tool.
const DEFAULTS = {
    rho: '1000', mu: '0.001', flowMode: 'vol', Q: '0.005', mdot: '5',
    zSuc: '0', zDis: '10', PSuc: '101.325', PDis: '101.325',
    L: '50', D: '0.05', eps: '0.000045', K: '5', eff: '0.70',
    npsh: 'no', PSurf: '101.325', PVap: '3.2', zSurf: '0', zPump: '0', LSuc: '5', KSuc: '2',
    vTarget: '1.5',
    CA0: '1000', X: '0.80', n: '1', k: '0.1',
    mHot: '2', cpHot: '4.18', ThIn: '90', ThOut: '50', mCold: '3', cpCold: '4.18', TcIn: '20', U: '850',
    hxFlow: 'counter', tubeOD: '25.4', tubeL: '4.88',
    hold: '30', fill: '0.8', LD: '3',
    F: '100', z1: '0.3', z2: '0.3', z3: '0.4', z4: '', K1: '3.0', K2: '1.2', K3: '0.3', K4: '',
};
type Inputs = typeof DEFAULTS;
type Key = keyof Inputs;

const fmt = (x: number, digits = 3) =>
    !isFinite(x) ? '—' : Math.abs(x) !== 0 && (Math.abs(x) >= 1e5 || Math.abs(x) < 1e-3) ? x.toExponential(2) : x.toFixed(digits);

const REGIME_TEXT: Record<FlowRegime, string> = { laminar: 'Laminar', transitional: 'Transitional', turbulent: 'Turbulent' };

function Field({ label, unit, name, inputs, set, hint }: {
    label: string; unit?: string; name: Key; inputs: Inputs; set: (k: Key, v: string) => void; hint?: string;
}) {
    return (
        <label className="block">
            <span className="text-sm font-medium text-ink">{label}</span>
            <div className="mt-1 flex rounded-md border border-line bg-white focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
                <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={inputs[name]}
                    onChange={e => set(name, e.target.value)}
                    className="w-full min-w-0 rounded-md px-3 py-2 text-ink outline-none tabular-nums bg-transparent"
                />
                {unit && <span className="flex items-center px-3 text-sm text-muted border-l border-line whitespace-nowrap">{unit}</span>}
            </div>
            {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
        </label>
    );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <fieldset className="rounded-xl border border-line bg-white p-5">
            <legend className="px-1 text-sm font-semibold uppercase tracking-wider text-accent">{title}</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
        </fieldset>
    );
}

function Metric({ label, value, unit, primary }: { label: string; value: string; unit: string; primary?: boolean }) {
    return (
        <div className={`rounded-lg p-4 ${primary ? 'bg-accent text-white' : 'bg-paper border border-line'}`}>
            <div className={`text-xs font-semibold uppercase tracking-wider ${primary ? 'text-white/80' : 'text-muted'}`}>{label}</div>
            <div className={`mt-1 text-2xl font-bold tabular-nums ${primary ? 'text-white' : 'text-ink'}`}>
                {value} <span className={`text-base font-medium ${primary ? 'text-white/80' : 'text-muted'}`}>{unit}</span>
            </div>
        </div>
    );
}

function Rows({ rows }: { rows: [string, string][] }) {
    return (
        <dl className="divide-y divide-line text-sm">
            {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2">
                    <dt className="text-muted">{k}</dt>
                    <dd className="font-medium text-ink tabular-nums text-right">{v}</dd>
                </div>
            ))}
        </dl>
    );
}

function Notes({ items }: { items: string[] }) {
    if (!items.length) return null;
    return (
        <ul className="space-y-2">
            {items.map(t => (
                <li key={t} className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-900">{t}</li>
            ))}
        </ul>
    );
}

type Result = { metrics: { label: string; value: string; unit: string }[]; rows: [string, string][]; notes: string[] } | { error: string };

function velocityNotes(v: number, regimeName: FlowRegime) {
    const notes: string[] = [];
    if (regimeName === 'transitional') notes.push('Flow is transitional (2300 ≤ Re < 4000), so the friction factor is uncertain in this range. Treat losses as approximate.');
    if (v > 3) notes.push(`Velocity of ${v.toFixed(2)} m/s is above the ~1–3 m/s typical for liquid lines. Expect higher losses and erosion risk; consider a larger line.`);
    if (v < 0.5) notes.push(`Velocity of ${v.toFixed(2)} m/s is low for a liquid line. Solids may settle; a smaller line may be more economical.`);
    return notes;
}

function calculate(m: Module, i: Inputs): Result {
    const num = (k: Key) => parseFloat(i[k]);

    if (m === 'hx') {
        const mHot = num('mHot'), cpHot = num('cpHot'), ThIn = num('ThIn'), ThOut = num('ThOut');
        const mCold = num('mCold'), cpCold = num('cpCold'), TcIn = num('TcIn'), U = num('U');
        if (![mHot, cpHot, mCold, cpCold, U].every(v => v > 0)) return { error: 'Flow rates, heat capacities and U must be greater than 0.' };
        if (![ThIn, ThOut, TcIn].every(isFinite)) return { error: 'Enter all three temperatures.' };
        if (!(ThIn > ThOut)) return { error: 'Hot outlet must be cooler than the hot inlet.' };
        if (!(ThIn > TcIn)) return { error: 'Hot inlet must be hotter than the cold inlet.' };
        const counter = i.hxFlow === 'counter';
        const hx = heatExchanger(mHot, cpHot, ThIn, ThOut, mCold, cpCold, TcIn, U, counter);
        if (!(hx.dT1 > 0 && hx.dT2 > 0)) {
            return { error: `Temperature cross: the cold stream would leave at ${hx.TcOut.toFixed(1)} °C, which this ${counter ? 'counter-current' : 'co-current'} arrangement can't reach. Increase the cold flow${counter ? '' : ' or switch to counter-current'}.` };
        }
        const tubeOD = num('tubeOD') / 1000, tubeL = num('tubeL');
        const rows: [string, string][] = [
            ['Cold outlet temperature', `${fmt(hx.TcOut, 1)} °C`],
            ['ΔT₁ / ΔT₂', `${fmt(hx.dT1, 1)} / ${fmt(hx.dT2, 1)} K`],
            ['Flow arrangement', counter ? 'Counter-current' : 'Co-current'],
        ];
        if (tubeOD > 0 && tubeL > 0) rows.push(['Tubes needed (single pass)', `${Math.ceil(hx.area / (Math.PI * tubeOD * tubeL))} × ${fmt(tubeL, 2)} m`]);
        return {
            metrics: [
                { label: 'Required area', value: fmt(hx.area, 2), unit: 'm²' },
                { label: 'Heat duty', value: fmt(hx.duty_kW, 1), unit: 'kW' },
                { label: 'LMTD', value: fmt(hx.lmtd, 2), unit: 'K' },
            ],
            rows,
            notes: [
                'U is an assumed overall coefficient. Typical ranges: water–water 800–1500, organic–water 250–750, gas–liquid 20–300 W/(m²·K).',
                ...(counter ? [] : ['Counter-current flow gives a higher LMTD and a smaller exchanger for the same duty.']),
            ],
        };
    }

    if (m === 'flash') {
        const comps = ([1, 2, 3, 4] as const)
            .map(c => ({ c, z: num(`z${c}` as Key), K: num(`K${c}` as Key) }))
            .filter(({ z, K }) => isFinite(z) || isFinite(K));
        if (comps.length < 2) return { error: 'Enter z and K for at least two components.' };
        if (!comps.every(({ z, K }) => z > 0 && K > 0)) return { error: 'Each component needs a feed fraction z > 0 and a K-value > 0.' };
        const F = num('F');
        if (!(F > 0)) return { error: 'Feed flow must be greater than 0.' };
        const zSum = comps.reduce((sum, { z }) => sum + z, 0);
        const z = comps.map(({ z }) => z / zSum);
        const r = flash(z, comps.map(({ K }) => K));
        const notes: string[] = [];
        if (Math.abs(zSum - 1) > 1e-6) notes.push(`Feed fractions summed to ${zSum.toFixed(3)} and were normalised to 1.`);
        if (r.phase === 'liquid') notes.push(`Σ zᵢKᵢ = ${r.bubble.toFixed(3)} ≤ 1, so the feed is below its bubble point and stays all liquid.`);
        if (r.phase === 'vapour') notes.push(`Σ zᵢ/Kᵢ = ${r.dew.toFixed(3)} ≤ 1, so the feed is above its dew point and is all vapour.`);
        return {
            metrics: [
                { label: 'Vapour fraction V/F', value: fmt(r.psi, 3), unit: '' },
                { label: 'Vapour flow', value: fmt(F * r.psi, 2), unit: 'mol/s' },
                { label: 'Liquid flow', value: fmt(F * (1 - r.psi), 2), unit: 'mol/s' },
            ],
            rows: comps.map(({ c, K }, idx) => [
                `Component ${c} (K = ${K})`,
                `z ${z[idx].toFixed(3)} · x ${r.x[idx].toFixed(3)} · y ${r.y[idx].toFixed(3)}`,
            ] as [string, string]),
            notes,
        };
    }

    const rho = num('rho'), mu = num('mu');
    const Q = i.flowMode === 'vol' ? num('Q') : num('mdot') / rho;

    if (m === 'pump' || m === 'pipe') {
        if (!(rho > 0)) return { error: 'Density must be greater than 0.' };
        if (!(mu > 0)) return { error: 'Viscosity must be greater than 0.' };
    }
    if (i.flowMode === 'mass' && !(rho > 0)) return { error: 'Density must be greater than 0 to convert mass flow.' };
    if (!(Q > 0)) return { error: 'Flow rate must be greater than 0.' };
    const flowRows: [string, string][] = [['Volumetric flow', `${fmt(Q, 5)} m³/s  (${fmt(Q * 3600, 2)} m³/h)`]];

    if (m === 'pump') {
        const L = num('L'), D = num('D'), eps = num('eps'), K = num('K'), eff = num('eff');
        if (!(D > 0)) return { error: 'Pipe inner diameter must be greater than 0.' };
        if (!(L >= 0) || !(eps >= 0) || !(K >= 0)) return { error: 'Length, roughness and K must be 0 or more.' };
        if (!(eff > 0 && eff <= 1)) return { error: 'Pump efficiency must be between 0 and 1.' };

        const line = lineHydraulics(Q, rho, mu, L, D, eps, K);
        const head = totalDynamicHead(num('zSuc'), num('zDis'), num('PSuc') * 1000, num('PDis') * 1000, rho, line.hMajor, line.hMinor);
        if (![head.TDH, line.Re].every(isFinite)) return { error: 'Check the inputs: some values are missing.' };

        const notes = velocityNotes(line.v, line.regime);
        const rows: [string, string][] = [
            ...flowRows,
            ['Velocity', `${fmt(line.v)} m/s`],
            ['Reynolds number', `${fmt(line.Re, 0)} (${REGIME_TEXT[line.regime]})`],
            ['Darcy friction factor', fmt(line.f, 4)],
            ['Static head Δz', `${fmt(head.staticHead)} m`],
            ['Pressure head ΔP/ρg', `${fmt(head.pressureHead)} m`],
            ['Major (friction) losses', `${fmt(line.hMajor)} m`],
            ['Minor (fitting) losses', `${fmt(line.hMinor)} m`],
            ['Line pressure drop', `${fmt(line.dP_Pa / 1000, 2)} kPa`],
        ];

        if (i.npsh === 'yes') {
            // Suction line assumed to share the discharge line's diameter and roughness.
            const suction = lineHydraulics(Q, rho, mu, num('LSuc'), D, eps, num('KSuc'));
            const npsha = npshAvailable(num('PSurf') * 1000, num('PVap') * 1000, num('zSurf'), num('zPump'), rho, suction.hTotal);
            rows.push(['Suction line losses', `${fmt(suction.hTotal)} m`], ['NPSH available', `${fmt(npsha)} m`]);
            if (npsha < 1) notes.push(`NPSHa of ${npsha.toFixed(2)} m is very low. Most pumps will cavitate; raise the suction level, shorten the suction line or lower the pump.`);
            else notes.push('Compare NPSHa to the pump’s NPSHr from its curve, keeping a margin (commonly ≥ 1 m or 10–35%).');
        }

        if (head.TDH <= 0) {
            return {
                metrics: [{ label: 'Total dynamic head', value: fmt(head.TDH), unit: 'm' }],
                rows,
                notes: ['TDH is zero or negative, so the system will flow on its own (by gravity or pressure) and no pump is needed for this duty.', ...notes],
            };
        }
        const power = pumpPower(rho, Q, head.TDH, eff);
        return {
            metrics: [
                { label: 'Total dynamic head', value: fmt(head.TDH), unit: 'm' },
                { label: 'Hydraulic power', value: fmt(power.hydraulic_W / 1000), unit: 'kW' },
                { label: 'Shaft power', value: fmt(power.shaft_W / 1000), unit: 'kW' },
            ],
            rows,
            notes,
        };
    }

    if (m === 'pipe') {
        const L = num('L'), eps = num('eps'), K = num('K'), vTarget = num('vTarget');
        if (!(vTarget > 0)) return { error: 'Target velocity must be greater than 0.' };
        if (!(L >= 0) || !(eps >= 0) || !(K >= 0)) return { error: 'Length, roughness and K must be 0 or more.' };

        const Dmin = diameterForVelocity(Q, vTarget);
        const pipe = standardPipe(Dmin);
        const D = pipe ? pipe.idM : Dmin;
        const line = lineHydraulics(Q, rho, mu, L, D, eps, K);
        const notes = velocityNotes(line.v, line.regime);
        if (!pipe) notes.unshift('Required diameter is larger than 24" Sch 40; results use the exact calculated diameter.');

        return {
            metrics: [
                { label: 'Recommended pipe', value: pipe ? pipe.nps : `${fmt(Dmin * 1000, 0)} mm`, unit: pipe ? 'Sch 40' : 'ID' },
                { label: 'Velocity', value: fmt(line.v), unit: 'm/s' },
                { label: 'Pressure drop', value: fmt(line.dP_Pa / 1000, 2), unit: 'kPa' },
            ],
            rows: [
                ...flowRows,
                ['Calculated minimum ID', `${fmt(Dmin * 1000, 1)} mm`],
                ...(pipe ? [['Standard pipe ID', `${fmt(pipe.idM * 1000, 1)} mm (${pipe.idIn}")`] as [string, string]] : []),
                ['Reynolds number', `${fmt(line.Re, 0)} (${REGIME_TEXT[line.regime]})`],
                ['Darcy friction factor', fmt(line.f, 4)],
                ['Major (friction) losses', `${fmt(line.hMajor)} m`],
                ['Minor (fitting) losses', `${fmt(line.hMinor)} m`],
                ['Total head loss', `${fmt(line.hTotal)} m`],
            ],
            notes,
        };
    }

    if (m === 'tank') {
        const hold = num('hold'), fill = num('fill'), LD = num('LD');
        if (!(hold > 0)) return { error: 'Hold-up time must be greater than 0.' };
        if (!(fill > 0 && fill <= 1)) return { error: 'Fill fraction must be between 0 and 1.' };
        if (!(LD > 0)) return { error: 'L/D ratio must be greater than 0.' };
        const t = tankSize(Q, hold * 60, fill, LD);
        return {
            metrics: [
                { label: 'Vessel volume', value: fmt(t.vessel, 2), unit: 'm³' },
                { label: 'Diameter', value: fmt(t.D, 2), unit: 'm' },
                { label: 'Length / height', value: fmt(t.L, 2), unit: 'm' },
            ],
            rows: [
                ...flowRows,
                ['Liquid hold-up', `${fmt(t.liquid, 2)} m³ (${fmt(t.liquid * 1000, 0)} L)`],
                ['Vessel volume', `${fmt(t.vessel * 1000, 0)} L`],
                ['Empty space at fill fraction', `${fmt(t.vessel - t.liquid, 2)} m³`],
            ],
            notes: ['Common L/D ratios: about 1–1.5 for vertical storage tanks and 3–5 for horizontal drums. Heads are not included in the volume.'],
        };
    }

    const CA0 = num('CA0'), X = num('X'), n = num('n'), k = num('k');
    if (!(CA0 > 0)) return { error: 'Inlet concentration must be greater than 0.' };
    if (!(X > 0 && X < 1)) return { error: 'Conversion must be between 0 and 1 (exclusive).' };
    if (!(k > 0)) return { error: 'Rate constant k must be greater than 0.' };
    if (!(n >= 0)) return { error: 'Reaction order must be 0 or more.' };
    const r = cstrVolume(Q, CA0, X, k, n);
    const p = pfrVolume(Q, CA0, X, k, n);
    const time = (s: number) => s >= 3600 ? `${fmt(s / 3600, 2)} h` : s >= 60 ? `${fmt(s / 60, 2)} min` : `${fmt(s, 1)} s`;
    return {
        metrics: [
            { label: 'CSTR volume', value: fmt(r.V), unit: 'm³' },
            { label: 'PFR volume', value: fmt(p.V), unit: 'm³' },
            { label: 'Outlet CA', value: fmt(r.CAout, 1), unit: 'mol/m³' },
        ],
        rows: [
            ...flowRows,
            ['Molar feed FA0', `${fmt(r.FA0, 2)} mol/s`],
            ['Rate at outlet −rA', `${fmt(r.rAout)} mol/(m³·s)`],
            ['CSTR residence time τ', time(r.tau)],
            ['PFR residence time τ', time(p.tau)],
            ['CSTR / PFR volume ratio', n > 0 ? `${fmt(r.V / p.V, 2)} ×` : '1.00 × (zero order)'],
        ],
        notes: [
            'For positive reaction orders a PFR needs less volume than a CSTR for the same conversion; the gap grows with conversion and order.',
            'Units of k depend on the reaction order: s⁻¹ for first order, m³/(mol·s) for second order.',
        ],
    };
}

export default function SizingCalculator() {
    const [module, setModule] = useState<Module>('pump');
    const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
    const set = (k: Key, v: string) => setInputs(prev => ({ ...prev, [k]: v }));
    const f = { inputs, set };
    const result = calculate(module, inputs);
    const active = MODULES.find(m => m.id === module)!;
    const usesFlow = module === 'pump' || module === 'pipe' || module === 'tank' || module === 'reactor';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
            <div className="space-y-6">
                <div role="tablist" aria-label="Calculator module" className="flex flex-wrap gap-1 rounded-lg border border-line bg-white p-1 w-fit">
                    {MODULES.map(m => (
                        <button
                            key={m.id}
                            role="tab"
                            aria-selected={module === m.id}
                            onClick={() => setModule(m.id)}
                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${module === m.id ? 'bg-ink text-white' : 'text-body hover:text-accent'}`}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
                <p className="text-body">{active.blurb}</p>

                {(module === 'pump' || module === 'pipe') && (
                    <Group title="Fluid">
                        <Field label="Density ρ" unit="kg/m³" name="rho" {...f} />
                        <Field label="Viscosity μ" unit="Pa·s" name="mu" {...f} hint="Water at 20 °C ≈ 0.001 Pa·s" />
                    </Group>
                )}

                {usesFlow && <fieldset className="rounded-xl border border-line bg-white p-5">
                    <legend className="px-1 text-sm font-semibold uppercase tracking-wider text-accent">Flow</legend>
                    <div className="flex gap-4 mb-4 text-sm">
                        {[['vol', 'Volumetric flow'], ['mass', 'Mass flow']].map(([value, text]) => (
                            <label key={value} className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="flowMode" checked={inputs.flowMode === value} onChange={() => set('flowMode', value)} className="accent-[#0E7490]" />
                                {text}
                            </label>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {inputs.flowMode === 'vol'
                            ? <Field label="Volumetric flow Q" unit="m³/s" name="Q" {...f} />
                            : <>
                                <Field label="Mass flow ṁ" unit="kg/s" name="mdot" {...f} />
                                {(module === 'reactor' || module === 'tank') && <Field label="Density ρ" unit="kg/m³" name="rho" {...f} />}
                            </>}
                    </div>
                </fieldset>}

                {module === 'pump' && (
                    <>
                        <Group title="System">
                            <Field label="Suction elevation" unit="m" name="zSuc" {...f} />
                            <Field label="Discharge elevation" unit="m" name="zDis" {...f} />
                            <Field label="Suction pressure" unit="kPa abs" name="PSuc" {...f} />
                            <Field label="Discharge pressure" unit="kPa abs" name="PDis" {...f} />
                        </Group>
                        <Group title="Piping">
                            <Field label="Pipe length L" unit="m" name="L" {...f} />
                            <Field label="Inner diameter D" unit="m" name="D" {...f} />
                            <Field label="Roughness ε" unit="m" name="eps" {...f} hint="Commercial steel ≈ 0.000045 m" />
                            <Field label="Total minor loss K" name="K" {...f} hint="Sum of fitting and valve K values" />
                            <Field label="Pump efficiency η" unit="0–1" name="eff" {...f} />
                        </Group>
                        <fieldset className="rounded-xl border border-line bg-white p-5">
                            <legend className="px-1 text-sm font-semibold uppercase tracking-wider text-accent">NPSH available</legend>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={inputs.npsh === 'yes'} onChange={e => set('npsh', e.target.checked ? 'yes' : 'no')} className="accent-[#0E7490]" />
                                Include suction-side NPSH check
                            </label>
                            {inputs.npsh === 'yes' && (
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Suction surface pressure" unit="kPa abs" name="PSurf" {...f} />
                                    <Field label="Vapour pressure" unit="kPa abs" name="PVap" {...f} hint="Water at 25 °C ≈ 3.2 kPa" />
                                    <Field label="Liquid surface elevation" unit="m" name="zSurf" {...f} />
                                    <Field label="Pump centreline elevation" unit="m" name="zPump" {...f} />
                                    <Field label="Suction line length" unit="m" name="LSuc" {...f} />
                                    <Field label="Suction minor loss K" name="KSuc" {...f} />
                                </div>
                            )}
                        </fieldset>
                    </>
                )}

                {module === 'pipe' && (
                    <Group title="Line">
                        <Field label="Pipe length L" unit="m" name="L" {...f} />
                        <Field label="Target velocity" unit="m/s" name="vTarget" {...f} hint="Liquid lines are typically ~1–3 m/s" />
                        <Field label="Roughness ε" unit="m" name="eps" {...f} hint="Commercial steel ≈ 0.000045 m" />
                        <Field label="Total minor loss K" name="K" {...f} hint="Sum of fitting and valve K values" />
                    </Group>
                )}

                {module === 'tank' && (
                    <Group title="Vessel">
                        <Field label="Hold-up time" unit="min" name="hold" {...f} hint="Surge drums are often 5–15 min; storage much longer" />
                        <Field label="Fill fraction" unit="0–1" name="fill" {...f} hint="Typically 0.7–0.85" />
                        <Field label="L/D ratio" name="LD" {...f} />
                    </Group>
                )}

                {module === 'hx' && (
                    <>
                        <Group title="Hot stream">
                            <Field label="Mass flow" unit="kg/s" name="mHot" {...f} />
                            <Field label="Heat capacity cp" unit="kJ/(kg·K)" name="cpHot" {...f} hint="Water ≈ 4.18" />
                            <Field label="Inlet temperature" unit="°C" name="ThIn" {...f} />
                            <Field label="Outlet temperature" unit="°C" name="ThOut" {...f} />
                        </Group>
                        <Group title="Cold stream">
                            <Field label="Mass flow" unit="kg/s" name="mCold" {...f} />
                            <Field label="Heat capacity cp" unit="kJ/(kg·K)" name="cpCold" {...f} />
                            <Field label="Inlet temperature" unit="°C" name="TcIn" {...f} hint="Outlet comes from the energy balance" />
                        </Group>
                        <fieldset className="rounded-xl border border-line bg-white p-5">
                            <legend className="px-1 text-sm font-semibold uppercase tracking-wider text-accent">Exchanger</legend>
                            <div className="flex gap-4 mb-4 text-sm">
                                {[['counter', 'Counter-current'], ['co', 'Co-current']].map(([value, text]) => (
                                    <label key={value} className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="hxFlow" checked={inputs.hxFlow === value} onChange={() => set('hxFlow', value)} className="accent-[#0E7490]" />
                                        {text}
                                    </label>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Overall coefficient U" unit="W/(m²·K)" name="U" {...f} />
                                <Field label="Tube outer diameter" unit="mm" name="tubeOD" {...f} hint="1 in = 25.4 mm (optional)" />
                                <Field label="Tube length" unit="m" name="tubeL" {...f} hint="16 ft = 4.88 m (optional)" />
                            </div>
                        </fieldset>
                    </>
                )}

                {module === 'flash' && (
                    <>
                        <Group title="Feed">
                            <Field label="Feed flow F" unit="mol/s" name="F" {...f} />
                        </Group>
                        <fieldset className="rounded-xl border border-line bg-white p-5">
                            <legend className="px-1 text-sm font-semibold uppercase tracking-wider text-accent">Components</legend>
                            <p className="text-xs text-muted mb-4">K = y/x at the drum temperature and pressure (e.g. from DePriester charts or Raoult&apos;s law, K = Psat/P). Leave a row blank to skip it.</p>
                            <div className="space-y-3">
                                {([1, 2, 3, 4] as const).map(c => (
                                    <div key={c} className="grid grid-cols-[auto_1fr_1fr] gap-3 items-end">
                                        <span className="pb-2.5 text-sm font-medium text-ink w-6">{c}</span>
                                        <Field label="Feed mole fraction z" name={`z${c}` as Key} {...f} />
                                        <Field label="K-value" name={`K${c}` as Key} {...f} />
                                    </div>
                                ))}
                            </div>
                        </fieldset>
                    </>
                )}

                {module === 'reactor' && (
                    <Group title="Reaction">
                        <Field label="Inlet concentration CA0" unit="mol/m³" name="CA0" {...f} />
                        <Field label="Target conversion X" unit="0–1" name="X" {...f} />
                        <Field label="Reaction order n" name="n" {...f} />
                        <Field label="Rate constant k" name="k" {...f} hint="Units depend on n" />
                    </Group>
                )}

                <button onClick={() => setInputs(DEFAULTS)} className="text-sm font-medium text-muted hover:text-accent">
                    Reset to example values
                </button>
            </div>

            {/* Results */}
            <section aria-live="polite" className="lg:sticky lg:top-6 rounded-xl border border-line bg-white p-5 space-y-5">
                <h2 className="text-lg font-bold text-ink">Results</h2>
                {'error' in result ? (
                    <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800">{result.error}</p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-3">
                            {result.metrics.map((m, idx) => <Metric key={m.label} {...m} primary={idx === 0} />)}
                        </div>
                        <Rows rows={result.rows} />
                        <Notes items={result.notes} />
                    </>
                )}
                <p className="text-xs text-muted">g = {G} m/s². Friction factor: 64/Re (laminar) or Swamee–Jain. Screening-level estimates only.</p>
            </section>
        </div>
    );
}
