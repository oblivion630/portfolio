# reactions.py
import math


def _check(Q_m3_s, CA0_mol_m3, X, k, order):
    if Q_m3_s <= 0:
        raise ValueError("Q must be > 0.")
    if CA0_mol_m3 <= 0:
        raise ValueError("CA0 must be > 0.")
    if not (0 < X < 1):
        raise ValueError("Conversion X must be between 0 and 1 (exclusive).")
    if k <= 0:
        raise ValueError("k must be > 0.")
    if order < 0:
        raise ValueError("Reaction order must be >= 0.")


def cstr_volume_from_conversion(
    Q_m3_s: float,
    CA0_mol_m3: float,
    X: float,
    k: float,
    order: float
) -> dict:
    """
    CSTR design for a single, irreversible reaction using a power-law rate:
        -rA = k * CA^order   (consumption of A)

    For a CSTR at steady state:
        V = F_A0 * X / (-rA,out)
    where:
        F_A0 = Q * CA0
        CA_out = CA0 * (1 - X)
        -rA,out = k * (CA_out)^order

    Returns: V_m3, tau_s, CA_out, rA_out, FA0
    """
    _check(Q_m3_s, CA0_mol_m3, X, k, order)

    FA0 = Q_m3_s * CA0_mol_m3
    CA_out = CA0_mol_m3 * (1.0 - X)
    rA_out = k * (CA_out ** order)  # mol/(m^3*s) with appropriate k

    V_m3 = (FA0 * X) / rA_out
    return {
        "V_m3": V_m3,
        "tau_s": V_m3 / Q_m3_s,
        "CA_out_mol_m3": CA_out,
        "rA_out_mol_m3_s": rA_out,
        "FA0_mol_s": FA0,
    }


def pfr_volume_from_conversion(
    Q_m3_s: float,
    CA0_mol_m3: float,
    X: float,
    k: float,
    order: float
) -> dict:
    """
    PFR with the same rate law, from integrating dV = F_A0 dX / (-rA) with CA = CA0 (1 - X):
        n = 1:   V = (Q/k) ln(1 / (1 - X))
        n != 1:  V = Q CA0^(1-n) / (k (n - 1)) * ((1 - X)^(1-n) - 1)
    """
    _check(Q_m3_s, CA0_mol_m3, X, k, order)

    if order == 1:
        V_m3 = (Q_m3_s / k) * math.log(1.0 / (1.0 - X))
    else:
        V_m3 = Q_m3_s * CA0_mol_m3 ** (1 - order) / (k * (order - 1)) * ((1 - X) ** (1 - order) - 1)
    return {"V_m3": V_m3, "tau_s": V_m3 / Q_m3_s}
