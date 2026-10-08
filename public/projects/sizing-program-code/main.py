# main.py
# Runs every module with the same example inputs as the web calculator (hekmatk.com/calculator)
# so results can be checked side by side:  python main.py

from piping import velocity, reynolds, friction_factor, major_loss_head, minor_loss_head
from system import total_dynamic_head
from pump import pump_power
from npsh import npsh_available
from pipe_sizing import suggest_diameter_by_velocity, standard_pipe, pipe_hydraulics_summary
from heat_exchanger import size_heat_exchanger, tube_count
from tank import size_tank
from reactions import cstr_volume_from_conversion, pfr_volume_from_conversion
from flash import isothermal_flash

rho, mu, Q = 1000.0, 0.001, 0.005  # water, m^3/s


def pump_example():
    D, L, eps, K = 0.05, 50.0, 0.000045, 5.0
    v = velocity(Q, D)
    Re = reynolds(rho, v, D, mu)
    f = friction_factor(Re, eps, D)
    h_major, h_minor = major_loss_head(f, L, D, v), minor_loss_head(K, v)
    sys = total_dynamic_head(0.0, 10.0, 101325.0, 101325.0, rho, h_major, h_minor)
    power = pump_power(rho, Q, sys["TDH_m"], 0.70)
    suction = major_loss_head(f, 5.0, D, v) + minor_loss_head(2.0, v)
    npsha = npsh_available(101325.0, 3200.0, 0.0, 0.0, rho, suction)
    print("--- Pump ---")
    print(f"TDH {sys['TDH_m']:.3f} m | hydraulic {power['hydraulic_power_W']/1000:.3f} kW | "
          f"shaft {power['shaft_power_W']/1000:.3f} kW | NPSHa {npsha:.3f} m")


def pipe_example():
    D_min = suggest_diameter_by_velocity(Q, 1.5)
    nps, id_in, D = standard_pipe(D_min)
    s = pipe_hydraulics_summary(Q, rho, mu, 50.0, D, 0.000045, 5.0)
    print("--- Pipe sizing ---")
    print(f"Minimum ID {D_min*1000:.1f} mm -> {nps} Sch 40 | v {s['v_m_s']:.3f} m/s | "
          f"dP {s['dP_Pa']/1000:.2f} kPa ({s['regime']})")


def hx_example():
    hx = size_heat_exchanger(2.0, 4.18, 90.0, 50.0, 3.0, 4.18, 20.0, 850.0, counter_current=True)
    print("--- Heat exchanger ---")
    print(f"Duty {hx['duty_kW']:.1f} kW | Tc,out {hx['Tc_out_C']:.1f} °C | LMTD {hx['LMTD_K']:.2f} K | "
          f"area {hx['area_m2']:.2f} m² | {tube_count(hx['area_m2'], 0.0254, 4.88)} tubes")


def tank_example():
    t = size_tank(Q, 30.0, 0.8, 3.0)
    print("--- Tank ---")
    print(f"Vessel {t['vessel_m3']:.2f} m³ | D {t['D_m']:.2f} m | L {t['L_m']:.2f} m")


def reactor_example():
    c = cstr_volume_from_conversion(Q, 1000.0, 0.80, 0.1, 1.0)
    p = pfr_volume_from_conversion(Q, 1000.0, 0.80, 0.1, 1.0)
    print("--- Reactors ---")
    print(f"CSTR {c['V_m3']:.3f} m³ | PFR {p['V_m3']:.3f} m³ | ratio {c['V_m3']/p['V_m3']:.2f}x")


def flash_example():
    r = isothermal_flash([0.3, 0.3, 0.4], [3.0, 1.2, 0.3])
    print("--- Flash drum ---")
    print(f"V/F {r['psi']:.3f} | x {[round(v, 3) for v in r['x']]} | y {[round(v, 3) for v in r['y']]}")


if __name__ == "__main__":
    pump_example()
    pipe_example()
    hx_example()
    tank_example()
    reactor_example()
    flash_example()
