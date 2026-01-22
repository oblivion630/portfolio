# npsh.py
G = 9.81

def npsh_available(
    P_surface_Pa: float,     # suction tank absolute pressure (Pa)
    Pvap_Pa: float,          # vapor pressure (Pa)
    z_surface_m: float,      # liquid surface elevation (m)
    z_pump_m: float,         # pump centerline elevation (m)
    rho: float,
    h_suction_losses_m: float
) -> float:
    """
    NPSHa = (P_surface/(rho g)) + (z_surface - z_pump) - (Pvap/(rho g)) - h_losses_suction
    """
    if rho <= 0:
        raise ValueError("Density must be > 0.")
    return (P_surface_Pa/(rho*G)) + (z_surface_m - z_pump_m) - (Pvap_Pa/(rho*G)) - h_suction_losses_m
