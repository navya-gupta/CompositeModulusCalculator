/**
 * densityCalc.js
 * Port of Django Density.py
 *
 * Density chart: for a given target density (rho in kg/m³),
 * sweeps eta from 0.9 → 0.9999 and computes Φ%.
 *
 * @param {number} rho   - target composite density (kg/m³)
 * @param {number} rhom  - matrix density (kg/m³)
 * @param {number} rhoc  - wall particle density (kg/m³)
 * @returns {Array<{eta: number, phi: number}>}
 */
export function computeDensity(rho, rhom, rhoc) {
    const out = [];
    for (let eta = 0.9; eta < 1.0; eta += 0.0001) {
        const etaR = Math.round(eta * 10000) / 10000;
        const phi = (rho - rhom) / (rhoc * (1 - Math.pow(etaR, 3)) - rhom);
        out.push({
            eta: etaR,
            phi: Math.round(phi * 100 * 100) / 100, // percentage, 2 dp
        });
    }
    return out;
}