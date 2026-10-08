# heat_exchanger.py
import math


def size_heat_exchanger(
    m_hot_kg_s: float, cp_hot_kJ_kgK: float, Th_in_C: float, Th_out_C: float,
    m_cold_kg_s: float, cp_cold_kJ_kgK: float, Tc_in_C: float,
    U_W_m2K: float, counter_current: bool = True
) -> dict:
    """
    Heat duty from the hot stream, cold outlet from the energy balance, then the area from
        Q = U * A * LMTD
    Counter-current: dT1 = Th_in - Tc_out, dT2 = Th_out - Tc_in
    Co-current:      dT1 = Th_in - Tc_in,  dT2 = Th_out - Tc_out
    """
    if min(m_hot_kg_s, cp_hot_kJ_kgK, m_cold_kg_s, cp_cold_kJ_kgK, U_W_m2K) <= 0:
        raise ValueError("Flow rates, heat capacities and U must be > 0.")
    if not Th_in_C > Th_out_C:
        raise ValueError("Hot outlet must be cooler than the hot inlet.")
    if not Th_in_C > Tc_in_C:
        raise ValueError("Hot inlet must be hotter than the cold inlet.")

    duty_kW = m_hot_kg_s * cp_hot_kJ_kgK * (Th_in_C - Th_out_C)
    Tc_out_C = Tc_in_C + duty_kW / (m_cold_kg_s * cp_cold_kJ_kgK)

    if counter_current:
        dT1, dT2 = Th_in_C - Tc_out_C, Th_out_C - Tc_in_C
    else:
        dT1, dT2 = Th_in_C - Tc_in_C, Th_out_C - Tc_out_C
    if dT1 <= 0 or dT2 <= 0:
        arrangement = "counter-current" if counter_current else "co-current"
        raise ValueError(f"Temperature cross: the cold stream would leave at {Tc_out_C:.1f} °C, "
                         f"which this {arrangement} arrangement can't reach.")

    lmtd = dT1 if abs(dT1 - dT2) < 1e-9 else (dT1 - dT2) / math.log(dT1 / dT2)
    area_m2 = duty_kW * 1000.0 / (U_W_m2K * lmtd)

    return {"duty_kW": duty_kW, "Tc_out_C": Tc_out_C, "dT1_K": dT1, "dT2_K": dT2, "LMTD_K": lmtd, "area_m2": area_m2}


def tube_count(area_m2: float, tube_od_m: float, tube_length_m: float) -> int:
    """Single-pass tube count from outside area per tube (pi * OD * L)."""
    return math.ceil(area_m2 / (math.pi * tube_od_m * tube_length_m))
