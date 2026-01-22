# results.py

def print_pump_results(results):
    print("\n--- Pump Sizing Results ---")
    print(f"Volumetric flowrate: {results['volumetric_flow_m3_s']:.4f} m³/s")
    print(f"Hydraulic power:     {results['hydraulic_power_W']:.2f} W")
    print(f"Shaft power:         {results['shaft_power_W']:.2f} W")
