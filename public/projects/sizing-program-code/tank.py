# tank.py
import math


def size_tank(Q_m3_s: float, hold_min: float, fill_fraction: float, L_over_D: float) -> dict:
    """
    Liquid hold-up = Q * residence time; vessel volume = hold-up / fill fraction;
    then a cylinder of the given L/D:  V = (pi/4) D^2 L  with  L = (L/D) D.
    Heads are not included.
    """
    if Q_m3_s <= 0:
        raise ValueError("Flow must be > 0.")
    if hold_min <= 0:
        raise ValueError("Hold-up time must be > 0.")
    if not (0 < fill_fraction <= 1):
        raise ValueError("Fill fraction must be between 0 and 1.")
    if L_over_D <= 0:
        raise ValueError("L/D must be > 0.")

    liquid = Q_m3_s * hold_min * 60.0
    vessel = liquid / fill_fraction
    D = (4.0 * vessel / (math.pi * L_over_D)) ** (1.0 / 3.0)
    return {"liquid_m3": liquid, "vessel_m3": vessel, "D_m": D, "L_m": L_over_D * D}
