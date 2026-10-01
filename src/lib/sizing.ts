// Process equipment sizing correlations, ported from the original Python tool
// (public/projects/sizing-program-code). All inputs and outputs are SI.

export const G = 9.81;

// ---------- Piping ----------

export function velocity(Q: number, D: number) {
    return Q / (Math.PI * D * D / 4);
}

export function reynolds(rho: number, v: number, D: number, mu: number) {
    return rho * v * D / mu;
}

export type FlowRegime = 'laminar' | 'transitional' | 'turbulent';

export function regime(Re: number): FlowRegime {
    if (Re < 2300) return 'laminar';
    if (Re < 4000) return 'transitional';
    return 'turbulent';
}

// Darcy friction factor: 64/Re for laminar flow, Swamee–Jain otherwise.
export function frictionFactor(Re: number, eps: number, D: number) {
    if (Re < 2300) return Re > 0 ? 64 / Re : Infinity;
    return 0.25 / Math.pow(Math.log10(eps / (3.7 * D) + 5.74 / Math.pow(Re, 0.9)), 2);
}

export function majorLossHead(f: number, L: number, D: number, v: number) {
    return f * (L / D) * v * v / (2 * G);
}

export function minorLossHead(K: number, v: number) {
    return K * v * v / (2 * G);
}

export function lineHydraulics(Q: number, rho: number, mu: number, L: number, D: number, eps: number, K: number) {
    const v = velocity(Q, D);
    const Re = reynolds(rho, v, D, mu);
    const f = frictionFactor(Re, eps, D);
    const hMajor = majorLossHead(f, L, D, v);
    const hMinor = minorLossHead(K, v);
    const hTotal = hMajor + hMinor;
    return { v, Re, regime: regime(Re), f, hMajor, hMinor, hTotal, dP_Pa: rho * G * hTotal };
}

// ---------- Pipe sizing ----------

// Schedule 40 inside diameters (inches) by nominal pipe size.
export const SCH40: { nps: string; idIn: number }[] = [
    { nps: '1/2"', idIn: 0.622 }, { nps: '3/4"', idIn: 0.824 }, { nps: '1"', idIn: 1.049 },
    { nps: '1-1/4"', idIn: 1.380 }, { nps: '1-1/2"', idIn: 1.610 }, { nps: '2"', idIn: 2.067 },
    { nps: '2-1/2"', idIn: 2.469 }, { nps: '3"', idIn: 3.068 }, { nps: '4"', idIn: 4.026 },
    { nps: '5"', idIn: 5.047 }, { nps: '6"', idIn: 6.065 }, { nps: '8"', idIn: 7.981 },
    { nps: '10"', idIn: 10.020 }, { nps: '12"', idIn: 11.938 }, { nps: '14"', idIn: 13.124 },
    { nps: '16"', idIn: 15.000 }, { nps: '18"', idIn: 16.876 }, { nps: '20"', idIn: 18.812 },
    { nps: '24"', idIn: 22.624 },
];

// Minimum inside diameter that keeps velocity at or below the target: D = sqrt(4Q / (pi v)).
export function diameterForVelocity(Q: number, vTarget: number) {
    return Math.sqrt(4 * Q / (Math.PI * vTarget));
}

// Smallest standard Sch 40 pipe whose inside diameter is at least D (so velocity stays at or under target).
export function standardPipe(D: number) {
    const match = SCH40.find(p => p.idIn * 0.0254 >= D);
    return match ? { ...match, idM: match.idIn * 0.0254 } : null;
}

// ---------- Pump ----------

export function totalDynamicHead(zSuc: number, zDis: number, PSuc_Pa: number, PDis_Pa: number, rho: number, hMajor: number, hMinor: number) {
    const staticHead = zDis - zSuc;
    const pressureHead = (PDis_Pa - PSuc_Pa) / (rho * G);
    return { staticHead, pressureHead, TDH: staticHead + pressureHead + hMajor + hMinor };
}

export function pumpPower(rho: number, Q: number, H: number, efficiency: number) {
    const hydraulic_W = rho * G * Q * H;
    return { hydraulic_W, shaft_W: hydraulic_W / efficiency };
}

// NPSHa = P_surface/(rho g) + (z_surface - z_pump) - P_vap/(rho g) - suction losses
export function npshAvailable(PSurface_Pa: number, PVap_Pa: number, zSurface: number, zPump: number, rho: number, hSuctionLosses: number) {
    return PSurface_Pa / (rho * G) + (zSurface - zPump) - PVap_Pa / (rho * G) - hSuctionLosses;
}

// ---------- Reactor ----------

// CSTR, single irreversible reaction with -rA = k CA^n: V = FA0 X / (-rA at outlet conditions).
export function cstrVolume(Q: number, CA0: number, X: number, k: number, n: number) {
    const FA0 = Q * CA0;
    const CAout = CA0 * (1 - X);
    const rAout = k * Math.pow(CAout, n);
    const V = FA0 * X / rAout;
    return { V, tau: V / Q, CAout, rAout, FA0 };
}
