# pump.py
G = 9.81

def pump_power(rho: float, Q_m3_s: float, H_m: float, efficiency: float) -> dict:
    if rho <= 0:
        raise ValueError("Density must be > 0.")
    if Q_m3_s <= 0:
        raise ValueError("Flow must be > 0.")
    if H_m <= 0:
        raise ValueError("Head must be > 0.")
    if not (0 < efficiency <= 1):
        raise ValueError("Efficiency must be between 0 and 1.")

    P_hyd_W = rho * G * Q_m3_s * H_m
    P_shaft_W = P_hyd_W / efficiency

    return {
        "hydraulic_power_W": P_hyd_W,
        "shaft_power_W": P_shaft_W
    }
