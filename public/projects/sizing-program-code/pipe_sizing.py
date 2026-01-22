# pipe_sizing.py
import math
from piping import velocity, reynolds, friction_factor, major_loss_head, minor_loss_head

def suggest_diameter_by_velocity(
    Q_m3_s: float,
    v_target_m_s: float
) -> float:
    """
    Solve for diameter from Q and target velocity:
      v = Q / A  =>  A = Q/v  =>  D = sqrt(4A/pi)
    """
    if Q_m3_s <= 0:
        raise ValueError("Q must be > 0.")
    if v_target_m_s <= 0:
        raise ValueError("Target velocity must be > 0.")
    A = Q_m3_s / v_target_m_s
    D = math.sqrt(4.0 * A / math.pi)
    return D

def pipe_hydraulics_summary(
    Q_m3_s: float,
    rho: float,
    mu: float,
    L_m: float,
    D_m: float,
    eps_m: float,
    K_total: float
) -> dict:
    """
    Computes v, Re, f, major/minor head losses for a given line.
    """
    if rho <= 0:
        raise ValueError("Density must be > 0.")
    if mu <= 0:
        raise ValueError("Viscosity must be > 0.")
    if L_m < 0:
        raise ValueError("Length must be >= 0.")
    if D_m <= 0:
        raise ValueError("Diameter must be > 0.")
    if eps_m < 0:
        raise ValueError("Roughness must be >= 0.")
    if K_total < 0:
        raise ValueError("K_total must be >= 0.")

    v = velocity(Q_m3_s, D_m)
    Re = reynolds(rho, v, D_m, mu)
    f = friction_factor(Re, eps_m, D_m)
    h_major = major_loss_head(f, L_m, D_m, v)
    h_minor = minor_loss_head(K_total, v)

    return {
        "v_m_s": v,
        "Re": Re,
        "f": f,
        "h_major_m": h_major,
        "h_minor_m": h_minor,
        "h_total_m": h_major + h_minor,
    }
