import streamlit as st

from piping import G
from pump import pump_power
from system import total_dynamic_head
from npsh import npsh_available
from pipe_sizing import suggest_diameter_by_velocity, standard_pipe, pipe_hydraulics_summary, velocity_notes
from heat_exchanger import size_heat_exchanger, tube_count
from tank import size_tank
from reactions import cstr_volume_from_conversion, pfr_volume_from_conversion
from flash import isothermal_flash

# Same modules, inputs, defaults and checks as the web version at hekmatk.com/calculator.
# Streamlit reruns on every input change, so results update live.

st.set_page_config(page_title="ChemE Sizing Tool", page_icon="🧪", layout="centered")
st.title("Process Equipment Sizing Tool")
st.caption("Preliminary sizing for pumps, pipelines, heat exchangers, tanks, reactors and flash drums. SI units.")

tool = st.sidebar.radio("Module", ["Pump", "Pipe sizing", "Heat exchanger", "Tank", "Reactors", "Flash drum"])
st.sidebar.markdown("---")
st.sidebar.caption(f"g = {G} m/s². Friction factor: 64/Re (laminar) or Swamee–Jain. Screening-level estimates only.")


def show_notes(notes):
    for note in notes:
        st.warning(note)


def fluid_inputs():
    st.subheader("Fluid")
    c1, c2 = st.columns(2)
    rho = c1.number_input("Density ρ (kg/m³)", value=1000.0, step=10.0)
    mu = c2.number_input("Viscosity μ (Pa·s)", value=0.001, step=0.0005, format="%.6f", help="Water at 20 °C ≈ 0.001 Pa·s")
    return rho, mu


def flow_input(rho=None):
    st.subheader("Flow")
    mode = st.radio("Flow input", ["Volumetric flow", "Mass flow"], horizontal=True)
    if mode == "Volumetric flow":
        return st.number_input("Volumetric flow Q (m³/s)", value=0.005, step=0.001, format="%.6f")
    m_dot = st.number_input("Mass flow ṁ (kg/s)", value=5.0, step=0.5)
    if rho is None:
        rho = st.number_input("Density ρ (kg/m³)", value=1000.0, step=10.0)
    return m_dot / rho if rho > 0 else 0.0


