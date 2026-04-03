/**
 * bardellaGennaCalc.js
 * Port of Django BardellaGenna.py
 *
 * Computes Young's Modulus (E), Bulk Modulus (K), Shear Modulus (G)
 * for hollow sphere composites using the Bardella-Genna micromechanics model.
 *
 * Units: all moduli in GPa (inputs in MPa are divided by 1000 internally).
 */

function bulkMod(Em_GPa, Gm_GPa, Eb_GPa, Gb_GPa, r, t, phi) {
    const a = r - t;
    const b = r;

    const Km = (Em_GPa * Gm_GPa) / (3 * (3 * Gm_GPa - Em_GPa));
    const Kb = (Eb_GPa * Gb_GPa) / (3 * (3 * Gb_GPa - Eb_GPa));

    const beta = (4 / 3) * (Gm_GPa / Km);
    const delta = (4 / 3) * (Gb_GPa / Km) * (1 - Math.pow(a / b, 3));
    const kappa = (4 / 3) * (Gb_GPa / Kb) + Math.pow(a / b, 3);

    return Km * (delta * (1 + phi * beta) + kappa * (1 - phi) * beta) /
        (delta * (1 - phi) + kappa * (beta + phi));
}

function shearMod(Gm, vm, Gb, vb, r, t, phi) {
    const a = r - t;
    const b = r;
    const c = Math.pow(b ** 3 * (1 / phi), 1 / 3);

    const C1 = 21 / 5 * b / a - 6 * vb * (b / a) ** 3 + 3 / 20 * (7 + 5 * vb) * (a / b) ** 4;
    const C2 = 2 / 5 * (7 - 5 * vb) * b / a + (5 - 4 * vb) * (a / b) ** 2 - 9 / 5 * (a / b) ** 4;
    const C3 = 21 / 5 * (b / a) - (7 - 4 * vb) * (b / a) ** 3 - 1 / 10 * (7 + 5 * vb) * (a / b) ** 4;
    const C4 = 2 / 5 * (7 - 5 * vb) * b / a + 2 * (1 - 2 * vb) * (a / b) ** 2 + 6 / 5 * (a / b) ** 4;
    const C5 = 42 / 5 + 6 * vb * (b / a) ** 2 - 6 / 5 * (7 + 5 * vb) * (a / b) ** 5;
    const C6 = 4 / 5 * (7 - 5 * vb) - 4 * (5 - vb) * (a / b) ** 3 + 72 / 5 * (a / b) ** 5;
    const C7 = 21 / 5 - (7 + 2 * vb) * (b / a) ** 2 + 2 / 5 * (7 + 5 * vb) * (a / b) ** 5;
    const C8 = 2 / 5 * (7 - 5 * vb) + 2 * (1 + vb) * (a / b) ** 3 - 24 / 5 * (a / b) ** 5;

    const D1 = (C5 * (C4 - C2) + C6 * (C1 - C3)) * b / a - 2 * Gm / Gb * (C1 * C4 - C2 * C3);
    const D2 = ((C2 * C5 - C1 * C6) * (7 - 4 * vm) + (6 * (C3 * C6 - C4 * C5) * vm)) * (b / a) ** 3
        - 6 * Gm / Gb * vm * (C1 * C4 - C2 * C3) * (b / a) ** 2;
    const D3 = (C5 * (2 * C2 + 3 * C4) - C6 * (2 * C1 + 3 * C3)) * (a / b) ** 4
        + 24 * Gm / Gb * (C1 * C4 - C2 * C3) * (a / b) ** 5;
    const D4 = ((C4 * C5 - C3 * C6) * (5 - 4 * vm) + 2 * (C1 * C6 - C2 * C5) * (1 - 2 * vm)) * (a / b) ** 2
        + 4 * Gm / Gb * (5 - vm) * (C1 * C4 - C2 * C3) * (a / b) ** 3;
    const D5 = (C7 * (C4 - C2) + C8 * (C1 - C3)) * b / a - Gm / Gb * (C1 * C4 - C2 * C3);
    const D6 = ((C2 * C7 - C1 * C8) * (7 - 4 * vm) + 6 * (C3 * C8 - C4 * C7) * vm) * (b / a) ** 3
        + Gm / Gb * (7 + 2 * vm) * (C1 * C4 - C2 * C3) * (b / a) ** 2;
    const D7 = (C7 * (2 * C2 + 3 * C4) - C8 * (2 * C1 + 3 * C3)) * (a / b) ** 4
        - 8 * Gm / Gb * (C1 * C4 - C2 * C3) * (a / b) ** 5;
    const D8 = ((C4 * C7 - C3 * C8) * (5 - 4 * vm) + 2 * (C1 * C8 - C2 * C7) * (1 - 2 * vm)) * (a / b) ** 2
        - 2 * Gm / Gb * (1 + vm) * (C1 * C4 - C2 * C3) * (a / b) ** 3;

    const denom = D1 * D7 - D3 * D5;

    const H1 = (D3 * D6 - D2 * D7) / denom * (c / a) - 6 * vm * (c / a) ** 3
        + 3 * (D2 * D5 - D1 * D6) / denom * (a / c) ** 4;
    const H2 = (D3 * D8 - D4 * D7) / denom * (c / a) + (5 - 4 * vm) * (a / c) ** 2
        + 3 * (D4 * D5 - D1 * D8) / denom * (a / c) ** 4;
    const H3 = (D3 * D6 - D2 * D7) / denom * (c / a) - (7 - 4 * vm) * (c / a) ** 3
        - 2 * (D2 * D5 - D1 * D6) / denom * (a / c) ** 4;
    const H4 = (D3 * D8 - D4 * D7) / denom * c / a + 2 * (1 - 2 * vm) * (a / c) ** 2
        - 2 * (D4 * D5 - D1 * D8) / denom * (a / c) ** 4;

    const H5 = 2 * (D3 * D6 - D2 * D7) / denom + 6 * vm * (c / a) ** 2
        - 24 * (D2 * D5 - D1 * D6) / denom * (a / c) ** 5;
    const H6 = 2 * (D3 * D8 - D4 * D7) / denom - 4 * (5 - vm) * (a / c) ** 3
        - 24 * (D4 * D5 - D1 * D8) / denom * (a / c) ** 5;
    const H7 = (D3 * D6 - D2 * D7) / denom - (7 + 2 * vm) * (c / a) ** 2
        + 8 * (D2 * D5 - D1 * D6) / denom * (a / c) ** 5;
    const H8 = (D3 * D8 - D4 * D7) / denom + 2 * (1 + vm) * (a / c) ** 3
        + 8 * (D4 * D5 - D1 * D8) / denom * (a / c) ** 5;

    const hDenom = H1 * H4 - H3 * H2;
    const F1 = ((H1 - H3) * (H6 * H1 - H5 * H2) / hDenom + H5) * (c / a);
    const F2 = ((2 * H1 + 3 * H3) * (H6 * H1 - H5 * H2) / hDenom - 3 * H5) * (a / c) ** 4;
    const F3 = ((H1 - H3) * (H8 * H1 - H7 * H2) / hDenom + H7) * c / a;
    const F4 = ((2 * H1 + 3 * H3) * (H8 * H1 - H7 * H2) / hDenom - 3 * H7) * (a / c) ** 4;

    const aa1 = (40 * H1 * (a / c) ** 5) / (Gm ** 2);
    const aa2 = (2 * F4 - F2 - 8 * (F1 + 3 * F3) * (a / c) ** 5) / Gm;
    const aa3 = (F2 * F3 - F1 * F4) / H1;

    const disc = aa2 ** 2 - 4 * aa1 * aa3;
    if (disc < 0) return NaN;

    const G0 = (-aa2 + Math.sqrt(disc)) / (2 * aa1);
    const G1 = (-aa2 - Math.sqrt(disc)) / (2 * aa1);

    return G0 > 0 ? G0 : G1;
}

