import streamlit as st

from pump import pump_power
from system import total_dynamic_head
from piping import velocity, reynolds, friction_factor, major_loss_head, minor_loss_head
from npsh import npsh_available

from reactions import cstr_volume_from_conversion
from pipe_sizing import suggest_diameter_by_velocity, pipe_hydraulics_summary

st.set_page_config(page_title="ChemE Sizing Tool", page_icon="🧪", layout="centered")
st.title("Process Equipment Sizing Tool")

tool = st.sidebar.selectbox("Select module", ["Pump (system TDH + power)", "Pipe sizing", "CSTR sizing"])

st.sidebar.markdown("---")
st.sidebar.caption("Units (SI): ρ kg/m³, μ Pa·s, Q m³/s, P kPa(abs), L m, D m, Head m")

# --------------------------
# Common flow + fluid inputs
# --------------------------
st.subheader("Fluid + Flow")
flow_mode = st.radio("Flow input type:", ["Volumetric flow (m³/s)", "Mass flow (kg/s)"], horizontal=True)

colA, colB = st.columns(2)
with colA:
    rho = st.number_input("Density ρ (kg/m³)", min_value=0.0, value=1000.0, step=10.0)
with colB:
    mu = st.number_input("Viscosity μ (Pa·s)", min_value=0.0, value=0.001, step=0.0005, format="%.6f")

Q = None
if flow_mode == "Volumetric flow (m³/s)":
    Q = st.number_input("Volumetric flow Q (m³/s)", min_value=0.0, value=0.005, step=0.001, format="%.6f")
else:
    m_dot = st.number_input("Mass flow ṁ (kg/s)", min_value=0.0, value=5.0, step=0.5)
    Q = (m_dot / rho) if rho > 0 else 0.0

st.divider()

# ==========================
# 1) PUMP MODULE
# ==========================
if tool == "Pump (system TDH + power)":
    st.subheader("Pump System Inputs")

    col1, col2 = st.columns(2)
    with col1:
        z_suc = st.number_input("Suction elevation z_s (m)", value=0.0, step=0.5)
        P_suc_kPa = st.number_input("Suction pressure P_s (kPa abs)", value=101.325, step=5.0)
    with col2:
        z_dis = st.number_input("Discharge elevation z_d (m)", value=10.0, step=0.5)
        P_dis_kPa = st.number_input("Discharge pressure P_d (kPa abs)", value=101.325, step=5.0)

    st.markdown("### Piping")
    col3, col4 = st.columns(2)
    with col3:
        L = st.number_input("Pipe length L (m)", min_value=0.0, value=50.0, step=5.0)
        D = st.number_input("Pipe inner diameter D (m)", min_value=0.0, value=0.05, step=0.005, format="%.4f")
    with col4:
        eps = st.number_input("Roughness ε (m)", min_value=0.0, value=0.000045, step=0.00001, format="%.6f")
        K_total = st.number_input("Total minor loss K (sum)", min_value=0.0, value=5.0, step=0.5)

    eff = st.number_input("Pump efficiency η (0–1)", min_value=0.01, max_value=1.0, value=0.70, step=0.01)

    st.subheader("Optional NPSH")
    do_npsh = st.checkbox("Include NPSH available (suction side)")
    if do_npsh:
        col5, col6 = st.columns(2)
        with col5:
            P_surface_kPa = st.number_input("Suction surface pressure (kPa abs)", value=101.325, step=5.0)
            Pvap_kPa = st.number_input("Vapor pressure (kPa abs)", value=3.2, step=0.5)
            z_surface = st.number_input("Suction liquid surface elevation (m)", value=0.0, step=0.5)
        with col6:
            z_pump = st.number_input("Pump centerline elevation (m)", value=0.0, step=0.5)
            L_suc = st.number_input("Suction line length (m)", min_value=0.0, value=5.0, step=1.0)
            K_suc = st.number_input("Suction minor loss K (sum)", min_value=0.0, value=2.0, step=0.5)

    run = st.button("Calculate Pump", use_container_width=True)

    if run:
        try:
            if rho <= 0 or mu <= 0 or Q <= 0:
                raise ValueError("Check inputs: rho, mu, and Q must be > 0.")
            if D <= 0:
                raise ValueError("Pipe diameter must be > 0.")

            v = velocity(Q, D)
            Re = reynolds(rho, v, D, mu)
            f = friction_factor(Re, eps, D)
            h_major = major_loss_head(f, L, D, v)
            h_minor = minor_loss_head(K_total, v)

            sys = total_dynamic_head(
                z_suction_m=z_suc,
                z_discharge_m=z_dis,
                P_suction_Pa=P_suc_kPa * 1000.0,
                P_discharge_Pa=P_dis_kPa * 1000.0,
                rho=rho,
                h_major_m=h_major,
                h_minor_m=h_minor
            )

            power = pump_power(rho=rho, Q_m3_s=Q, H_m=sys["TDH_m"], efficiency=eff)

            st.success("Done.")
            c1, c2, c3 = st.columns(3)
            c1.metric("TDH (m)", f"{sys['TDH_m']:.3f}")
            c2.metric("Hydraulic Power (kW)", f"{power['hydraulic_power_W']/1000:.3f}")
            c3.metric("Shaft Power (kW)", f"{power['shaft_power_W']/1000:.3f}")

            st.markdown("### Details")
            st.write(f"Velocity v = **{v:.3f} m/s**")
            st.write(f"Re = **{Re:.2e}**  |  f = **{f:.4f}**")
            st.write(f"Major losses = **{h_major:.3f} m**  |  Minor losses = **{h_minor:.3f} m**")
            st.write(f"Static head Δz = **{sys['delta_z_m']:.3f} m**  |  Pressure head = **{sys['pressure_head_m']:.3f} m**")

            if do_npsh:
                # suction losses (assume same D for now)
                v_suc = v
                Re_suc = reynolds(rho, v_suc, D, mu)
                f_suc = friction_factor(Re_suc, eps, D)
                h_major_suc = major_loss_head(f_suc, L_suc, D, v_suc)
                h_minor_suc = minor_loss_head(K_suc, v_suc)
                h_suc_losses = h_major_suc + h_minor_suc

                npsha = npsh_available(
                    P_surface_Pa=P_surface_kPa * 1000.0,
                    Pvap_Pa=Pvap_kPa * 1000.0,
                    z_surface_m=z_surface,
                    z_pump_m=z_pump,
                    rho=rho,
                    h_suction_losses_m=h_suc_losses
                )
                st.markdown("### NPSH Available")
                st.write(f"Suction losses used = **{h_suc_losses:.3f} m**")
                st.metric("NPSHa (m)", f"{npsha:.3f}")

        except Exception as e:
            st.error(str(e))