try:
    # ==========================
    # Pump
    # ==========================
    if tool == "Pump":
        st.write("Total dynamic head, pump power and optional NPSH available for a single-line system.")
        rho, mu = fluid_inputs()
        Q = flow_input(rho)

        st.subheader("System")
        c1, c2 = st.columns(2)
        z_suc = c1.number_input("Suction elevation (m)", value=0.0, step=0.5)
        z_dis = c2.number_input("Discharge elevation (m)", value=10.0, step=0.5)
        P_suc = c1.number_input("Suction pressure (kPa abs)", value=101.325, step=5.0)
        P_dis = c2.number_input("Discharge pressure (kPa abs)", value=101.325, step=5.0)

        st.subheader("Piping")
        c1, c2 = st.columns(2)
        L = c1.number_input("Pipe length L (m)", min_value=0.0, value=50.0, step=5.0)
        D = c2.number_input("Inner diameter D (m)", value=0.05, step=0.005, format="%.4f")
        eps = c1.number_input("Roughness ε (m)", min_value=0.0, value=0.000045, step=0.00001, format="%.6f", help="Commercial steel ≈ 0.000045 m")
        K = c2.number_input("Total minor loss K", min_value=0.0, value=5.0, step=0.5)
        eff = st.number_input("Pump efficiency η (0–1)", value=0.70, step=0.01)

        st.subheader("NPSH available")
        do_npsh = st.checkbox("Include suction-side NPSH check")
        if do_npsh:
            c1, c2 = st.columns(2)
            P_surf = c1.number_input("Suction surface pressure (kPa abs)", value=101.325, step=5.0)
            P_vap = c2.number_input("Vapour pressure (kPa abs)", value=3.2, step=0.5, help="Water at 25 °C ≈ 3.2 kPa")
            z_surf = c1.number_input("Liquid surface elevation (m)", value=0.0, step=0.5)
            z_pump = c2.number_input("Pump centreline elevation (m)", value=0.0, step=0.5)
            L_suc = c1.number_input("Suction line length (m)", min_value=0.0, value=5.0, step=1.0)
            K_suc = c2.number_input("Suction minor loss K", min_value=0.0, value=2.0, step=0.5)

        if rho <= 0 or mu <= 0 or Q <= 0:
            raise ValueError("Density, viscosity and flow rate must be > 0.")
        if D <= 0:
            raise ValueError("Pipe inner diameter must be > 0.")
        if not (0 < eff <= 1):
            raise ValueError("Pump efficiency must be between 0 and 1.")

        line = pipe_hydraulics_summary(Q, rho, mu, L, D, eps, K)
        head = total_dynamic_head(z_suc, z_dis, P_suc * 1000, P_dis * 1000, rho, line["h_major_m"], line["h_minor_m"])
        notes = velocity_notes(line["v_m_s"], line["regime"])

        st.subheader("Results")
        if head["TDH_m"] <= 0:
            st.metric("Total dynamic head (m)", f"{head['TDH_m']:.3f}")
            notes.insert(0, "TDH is zero or negative, so the system flows on its own (by gravity or pressure) and no pump is needed for this duty.")
        else:
            power = pump_power(rho, Q, head["TDH_m"], eff)
            c1, c2, c3 = st.columns(3)
            c1.metric("Total dynamic head (m)", f"{head['TDH_m']:.3f}")
            c2.metric("Hydraulic power (kW)", f"{power['hydraulic_power_W']/1000:.3f}")
            c3.metric("Shaft power (kW)", f"{power['shaft_power_W']/1000:.3f}")

        st.write(f"Flow **{Q:.5f} m³/s** ({Q*3600:.2f} m³/h) · velocity **{line['v_m_s']:.3f} m/s** · "
                 f"Re **{line['Re']:.3g}** ({line['regime']}) · f **{line['f']:.4f}**")
        st.write(f"Static head **{head['delta_z_m']:.3f} m** · pressure head **{head['pressure_head_m']:.3f} m** · "
                 f"major losses **{line['h_major_m']:.3f} m** · minor losses **{line['h_minor_m']:.3f} m** · "
                 f"line ΔP **{line['dP_Pa']/1000:.2f} kPa**")

        if do_npsh:
            # Suction line assumed to share the discharge line's diameter and roughness.
            suction = pipe_hydraulics_summary(Q, rho, mu, L_suc, D, eps, K_suc)
            npsha = npsh_available(P_surf * 1000, P_vap * 1000, z_surf, z_pump, rho, suction["h_total_m"])
            st.metric("NPSH available (m)", f"{npsha:.3f}")
            st.write(f"Suction line losses **{suction['h_total_m']:.3f} m**")
            if npsha < 1:
                notes.append(f"NPSHa of {npsha:.2f} m is very low. Most pumps will cavitate; raise the suction level, shorten the suction line or lower the pump.")
            else:
                notes.append("Compare NPSHa to the pump's NPSHr from its curve, keeping a margin (commonly ≥ 1 m or 10–35%).")
        show_notes(notes)

    # ==========================
    # Pipe sizing
    # ==========================
    elif tool == "Pipe sizing":
        st.write("Line size from a target velocity, rounded up to a standard Schedule 40 pipe, with pressure losses.")
        rho, mu = fluid_inputs()
        Q = flow_input(rho)

        st.subheader("Line")
        c1, c2 = st.columns(2)
        L = c1.number_input("Pipe length L (m)", min_value=0.0, value=50.0, step=5.0)
        v_target = c2.number_input("Target velocity (m/s)", value=1.5, step=0.1, help="Liquid lines are typically ~1–3 m/s")
        eps = c1.number_input("Roughness ε (m)", min_value=0.0, value=0.000045, step=0.00001, format="%.6f")
        K = c2.number_input("Total minor loss K", min_value=0.0, value=5.0, step=0.5)

        if rho <= 0 or mu <= 0 or Q <= 0:
            raise ValueError("Density, viscosity and flow rate must be > 0.")

        D_min = suggest_diameter_by_velocity(Q, v_target)
        pipe = standard_pipe(D_min)
        D = pipe[2] if pipe else D_min
        line = pipe_hydraulics_summary(Q, rho, mu, L, D, eps, K)
        notes = velocity_notes(line["v_m_s"], line["regime"])
        if not pipe:
            notes.insert(0, 'Required diameter is larger than 24" Sch 40; results use the exact calculated diameter.')

        st.subheader("Results")
        c1, c2, c3 = st.columns(3)
        c1.metric("Recommended pipe", f"{pipe[0]} Sch 40" if pipe else f"{D_min*1000:.0f} mm ID")
        c2.metric("Velocity (m/s)", f"{line['v_m_s']:.3f}")
        c3.metric("Pressure drop (kPa)", f"{line['dP_Pa']/1000:.2f}")
        st.write(f"Calculated minimum ID **{D_min*1000:.1f} mm**" + (f" · standard pipe ID **{pipe[2]*1000:.1f} mm** ({pipe[1]}\")" if pipe else ""))
        st.write(f"Re **{line['Re']:.3g}** ({line['regime']}) · f **{line['f']:.4f}** · "
                 f"major **{line['h_major_m']:.3f} m** · minor **{line['h_minor_m']:.3f} m** · total **{line['h_total_m']:.3f} m**")
        show_notes(notes)

    # ==========================
    # Heat exchanger
    # ==========================
    elif tool == "Heat exchanger":
        st.write("Heat duty, cold-side outlet temperature, LMTD and required area from Q = U·A·ΔT_lm.")
        st.subheader("Hot stream")
        c1, c2 = st.columns(2)
        m_hot = c1.number_input("Mass flow (kg/s)", value=2.0, step=0.1, key="mh")
        cp_hot = c2.number_input("Heat capacity cp (kJ/(kg·K))", value=4.18, step=0.1, key="cph", help="Water ≈ 4.18")
        Th_in = c1.number_input("Inlet temperature (°C)", value=90.0, step=1.0)
        Th_out = c2.number_input("Outlet temperature (°C)", value=50.0, step=1.0)
        st.subheader("Cold stream")
        c1, c2 = st.columns(2)
        m_cold = c1.number_input("Mass flow (kg/s)", value=3.0, step=0.1, key="mc")
        cp_cold = c2.number_input("Heat capacity cp (kJ/(kg·K))", value=4.18, step=0.1, key="cpc")
        Tc_in = c1.number_input("Inlet temperature (°C)", value=20.0, step=1.0, help="Outlet comes from the energy balance")
        st.subheader("Exchanger")
        counter = st.radio("Flow arrangement", ["Counter-current", "Co-current"], horizontal=True) == "Counter-current"
        c1, c2, c3 = st.columns(3)
        U = c1.number_input("Overall U (W/(m²·K))", value=850.0, step=50.0)
        tube_od_mm = c2.number_input("Tube OD (mm)", value=25.4, step=1.0, help="Optional")
        tube_L = c3.number_input("Tube length (m)", value=4.88, step=0.5, help="Optional")

        hx = size_heat_exchanger(m_hot, cp_hot, Th_in, Th_out, m_cold, cp_cold, Tc_in, U, counter)

        st.subheader("Results")
        c1, c2, c3 = st.columns(3)
        c1.metric("Required area (m²)", f"{hx['area_m2']:.2f}")
        c2.metric("Heat duty (kW)", f"{hx['duty_kW']:.1f}")
        c3.metric("LMTD (K)", f"{hx['LMTD_K']:.2f}")
        st.write(f"Cold outlet **{hx['Tc_out_C']:.1f} °C** · ΔT₁ / ΔT₂ **{hx['dT1_K']:.1f} / {hx['dT2_K']:.1f} K**")
        if tube_od_mm > 0 and tube_L > 0:
            st.write(f"Tubes needed (single pass): **{tube_count(hx['area_m2'], tube_od_mm / 1000, tube_L)} × {tube_L:.2f} m**")
        notes = ["U is an assumed overall coefficient. Typical ranges: water–water 800–1500, organic–water 250–750, gas–liquid 20–300 W/(m²·K)."]
        if not counter:
            notes.append("Counter-current flow gives a higher LMTD and a smaller exchanger for the same duty.")
        show_notes(notes)

    # ==========================
    # Tank
    # ==========================
    elif tool == "Tank":
        st.write("Storage or surge vessel size from flow and hold-up time, as a cylinder of a chosen L/D ratio.")
        Q = flow_input()
        st.subheader("Vessel")
        c1, c2, c3 = st.columns(3)
        hold = c1.number_input("Hold-up time (min)", value=30.0, step=5.0, help="Surge drums are often 5–15 min; storage much longer")
        fill = c2.number_input("Fill fraction (0–1)", value=0.8, step=0.05, help="Typically 0.7–0.85")
        LD = c3.number_input("L/D ratio", value=3.0, step=0.5)

        t = size_tank(Q, hold, fill, LD)

        st.subheader("Results")
        c1, c2, c3 = st.columns(3)
        c1.metric("Vessel volume (m³)", f"{t['vessel_m3']:.2f}")
        c2.metric("Diameter (m)", f"{t['D_m']:.2f}")
        c3.metric("Length / height (m)", f"{t['L_m']:.2f}")
        st.write(f"Liquid hold-up **{t['liquid_m3']:.2f} m³** · empty space **{t['vessel_m3'] - t['liquid_m3']:.2f} m³**")
        show_notes(["Common L/D ratios: about 1–1.5 for vertical storage tanks and 3–5 for horizontal drums. Heads are not included in the volume."])

    # ==========================
    # Reactors
    # ==========================
    elif tool == "Reactors":
        st.write("CSTR and PFR volumes for a single irreversible reaction, −rA = k·CAⁿ, at a target conversion.")
        Q = flow_input()
        st.subheader("Reaction")
        c1, c2 = st.columns(2)
        CA0 = c1.number_input("Inlet concentration CA0 (mol/m³)", value=1000.0, step=50.0)
        X = c2.number_input("Target conversion X (0–1)", value=0.80, step=0.01)
        n = c1.number_input("Reaction order n", min_value=0.0, value=1.0, step=0.5)
        k = c2.number_input("Rate constant k", value=0.1, step=0.01, help="Units depend on n")

        c = cstr_volume_from_conversion(Q, CA0, X, k, n)
        p = pfr_volume_from_conversion(Q, CA0, X, k, n)

        st.subheader("Results")
        c1, c2, c3 = st.columns(3)
        c1.metric("CSTR volume (m³)", f"{c['V_m3']:.3f}")
        c2.metric("PFR volume (m³)", f"{p['V_m3']:.3f}")
        c3.metric("Outlet CA (mol/m³)", f"{c['CA_out_mol_m3']:.1f}")
        st.write(f"F_A0 **{c['FA0_mol_s']:.2f} mol/s** · −rA,out **{c['rA_out_mol_m3_s']:.3g} mol/(m³·s)** · "
                 f"τ CSTR **{c['tau_s']:.1f} s** · τ PFR **{p['tau_s']:.1f} s** · "
                 + (f"CSTR/PFR **{c['V_m3']/p['V_m3']:.2f}×**" if n > 0 else "CSTR/PFR **1.00×** (zero order)"))
        show_notes([
            "For positive reaction orders a PFR needs less volume than a CSTR for the same conversion; the gap grows with conversion and order.",
            "Units of k depend on the reaction order: s⁻¹ for first order, m³/(mol·s) for second order.",
        ])

    # ==========================
    # Flash drum
    # ==========================
    else:
        st.write("Isothermal flash with constant K-values: vapour fraction and phase compositions from Rachford–Rice.")
        F = st.number_input("Feed flow F (mol/s)", value=100.0, step=10.0)
        st.caption("K = y/x at the drum temperature and pressure (e.g. DePriester charts or Raoult's law, K = Psat/P). Set z = 0 to skip a row.")
        defaults = [(0.3, 3.0), (0.3, 1.2), (0.4, 0.3), (0.0, 0.0)]
        comps = []
        for i, (z0, K0) in enumerate(defaults, start=1):
            c1, c2 = st.columns(2)
            z = c1.number_input(f"Component {i}: feed mole fraction z", min_value=0.0, value=z0, step=0.05, key=f"z{i}")
            K = c2.number_input(f"Component {i}: K-value", min_value=0.0, value=K0, step=0.1, key=f"K{i}")
            if z > 0 or K > 0:
                comps.append((i, z, K))
        if F <= 0:
            raise ValueError("Feed flow must be > 0.")

        r = isothermal_flash([z for _, z, _ in comps], [K for _, _, K in comps])

        st.subheader("Results")
        c1, c2, c3 = st.columns(3)
        c1.metric("Vapour fraction V/F", f"{r['psi']:.3f}")
        c2.metric("Vapour flow (mol/s)", f"{F * r['psi']:.2f}")
        c3.metric("Liquid flow (mol/s)", f"{F * (1 - r['psi']):.2f}")
        st.table({
            "Component": [i for i, _, _ in comps],
            "K": [K for _, _, K in comps],
            "z": [round(v, 3) for v in r["z"]],
            "x (liquid)": [round(v, 3) for v in r["x"]],
            "y (vapour)": [round(v, 3) for v in r["y"]],
        })
        notes = []
        if abs(r["feed_sum"] - 1) > 1e-6:
            notes.append(f"Feed fractions summed to {r['feed_sum']:.3f} and were normalised to 1.")
        if r["phase"] == "liquid":
            notes.append(f"Σ zᵢKᵢ = {r['bubble_sum']:.3f} ≤ 1, so the feed is below its bubble point and stays all liquid.")
        if r["phase"] == "vapour":
            notes.append(f"Σ zᵢ/Kᵢ = {r['dew_sum']:.3f} ≤ 1, so the feed is above its dew point and is all vapour.")
        show_notes(notes)

except ValueError as e:
    st.error(str(e))
