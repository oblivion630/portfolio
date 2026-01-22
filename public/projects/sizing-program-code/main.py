# main.py

from pump import size_pump
from results import print_pump_results

def main():
    # --- USER INPUTS ---
    density = 1000.0        # kg/m^3 (water)
    head = 25.0             # m
    efficiency = 0.70       # decimal

    # Choose ONE:
    volumetric_flow = None  # m^3/s
    mass_flow = 5.0         # kg/s

    results = size_pump(
        density_kg_m3=density,
        head_m=head,
        efficiency=efficiency,
        volumetric_flow_m3_s=volumetric_flow,
        mass_flow_kg_s=mass_flow
    )

    print_pump_results(results)


if __name__ == "__main__":
    main()
