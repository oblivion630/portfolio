# pipe_sizing.py
import math
from piping import G, velocity, reynolds, flow_regime, friction_factor, major_loss_head, minor_loss_head

# Schedule 40 inside diameters (inches) by nominal pipe size.
SCH40 = [
    ('1/2"', 0.622), ('3/4"', 0.824), ('1"', 1.049), ('1-1/4"', 1.380), ('1-1/2"', 1.610),
    ('2"', 2.067), ('2-1/2"', 2.469), ('3"', 3.068), ('4"', 4.026), ('5"', 5.047),
    ('6"', 6.065), ('8"', 7.981), ('10"', 10.020), ('12"', 11.938), ('14"', 13.124),
    ('16"', 15.000), ('18"', 16.876), ('20"', 18.812), ('24"', 22.624),
]


def suggest_diameter_by_velocity(Q_m3_s: float, v_target_m_s: float) -> float:
    """
    Minimum inside diameter that keeps velocity at or below the target:
      v = Q / A  =>  A = Q/v  =>  D = sqrt(4A/pi)
    """
    if Q_m3_s <= 0:
        raise ValueError("Q must be > 0.")
    if v_target_m_s <= 0:
        raise ValueError("Target velocity must be > 0.")
    A = Q_m3_s / v_target_m_s
    return math.sqrt(4.0 * A / math.pi)


def standard_pipe(D_min_m: float):
    """Smallest Sch 40 pipe whose inside diameter is at least D_min (so velocity stays at or under target).
    Returns (nominal size, inside diameter in inches, inside diameter in m), or None if larger than 24"."""
    for nps, id_in in SCH40:
        if id_in * 0.0254 >= D_min_m:
            return nps, id_in, id_in * 0.0254
    return None


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
    Computes v, Re, flow regime, f, major/minor head losses and pressure drop for a given line.
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
    h_total = h_major + h_minor

    return {
        "v_m_s": v,
        "Re": Re,
        "regime": flow_regime(Re),
        "f": f,
        "h_major_m": h_major,
        "h_minor_m": h_minor,
        "h_total_m": h_total,
        "dP_Pa": rho * G * h_total,
    }


def velocity_notes(v: float, regime: str) -> list:
    """Sanity checks shared by the pump and pipe sizing modules."""
    notes = []
    if regime == "transitional":
        notes.append("Flow is transitional (2300 ≤ Re < 4000), so the friction factor is uncertain. Treat losses as approximate.")
    if v > 3:
        notes.append(f"Velocity of {v:.2f} m/s is above the ~1–3 m/s typical for liquid lines. Expect higher losses and erosion risk; consider a larger line.")
    if v < 0.5:
        notes.append(f"Velocity of {v:.2f} m/s is low for a liquid line. Solids may settle; a smaller line may be more economical.")
    return notes
