# flash.py


def isothermal_flash(z: list, K: list) -> dict:
    """
    Isothermal flash with constant K-values. Solves Rachford–Rice for psi = V/F:
        sum( z_i (K_i - 1) / (1 + psi (K_i - 1)) ) = 0
    Feed fractions are normalised to sum to 1. Checks bubble and dew points first:
        sum(z K) <= 1  -> subcooled liquid (psi = 0)
        sum(z / K) <= 1 -> superheated vapour (psi = 1)
    """
    if len(z) != len(K) or len(z) < 2:
        raise ValueError("Give z and K for at least two components.")
    if any(zi <= 0 for zi in z) or any(Ki <= 0 for Ki in K):
        raise ValueError("Each component needs z > 0 and K > 0.")

    total = sum(z)
    z = [zi / total for zi in z]
    bubble = sum(zi * Ki for zi, Ki in zip(z, K))
    dew = sum(zi / Ki for zi, Ki in zip(z, K))

    def rr(psi):
        return sum(zi * (Ki - 1) / (1 + psi * (Ki - 1)) for zi, Ki in zip(z, K))

    if bubble <= 1:
        psi, phase = 0.0, "liquid"
    elif dew <= 1:
        psi, phase = 1.0, "vapour"
    else:
        lo, hi = 0.0, 1.0
        for _ in range(200):  # bisection; rr is monotonic decreasing in psi
            mid = (lo + hi) / 2
            if rr(mid) > 0:
                lo = mid
            else:
                hi = mid
        psi, phase = (lo + hi) / 2, "two-phase"

    x = [zi / (1 + psi * (Ki - 1)) for zi, Ki in zip(z, K)]
    y = [xi * Ki for xi, Ki in zip(x, K)]
    return {"psi": psi, "phase": phase, "z": z, "x": x, "y": y, "bubble_sum": bubble, "dew_sum": dew, "feed_sum": total}
