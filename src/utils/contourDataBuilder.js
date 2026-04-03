/**
 * contourDataBuilder.js
 *
 * Generates the 2D contour datasets used in the Contours tab.
 *
 * The contour fills the full η (0.9 → 1.0) × Φ (0 → 100%) space.
 * For each chart type, we sweep a range of "variant" values (e.g. CTE from 0 → 70),
 * compute the Φ curve for each variant, and return them as contour bands.
 *
 * The overlay line is just a single computed curve from a different chart type,
 * plotted on top as a black line using the current sidebar slider value.
 */

import { computeCTE } from './cteCalc';
import { computeDensity } from './densityCalc';
import { computeDielectric } from './dielectricCalc';

// ─── Contour level definitions ────────────────────────────────────────────────

/**
 * For each chart type, define:
 *   - levels: the variant values to sweep (one curve per level)
 *   - colors: gradient palette from light (low) to dark (high)
 *   - label:  display name
 *   - unit:   label shown in legend
 */
export const CONTOUR_CONFIGS = {
    cte: {
        label: 'Coefficient of Thermal Expansion',
        unit: '×10⁻⁶/°C',
        levels: [0, 10, 20, 30, 40, 50, 60, 70],
        colors: [
            '#ffffcc', // 0
            '#ffeda0', // 10
            '#fed976', // 20
            '#feb24c', // 30
            '#fd8d3c', // 40
            '#fc4e2a', // 50
            '#e31a1c', // 60
            '#b10026', // 70
        ],
    },
    density: {
        label: 'Density',
        unit: 'kg/m³',
        levels: [200, 400, 600, 800, 1000, 1200, 1400, 1600],
        colors: [
            '#ffffcc',
            '#ffeda0',
            '#fed976',
            '#feb24c',
            '#fd8d3c',
            '#fc4e2a',
            '#e31a1c',
            '#b10026',
        ],
    },
    dielectric: {
        label: 'Dielectric Constant',
        unit: '',
        levels: [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5],
        colors: [
            '#ffffcc',
            '#ffeda0',
            '#fed976',
            '#feb24c',
            '#fd8d3c',
            '#fc4e2a',
            '#e31a1c',
            '#b10026',
        ],
    },
};

// ─── Curve computers ──────────────────────────────────────────────────────────

/**
 * Returns [{eta, phi}, ...] for a given chart type and variant value.
 * Returns null if computation fails or params are invalid.
 */
export function computeOverlayCurve(chartType, variantValue, params) {
    try {
        switch (chartType) {
            case 'cte':
                return computeCTE(
                    variantValue,
                    params.em, params.nm, params.alpm,
                    params.eb, params.nb, params.alpf
                );
            case 'density':
                return computeDensity(variantValue, params.dm, params.wpdf);
            case 'dielectric':
                return computeDielectric(variantValue, params.epsm, params.epsf);
            default:
                return null;
        }
    } catch {
        return null;
    }
}

/**
 * Compute all contour band data for a given chart type.
 * Returns an array of { level, color, data: [{eta, phi}] } objects,
 * one per contour level, sorted from lowest to highest level.
 */
export function computeContourBands(chartType, params) {
    const config = CONTOUR_CONFIGS[chartType];
    if (!config) return [];

    return config.levels.map((level, i) => {
        const data = computeOverlayCurve(chartType, level, params);
        return {
            level,
            color: config.colors[i],
            data: data || [],
        };
    });
}

/**
 * Build a merged dataset suitable for Recharts area chart.
 *
 * Strategy:
 * - X axis: eta (0.9 → 1.0)
 * - For each eta value, we have one phi value per contour level.
 * - We create bands between consecutive levels by using area chart's
 *   dataKey for value and baseValue for lower bound.
 *
 * Returns: { etaPoints, bands }
 *   etaPoints: sorted eta values (x axis)
 *   bands: [{level, color, dataKey, merged: [{eta, phi, prevPhi}]}]
 */
export function buildContourChartData(chartType, params) {
    const config = CONTOUR_CONFIGS[chartType];
    if (!config) return null;

    const allBands = computeContourBands(chartType, params);

    // Build a map: eta → {level_N: phi}
    const etaMap = new Map();
    for (const { level, data } of allBands) {
        for (const { eta, phi } of data) {
            if (!etaMap.has(eta)) etaMap.set(eta, { eta });
            const val = isFinite(phi) ? Math.max(0, Math.min(100, phi)) : null;
            etaMap.get(eta)[`level_${level}`] = val;
        }
    }

    const merged = Array.from(etaMap.values()).sort((a, b) => a.eta - b.eta);

    return {
        merged,
        config,
        bands: allBands.map((b, i) => ({
            ...b,
            dataKey: `level_${b.level}`,
            // For area stacking: each band fills from previous level's phi up to its own phi
            baseKey: i === 0 ? null : `level_${allBands[i - 1].level}`,
        })),
    };
}