/**
 * Compute Bardella-Genna moduli curve.
 *
 * @param {number} eta   - inner/outer radius ratio (0.9–0.9975)
 * @param {number} Em    - Young's modulus of matrix (MPa)
 * @param {number} vm    - Poisson's ratio of matrix
 * @param {number} Eb    - Young's modulus of inclusion (MPa)
 * @param {number} vb    - Poisson's ratio of inclusion
 * @param {number} r     - outer radius of cenosphere in microns (c2r / 2)
 * @returns {Array<{phi, E, K, G}>}  moduli in GPa, phi from 0 → 0.63
 */
export function computeBardellaGenna(eta, Em, vm, Eb, vb, r) {
    // Convert MPa → GPa
    const Em_GPa = Em / 1000;
    const Eb_GPa = Eb / 1000;

    const Gm_GPa = Em_GPa / (2 * (1 + vm));
    const Gb_GPa = Eb_GPa / (2 * (1 + vb));

    // t = shell thickness = r * (1 - eta)  [microns, but ratio is dimensionless]
    const t = r * (1 - eta);

    const out = [];
    for (let phi = 0.0005; phi < 0.63; phi += 0.0005) {
        const phiR = Math.round(phi * 10000) / 10000;

        const K = bulkMod(Em_GPa, Gm_GPa, Eb_GPa, Gb_GPa, r, t, phiR);
        const G = shearMod(Gm_GPa, vm, Gb_GPa, vb, r, t, phiR);

        if (isNaN(K) || isNaN(G)) continue;

        const E = (9 * K * G) / (3 * K + G);

        out.push({
            phi: Math.round(phiR * 1000) / 1000,
            E: Math.round(E * 1000) / 1000,  // GPa, 3dp
            K: Math.round(K * 1000) / 1000,  // GPa, 3dp
            G: Math.round(G * 1000) / 1000,  // GPa, 3dp
        });
    }
    return out;
}