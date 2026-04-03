/**
 * contourDataBuilder.js
 *
 * Ports the exact contour logic from Django's cmml_charts.js.
 *
 * HOW CONTOURS WORK (plain English):
 * ─────────────────────────────────────────────────────────────────────
 * A contour fills the entire chart area with coloured bands.
 * Each band = one curve computed at a different "variant" value.
 * The area BETWEEN consecutive curves is filled with a colour.
 *
 * Chart types split into two groups based on their axes:
 *
 * GROUP A  — X axis = η (0.9→1.0),  Y axis = Φ % (0→100)
 *   CTE         : sweep cte  from 0 → +10E-6 per band (10 bands)
 *   CTE Contour : same as CTE
 *   Density     : sweep rho  from 650, +30 per band
 *   Dielectric  : sweep eps  from 2,   +0.2 per band
 *
 * GROUP B  — X axis = Φ (0→0.63),  Y axis = Modulus GPa
 *   MEPG (Porfiri-Gupta)   : sweep η from 0.80, +0.02 per band
 *   MEBG (Bardella-Genna)  : sweep η from 0.80, +0.02 per band
 *
 * Django uses 10 bands for everything (colors array has 10 entries, but
 * MEPG/MEBG uses 3 colours in the code — we'll use 10 for visual richness).
 *
 * The OVERLAY line is a single curve at the current sidebar slider value,
 * drawn in black on top of the contour bands.
 * ─────────────────────────────────────────────────────────────────────
 */

import { computeBardellaGenna } from './bardellaGennaCalc';
import { computeCTE } from './cteCalc';
import { computeDensity } from './densityCalc';
import { computeDielectric } from './dielectricCalc';
import { diffScheme } from './matlabFunctions/diffScheme';
import { odeRK45 } from './matlabFunctions/odeRK45';

// ─── Colour palette (yellow → orange → red, matching Django) ─────────────────
// Django colours: ["#F4B656","#FDE86E","#F9D063","#F5B857","#F0A04B",
//                  "#EB8A40","#E77235","#E35B2C","#C74E29","#9D4429"]
export const BAND_COLORS = [
    '#FDE86E', // band 0 — lightest yellow
    '#F9D063',
    '#F5B857',
    '#F4B656',
    '#F0A04B',
    '#EB8A40',
    '#E77235',
    '#E35B2C',
    '#C74E29',
    '#9D4429', // band 9 — darkest red
];

// ─── Chart type registry ──────────────────────────────────────────────────────
export const CONTOUR_CHART_OPTIONS = [
    { value: 'cte', label: 'Coefficient of Thermal Expansion' },
    { value: 'mepg', label: 'Modulus of Elasticity | Porfiri Gupta' },
    { value: 'mebg', label: 'Modulus of Elasticity | Bardella Genna' },
    { value: 'density', label: 'Density' },
    { value: 'dielectric', label: 'Dielectric Constant' },
    { value: 'cte_contour', label: 'Coefficient of Thermal Expansion Contour' },
];

/**
 * Returns axis group for a chart type.
 * 'eta'  → X = η (0.9→1), Y = Φ%
 * 'phi'  → X = Φ (0→0.63), Y = Modulus GPa
 */
export function getAxisGroup(chartType) {
    if (chartType === 'mepg' || chartType === 'mebg') return 'phi';
    return 'eta';
}

// ─── Band definitions (matches Django JS exactly) ────────────────────────────
/**
 * Returns the 10 variant values for each chart type's contour bands.
 * Django starts at a base and increments per band.
 */
function getBandVariants(chartType) {
    const variants = [];
    switch (chartType) {
        case 'cte':
        case 'cte_contour': {
            // Django: contour_variant starts at -10E-6, increments +10E-6 each band
            // So bands are: 0, 10, 20, 30, 40, 50, 60, 70, 80, 90  (×1E-6/°C)
            let v = 0;
            for (let i = 0; i < 10; i++) { v += 10; variants.push(v); }
            break;
        }
        case 'mepg':
        case 'mebg': {
            // Django: contour_variant starts at 0.80, increments +0.02 per band
            // Bands: 0.82, 0.84, 0.86, 0.88, 0.90, 0.92, 0.94, 0.96, 0.98, 1.00
            let v = 0.80;
            for (let i = 0; i < 10; i++) {
                v = parseFloat((v + 0.02).toFixed(3));
                variants.push(v);
            }
            break;
        }
        case 'density': {
            // Django: contour_variant starts at 650, increments +30 per band
            // Bands: 680, 710, 740, 770, 800, 830, 860, 890, 920, 950
            let v = 650;
            for (let i = 0; i < 10; i++) { v += 30; variants.push(v); }
            break;
        }
        case 'dielectric': {
            // Django: contour_variant starts at 2, increments +0.2 per band
            // Bands: 2.2, 2.4, 2.6, 2.8, 3.0, 3.2, 3.4, 3.6, 3.8, 4.0
            let v = 2.0;
            for (let i = 0; i < 10; i++) {
                v = parseFloat((v + 0.2).toFixed(2));
                variants.push(v);
            }
            break;
        }
        default:
            break;
    }
    return variants;
}

// ─── Single curve computers ───────────────────────────────────────────────────

/**
 * Compute a single curve for the given chart type at a specific variant value.
 *
 * Returns:
 *   Group A (cte/density/dielectric): [{eta, phi}, ...]
 *   Group B (mepg/mebg):              [{phi, modulus}, ...]
 *   Returns [] on error.
 */