# ==========================
# 2) PIPE SIZING MODULE
# ==========================
elif tool == "Pipe sizing":
    st.subheader("Pipe Sizing (velocity-based)")

    col1, col2 = st.columns(2)
    with col1:
        L = st.number_input("Pipe length L (m)", min_value=0.0, value=50.0, step=5.0)
        eps = st.number_input("Roughness ε (m)", min_value=0.0, value=0.000045, step=0.00001, format="%.6f")
    with col2:
        K_total = st.number_input("Total minor loss K (sum)", min_value=0.0, value=5.0, step=0.5)
        v_target = st.number_input("Target velocity (m/s)", min_value=0.1, value=1.5, step=0.1)

    st.caption("Tip: typical liquid line velocities are often ~1–3 m/s depending on standard/service.")

    run = st.button("Size Pipe", use_container_width=True)

    if run:
        try:
            if rho <= 0 or mu <= 0 or Q <= 0:
                raise ValueError("Check inputs: rho, mu, and Q must be > 0.")

            D_suggest = suggest_diameter_by_velocity(Q, v_target)

            summary = pipe_hydraulics_summary(
                Q_m3_s=Q, rho=rho, mu=mu,
                L_m=L, D_m=D_suggest, eps_m=eps, K_total=K_total
            )

            st.success("Done.")
            c1, c2, c3 = st.columns(3)
            c1.metric("Suggested D (m)", f"{D_suggest:.4f}")
            c2.metric("Velocity (m/s)", f"{summary['v_m_s']:.3f}")
            c3.metric("Total losses (m)", f"{summary['h_total_m']:.3f}")

            st.markdown("### Details")
            st.write(f"Re = **{summary['Re']:.2e}**  |  f = **{summary['f']:.4f}**")
            st.write(f"Major losses = **{summary['h_major_m']:.3f} m**  |  Minor losses = **{summary['h_minor_m']:.3f} m**")

        except Exception as e:
            st.error(str(e))

# ==========================
# 3) CSTR MODULE
# ==========================
else:
    st.subheader("CSTR Sizing (single reaction)")

    st.markdown("Rate model: **rA = k · CA^n** (consumption of A)")
    col1, col2 = st.columns(2)
    with col1:
        CA0 = st.number_input("Inlet concentration CA0 (mol/m³)", min_value=0.0, value=1000.0, step=50.0)
        X = st.number_input("Target conversion X (0–1)", min_value=0.01, max_value=0.99, value=0.80, step=0.01)
    with col2:
        order = st.number_input("Reaction order n", min_value=0.0, value=1.0, step=0.5)
        k = st.number_input("Rate constant k", min_value=0.0, value=0.1, step=0.01)

    st.caption("Note: k units depend on the reaction order. This module is for screening-level sizing.")

    run = st.button("Size CSTR", use_container_width=True)

    if run:
        try:
            if Q <= 0:
                raise ValueError("Flow Q must be > 0 (set in the Fluid + Flow section).")

            res = cstr_volume_from_conversion(Q_m3_s=Q, CA0_mol_m3=CA0, X=X, k=k, order=order)

            st.success("Done.")
            c1, c2, c3 = st.columns(3)
            c1.metric("Reactor Volume V (m³)", f"{res['V_m3']:.3f}")
            c2.metric("Residence Time τ (s)", f"{res['tau_s']:.1f}")
            c3.metric("CA,out (mol/m³)", f"{res['CA_out_mol_m3']:.1f}")

            st.markdown("### Details")
            st.write(f"F_A0 = **{res['FA0_mol_s']:.2f} mol/s**")
            st.write(f"rA,out = **{res['rA_out_mol_m3_s']:.3e} mol/(m³·s)**")

        except Exception as e:
            st.error(str(e))
