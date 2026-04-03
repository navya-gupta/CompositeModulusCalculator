/**
 * dielectricCalc.js
 * Port of Django Dielectric.py
 *
 * Dielectric chart: for a given target dielectric constant (eps),
 * sweeps eta from 0.9 → 0.9999 and computes Φ%.
 *
 * @param {number} eps      - target dielectric constant
 * @param {number} eps_m    - matrix dielectric constant
 * @param {number} eps_hpm  - hollow particle material dielectric constant
 * @returns {Array<{eta: number, phi: number}>}
 */
export function computeDielectric(eps, eps_m, eps_hpm) {
    const out = [];
    for (let eta = 0.9; eta < 1.0; eta += 0.0001) {
        const etaR = Math.round(eta * 10000) / 10000;

        const A = Math.pow(eps_hpm - 1, 2) / ((eps_hpm + 2) * (2 * eps_hpm + 1));
        const B = (eps_hpm - 1) / (eps_hpm + 2);
        const eta3 = Math.pow(etaR, 3);

        const eps_hp =
            (1 - 2 * eta3 * A + 2 * (1 - eta3) * B) /
            (1 - 2 * eta3 * A - (1 - eta3) * B);

        const C = 3 * eps_m / (eps_hp + 2 * eps_m);
        const D = 3 * (eps_hp - eps_m) / (eps_hp + 2 * eps_m);

        const a = C * D * (eps_hp - eps);
        const b = C * (eps_hp - eps) + (eps - eps_m);
        const c = eps_m - eps;

        const discriminant = b * b - 4 * a * c;
        if (discriminant < 0) continue;

        const phi1 = (-b - Math.sqrt(discriminant)) / (2 * a);

        out.push({
            eta: etaR,
            phi: Math.round(phi1 * 100 * 100) / 100, // percentage, 2 dp
        });
    }
    return out;
}