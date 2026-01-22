# system.py
G = 9.81

def pressure_head(deltaP_Pa: float, rho: float) -> float:
    # H = ΔP/(ρg)
    if rho <= 0:
        raise ValueError("Density must be > 0.")
    return deltaP_Pa / (rho * G)

def total_dynamic_head(
    z_suction_m: float,
    z_discharge_m: float,
    P_suction_Pa: float,
    P_discharge_Pa: float,
    rho: float,
    h_major_m: float,
    h_minor_m: float
) -> dict:
    delta_z = z_discharge_m - z_suction_m
    deltaP = P_discharge_Pa - P_suction_Pa
    H_pressure = pressure_head(deltaP, rho)
    TDH = delta_z + H_pressure + h_major_m + h_minor_m

    return {
        "delta_z_m": delta_z,
        "deltaP_Pa": deltaP,
        "pressure_head_m": H_pressure,
        "major_losses_m": h_major_m,
        "minor_losses_m": h_minor_m,
        "TDH_m": TDH
    }
