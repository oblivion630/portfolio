# units.py

def kg_s_to_m3_s(mass_flow_kg_s, density_kg_m3):
    """
    Convert mass flowrate to volumetric flowrate
    """
    if density_kg_m3 <= 0:
        raise ValueError("Density must be greater than zero.")
    return mass_flow_kg_s / density_kg_m3


def m3_s_to_kg_s(vol_flow_m3_s, density_kg_m3):
    """
    Convert volumetric flowrate to mass flowrate
    """
    return vol_flow_m3_s * density_kg_m3
