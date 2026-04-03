/**
 * cteCalc.js
 * Port of Django CTE.py
 *
 * CTE chart: for a given target CTE value (cte in ×1E-6/°C),
 * sweeps eta from 0.900 → 0.999 and computes the volume fraction Φ% needed.
 *
 * All CTE values are passed in as plain numbers (e.g. 40 means 40×1E-6/°C).
 * Internally multiplied by 1E-6 to match the original Python.
 */

function cteRev(cte, alpm, modm, num, alpf, modf, nuf, eta) {
    // cte, alpm, alpf in ×1E-6/°C (raw, e.g. 40, 76.5, 4)
    const cte_si = cte * 1e-6;
    const alpm_si = alpm * 1e-6;
    const alpf_si = alpf * 1e-6;
    const modm_pa = modm * 1e6; // MPa → Pa
    const modf_pa = modf * 1e6; // MPa → Pa

    const a = 1 - 2 * nuf + (1 + nuf) / 2 * Math.pow(eta, 3);
    const b = (1 - Math.pow(eta, 3)) * (1 - 2 * num);

    const ratio = (alpf_si - cte_si) / (cte_si - alpm_si) * (modf_pa / modm_pa) * (b / a);
    const phif = Math.pow(ratio + 1, -1);
    return phif;
}

/**
 * Compute CTE curve data.
 * @param {number} cte     - target CTE (×1E-6/°C), e.g. 40
 * @param {number} modm    - Young's modulus of matrix (MPa)
 * @param {number} num     - Poisson's ratio of matrix
 * @param {number} alpm    - CTE of matrix (×1E-6/°C)
 * @param {number} modf    - Young's modulus of filler (MPa)
 * @param {number} nuf     - Poisson's ratio of filler
 * @param {number} alpf    - CTE of filler (×1E-6/°C)
 * @returns {Array<{eta: number, phi: number}>}
 */
export function computeCTE(cte, modm, num, alpm, modf, nuf, alpf) {
    const ETA_LOWER = 0.900;
    const ETA_UPPER = 0.999;
    const DEL_ETA = 0.0001;

    const out = [];
    for (let eta = ETA_LOWER; eta <= ETA_UPPER + 1e-9; eta += DEL_ETA) {
        const etaR = Math.round(eta * 10000) / 10000;
        const phif = cteRev(cte, alpm, modm, num, alpf, modf, nuf, etaR);
        out.push({
            eta: etaR,
            phi: Math.round(phif * 100 * 100) / 100, // as percentage, 2 dp
        });
    }
    return out;
}

/**
 * Compute multiple CTE contour lines for different target CTE values.
 * @param {number[]} cteValues  - array of CTE targets (×1E-6/°C)
 * @param {number}   modm
 * @param {number}   num
 * @param {number}   alpm
 * @param {number}   modf
 * @param {number}   nuf
 * @param {number}   alpf
 * @returns {Array<{cte: number, data: Array<{eta,phi}>}>}
 */
export function computeCTEContours(cteValues, modm, num, alpm, modf, nuf, alpf) {
    return cteValues.map(cte => ({
        cte,
        data: computeCTE(cte, modm, num, alpm, modf, nuf, alpf),
    }));
}