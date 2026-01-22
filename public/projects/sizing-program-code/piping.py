# piping.py
import math

G = 9.81

def velocity(Q_m3_s: float, D_m: float) -> float:
    A = math.pi * (D_m**2) / 4.0
    return Q_m3_s / A

def reynolds(rho: float, v: float, D_m: float, mu: float) -> float:
    if mu <= 0:
        raise ValueError("Viscosity must be > 0.")
    return rho * v * D_m / mu

def friction_factor(Re: float, eps_m: float, D_m: float) -> float:
    # Laminar
    if Re < 2300:
        return 64.0 / Re if Re > 0 else float("inf")

    # Turbulent (Swamee–Jain)
    if D_m <= 0:
        raise ValueError("Pipe diameter must be > 0.")
    if Re <= 0:
        raise ValueError("Re must be > 0.")

    return 0.25 / (math.log10(eps_m/(3.7*D_m) + 5.74/(Re**0.9)))**2

def major_loss_head(f: float, L_m: float, D_m: float, v: float) -> float:
    # h_f = f (L/D) (v^2 / 2g)
    if D_m <= 0:
        raise ValueError("Pipe diameter must be > 0.")
    return f * (L_m / D_m) * (v**2) / (2.0 * G)

def minor_loss_head(K_total: float, v: float) -> float:
    # h_m = K (v^2 / 2g)
    return K_total * (v**2) / (2.0 * G)