export function computeSingleCurve(chartType, variantValue, params) {
    try {
        switch (chartType) {
            case 'cte':
            case 'cte_contour':
                return computeCTE(
                    variantValue,           // cte target ×1E-6/°C (e.g. 40)
                    params.em, params.nm,
                    params.alpm,
                    params.eb, params.nb,
                    params.alpf
                );

            case 'density':
                return computeDensity(variantValue, params.dm, params.wpdf);

            case 'dielectric':
                return computeDielectric(variantValue, params.epsm, params.epsf);

            case 'mepg': {
                // variantValue = η  (e.g. 0.90)
                const eta = variantValue;
                if (isNaN(eta) || eta <= 0 || eta >= 1) return [];

                const odefn = (phi, X) => diffScheme(phi, X, params.eb, params.nb, eta, params.phi_rpl);
                const solution = odeRK45(
                    odefn,
                    [0, params.phi_rpl],
                    [params.em, params.nm],
                    { dt: 0.001, tol: 1e-8 }
                );

                const step = 5;
                return solution.t
                    .filter((_, i) => i % step === 0)
                    .map((phi, i) => ({
                        phi: Math.round(phi * 1000) / 1000,
                        // Convert MPa → GPa for display
                        modulus: Math.round((solution.y[i * step]?.[0] ?? 0) / 1000 * 1000) / 1000,
                    }))
                    .filter(d => isFinite(d.modulus) && d.modulus > 0);
            }

            case 'mebg': {
                // variantValue = η  (e.g. 0.90)
                const eta = variantValue;
                const r = params.c2r / 2; // diameter → radius
                if (isNaN(eta) || eta <= 0 || eta >= 1 || isNaN(r)) return [];

                const raw = computeBardellaGenna(eta, params.em, params.nm, params.eb, params.nb, r);
                const step = 5;
                return raw
                    .filter((_, i) => i % step === 0)
                    .map(d => ({
                        phi: d.phi,
                        modulus: d.E, // Young's modulus in GPa
                    }))
                    .filter(d => isFinite(d.modulus) && d.modulus > 0);
            }

            default:
                return [];
        }
    } catch (err) {
        console.warn(`computeSingleCurve(${chartType}, ${variantValue}) failed:`, err.message);
        return [];
    }
}

// ─── Full contour dataset builder ─────────────────────────────────────────────

/**
 * Build the complete contour dataset for Recharts.
 *
 * Returns an object:
 * {
 *   axisGroup: 'eta' | 'phi',
 *   merged: [{xKey: value, band_0: y, band_1: y, ...}],   ← one row per x value
 *   bands:  [{variant, color, dataKey}],
 *   xKey:   'eta' | 'phi',
 *   yLabel: string,
 *   xLabel: string,
 * }
 */
export function buildContourDataset(chartType, params) {
    const variants = getBandVariants(chartType);
    const axisGroup = getAxisGroup(chartType);
    const xKey = axisGroup === 'eta' ? 'eta' : 'phi';

    // Compute each band's curve
    const bandCurves = variants.map((variant, i) => {
        const data = computeSingleCurve(chartType, variant, params);
        return { variant, color: BAND_COLORS[i], dataKey: `band_${i}`, data };
    });

    // Build merged map: xVal → { xKey: xVal, band_0: y, band_1: y, ... }
    const xMap = new Map();

    for (const { dataKey, data } of bandCurves) {
        for (const point of data) {
            const xVal = xKey === 'eta' ? point.eta : point.phi;
            const yVal = xKey === 'eta'
                ? (isFinite(point.phi) ? Math.max(0, Math.min(100, point.phi)) : null)
                : (isFinite(point.modulus) ? point.modulus : null);

            if (xVal === undefined || xVal === null) continue;
            if (!xMap.has(xVal)) xMap.set(xVal, { [xKey]: xVal });
            xMap.get(xVal)[dataKey] = yVal;
        }
    }

    const merged = Array.from(xMap.values()).sort((a, b) => a[xKey] - b[xKey]);

    return {
        axisGroup,
        merged,
        bands: bandCurves.map(({ variant, color, dataKey }) => ({ variant, color, dataKey })),
        xKey,
        xLabel: axisGroup === 'eta' ? 'This is η' : 'Φ (Volume Fraction)',
        yLabel: axisGroup === 'eta' ? 'This is Φ (%)' : 'Modulus (GPa)',
        xDomain: axisGroup === 'eta' ? [0.9, 1.0] : [0, params.phi_rpl ?? 0.6],
        yDomain: axisGroup === 'eta' ? [0, 100] : null, // null = auto for modulus
    };
}

/**
 * Compute the overlay (single black line) curve in Recharts-ready format.
 * variantValue comes from the current sidebar slider for the overlay chart type.
 */
export function buildOverlayCurve(chartType, variantValue, params) {
    const axisGroup = getAxisGroup(chartType);
    const xKey = axisGroup === 'eta' ? 'eta' : 'phi';
    const data = computeSingleCurve(chartType, variantValue, params);

    return data.map(point => ({
        [xKey]: xKey === 'eta' ? point.eta : point.phi,
        _overlay: xKey === 'eta'
            ? (isFinite(point.phi) ? Math.max(0, Math.min(100, point.phi)) : null)
            : (isFinite(point.modulus) ? point.modulus : null),
    })).filter(d => d._overlay !== null);
}