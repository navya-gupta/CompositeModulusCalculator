// /**
//  * surface3DCalc.js
//  *
//  * Computes 3D surface data for the three properties:
//  *   CTE, Density, Dielectric Constant
//  *
//  * Following the screenshot:
//  *   X axis = Microballoon volume fraction Φ (0 → 0.6)
//  *   Y axis = Microballoon density kg/m³   (100 → 700)
//  *   Z axis = computed property value
//  *
//  * For each (Φ, ρ_particle) pair:
//  *   1. Derive η from ρ_particle and ρ_glass:  η = (1 - ρ_p/ρ_glass)^(1/3)
//  *   2. Compute the property using the existing closed-form formulas
//  *
//  * CTE formula (from CTE.py — cte_rev inverted):
//  *   Given η and Φ, compute the CTE of the composite directly:
//  *   CTE_c = (alpm * b/(a) + alpf * Φ * (modf/modm))  ... Levin's formula
//  *
//  *   Actually the cleanest approach: use the Levin / Rosen-Hashin formula
//  *   which gives CTE directly from Φ and η:
//  *
//  *   a = 1 - 2*nuf + (1+nuf)/2 * η^3
//  *   b = (1 - η^3) * (1 - 2*num)
//  *   cte_c = alpm + (alpf - alpm) / (1 + (modf/modm) * b/a * (1/Φ - 1))
//  *   (rearranged from Django's cte_rev)
//  *
//  * Density formula (from Density.py):
//  *   ρ_composite = rhom + Φ * (rhoc*(1 - η^3) - rhom)
//  *   (rearranged from Django: phi = (rho - rhom) / (rhoc*(1-η^3) - rhom))
//  *
//  * Dielectric formula (from Dielectric.py):
//  *   eps_hp = f(η, eps_hpm)   [effective hollow particle permittivity]
//  *   eps_c  = eps_m * (1 + 3*Φ*(eps_hp - eps_m) / (eps_hp + 2*eps_m - Φ*(eps_hp - eps_m)))
//  *   (Maxwell-Garnett mixing rule — inverted from Django's quadratic)
//  */

// // ─── Grid resolution ──────────────────────────────────────────────────────────
// const N_PHI = 30;  // points along Φ axis
// const N_RHO = 30;  // points along ρ_particle axis
// const PHI_MIN = 0.01;
// const PHI_MAX = 0.60;
// const RHO_MIN = 100; // kg/m³  (very light hollow particle)
// const RHO_MAX = 700; // kg/m³

// /**
//  * Derive η from true particle density and glass wall density.
//  * η = inner/outer radius ratio = (1 - ρ_particle / ρ_glass)^(1/3)
//  */
// function deriveEta(rhoParticle, rhoGlass) {
//     const ratio = rhoParticle / rhoGlass;
//     if (ratio >= 1 || ratio <= 0) return NaN;
//     return Math.pow(1 - ratio, 1 / 3);
// }

// /**
//  * CTE of composite at given (phi, eta).
//  * Rearranged from Django cte_rev():
//  *   phif = [ (alpf-cte)/(cte-alpm) * (modf/modm) * (b/a)  +  1 ]^-1
//  * → invert to get cte given phi:
//  *   cte = (alpm * a + alpf * phi * (modf/modm) * b) / (a + phi * (modf/modm) * b)
//  *
//  * All CTE values in ×1E-6/°C (returned value is plain number e.g. 40).
//  * modm, modf in MPa.
//  */
// function computeCTEat(phi, eta, params) {
//     const { em: modm, nm: num, alpm, eb: modf, nb: nuf } = params;
//     if (isNaN(eta) || phi <= 0) return NaN;

//     const a = 1 - 2 * nuf + (1 + nuf) / 2 * Math.pow(eta, 3);
//     const b = (1 - Math.pow(eta, 3)) * (1 - 2 * num);

//     const modRatio = modf / modm;
//     const num_ = alpm * a + alpm * phi * modRatio * b
//         + (alpm - alpm + /* alpf */ params.alpf) * phi * modRatio * b;
//     // Simpler direct form:
//     const cte = (alpm * a + params.alpf * phi * modRatio * b) /
//         (a + phi * modRatio * b);
//     return cte; // ×1E-6/°C
// }

// /**
//  * Density of composite at given (phi, eta).
//  * From Density.py: phi = (rho - rhom) / (rhoc*(1-η^3) - rhom)
//  * → rho = rhom + phi * (rhoc*(1-η^3) - rhom)
//  */
// function computeDensityAt(phi, eta, params) {
//     const { dm: rhom, wpdf: rhoc } = params;
//     if (isNaN(eta)) return NaN;
//     return rhom + phi * (rhoc * (1 - Math.pow(eta, 3)) - rhom);
// }

// /**
//  * Dielectric constant of composite at given (phi, eta).
//  * From Dielectric.py — Maxwell-Garnett forward formula:
//  *   eps_hp = effective permittivity of hollow particle at given η
//  *   eps_c  = eps_m * (eps_hp*(1+2Φ*f) + 2*eps_m*(1-Φ*f)) /
//  *                    (eps_hp*(1-Φ*f)  +   eps_m*(2+Φ*f))
//  * where f = (eps_hp - eps_m)/(eps_hp + 2*eps_m)   [Clausius-Mossotti factor]
//  */
// function computeDielectricAt(phi, eta, params) {
//     const { epsm: eps_m, epsf: eps_hpm } = params;
//     if (isNaN(eta)) return NaN;

//     const eta3 = Math.pow(eta, 3);
//     const A = Math.pow(eps_hpm - 1, 2) / ((eps_hpm + 2) * (2 * eps_hpm + 1));
//     const B = (eps_hpm - 1) / (eps_hpm + 2);

//     const eps_hp = (1 - 2 * eta3 * A + 2 * (1 - eta3) * B) /
//         (1 - 2 * eta3 * A - (1 - eta3) * B);

//     // Maxwell-Garnett
//     const f = (eps_hp - eps_m) / (eps_hp + 2 * eps_m);
//     const eps_c = eps_m * (1 + 3 * phi * f) / (1 - phi * f);
//     return eps_c;
// }

// // ─── Main export ──────────────────────────────────────────────────────────────

// /**
//  * Build 3D surface data for all three properties.
//  *
//  * Returns:
//  * {
//  *   phiAxis:       number[]          ← X values (Φ, volume fraction)
//  *   rhoAxis:       number[]          ← Y values (particle density kg/m³)
//  *   cte:           number[][]        ← Z[i][j] for CTE surface
//  *   density:       number[][]        ← Z[i][j] for Density surface
//  *   dielectric:    number[][]        ← Z[i][j] for Dielectric surface
//  * }
//  * Z is indexed [rhoIndex][phiIndex] to match Plotly convention.
//  */
// export function buildSurface3DData(params) {
//     const { hollowType } = params;

//     // Glass density from selected hollow particle type
//     // (passed through from Layout chartParams)
//     const rhoGlass = params.glassDensity ?? 2250; // default borosilicate

//     // Build axes
//     const phiAxis = [];
//     const rhoAxis = [];

//     for (let i = 0; i < N_PHI; i++) {
//         phiAxis.push(PHI_MIN + (PHI_MAX - PHI_MIN) * i / (N_PHI - 1));
//     }
//     for (let j = 0; j < N_RHO; j++) {
//         rhoAxis.push(RHO_MIN + (RHO_MAX - RHO_MIN) * j / (N_RHO - 1));
//     }

//     // Build Z matrices  [N_RHO][N_PHI]
//     const cteMat = [];
//     const densityMat = [];
//     const dielectricMat = [];

//     for (let j = 0; j < N_RHO; j++) {
//         const rhoRow = [];
//         const dRow = [];
//         const epsRow = [];
//         const rhoP = rhoAxis[j];
//         const eta = deriveEta(rhoP, rhoGlass);

//         for (let i = 0; i < N_PHI; i++) {
//             const phi = phiAxis[i];
//             rhoRow.push(computeCTEat(phi, eta, params));
//             dRow.push(computeDensityAt(phi, eta, params));
//             epsRow.push(computeDielectricAt(phi, eta, params));
//         }

//         cteMat.push(rhoRow);
//         densityMat.push(dRow);
//         dielectricMat.push(epsRow);
//     }

//     return { phiAxis, rhoAxis, cte: cteMat, density: densityMat, dielectric: dielectricMat };
// }















/**
 * surface3DCalc.js
 *
 * Computes 3D surface data for CTE, Density, Dielectric.
 *
 * IMPORTANT — what goes on each axis and what Z means:
 *
 *   X axis: Microballoon volume fraction Φ  (0 → 0.6), reversed in display
 *   Y axis: Microballoon density ρ_p (kg/m³) (100 → 700)
 *   Z axis: Shared axis with THREE surfaces stacked:
 *
 *   For each (Φ, ρ_p) point:
 *     1. Derive η = (1 - ρ_p/ρ_glass)^(1/3)
 *     2. Compute CTE, Density, Dielectric using closed-form formulas
 *
 *   The surfaces are placed on a SHARED Z axis by adding large offsets
 *   so they appear stacked like the reference image:
 *     CTE       → raw value × scale_factor           (bottom,  ~-800 to -100)
 *     Density   → raw value shifted to sit near 0    (middle,  ~-50  to +150)
 *     Dielectric→ raw value shifted to sit at top    (top,     ~+200 to +400)
 *
 *   The Z-offset values were chosen by studying the reference image where:
 *     - CTE surface goes from about -800 to -100 on Z
 *     - Density surface sits around 0 on Z
 *     - Dielectric surface sits around 200-400 on Z
 *
 * CTE formula (Levin/Rosen-Hashin, rearranged from Django cte_rev):
 *   a = 1 - 2*nuf + (1+nuf)/2 * η^3
 *   b = (1 - η^3) * (1 - 2*num)
 *   cte_composite = (alpm * a + alpf * Φ * (modf/modm) * b) / (a + Φ * (modf/modm) * b)
 *   Returned in ×1E-6/°C (e.g. 40 means 40×1E-6/°C)
 *
 * Density formula (from Django Density.py, forward form):
 *   rho_composite = rhom + Φ * (rhoc*(1-η^3) - rhom)
 *   Returned in kg/m³
 *
 * Dielectric formula (Maxwell-Garnett, from Django Dielectric.py forward):
 *   eps_hp = effective hollow particle permittivity at given η
 *   eps_composite using Maxwell-Garnett mixing
 */

const N_PHI = 25;
const N_RHO = 25;
const PHI_MIN = 0.001;
const PHI_MAX = 0.60;
const RHO_MIN = 100;
const RHO_MAX = 700;

function deriveEta(rhoParticle, rhoGlass) {
    const ratio = rhoParticle / rhoGlass;
    if (ratio >= 1 || ratio <= 0) return NaN;
    return Math.pow(1 - ratio, 1 / 3);
}

function computeCTEat(phi, eta, p) {
    if (isNaN(eta) || phi <= 0) return NaN;
    const a = 1 - 2 * p.nb + (1 + p.nb) / 2 * Math.pow(eta, 3);
    const b = (1 - Math.pow(eta, 3)) * (1 - 2 * p.nm);
    const modRatio = p.eb / p.em;
    const cte = (p.alpm * a + p.alpf * phi * modRatio * b) /
        (a + phi * modRatio * b);
    return cte; // ×1E-6/°C
}

function computeDensityAt(phi, eta, p) {
    if (isNaN(eta)) return NaN;
    return p.dm + phi * (p.wpdf * (1 - Math.pow(eta, 3)) - p.dm);
}

function computeDielectricAt(phi, eta, p) {
    if (isNaN(eta)) return NaN;
    const eta3 = Math.pow(eta, 3);
    const eps_hpm = p.epsf;
    const eps_m = p.epsm;
    const A = Math.pow(eps_hpm - 1, 2) / ((eps_hpm + 2) * (2 * eps_hpm + 1));
    const B = (eps_hpm - 1) / (eps_hpm + 2);
    const eps_hp = (1 - 2 * eta3 * A + 2 * (1 - eta3) * B) /
        (1 - 2 * eta3 * A - (1 - eta3) * B);
    const f = (eps_hp - eps_m) / (eps_hp + 2 * eps_m);
    const denom = 1 - phi * f;
    if (Math.abs(denom) < 1e-10) return NaN;
    return eps_m * (1 + 3 * phi * f) / denom;
}

/**
 * Build 3D surface matrices.
 *
 * Returns:
 * {
 *   phiAxis    : number[]     X values (N_PHI points, 0→0.6)
 *   rhoAxis    : number[]     Y values (N_RHO points, 100→700)
 *   cte        : number[][]   raw CTE values (×1E-6/°C)  [rho][phi]
 *   density    : number[][]   raw density values (kg/m³)
 *   dielectric : number[][]   raw dielectric constant
 *   cteZ       : number[][]   Z for Plotly — CTE scaled to bottom of shared Z axis
 *   densityZ   : number[][]   Z for Plotly — Density shifted to middle
 *   dielectricZ: number[][]   Z for Plotly — Dielectric shifted to top
 * }
 *
 * Z-placement strategy (matches reference image):
 *   - CTE raw values are ~40-80 ×1E-6/°C. We multiply by -10 to get -800 → -400
 *     (negative because adding hollow particles REDUCES CTE, giving the
 *     downward slope seen in the reference where higher phi = lower Z)
 *   - Density raw ~800-942 kg/m³. We subtract 942 (matrix density) and
 *     divide by 6 to get roughly -25 to +0 — sitting near zero on the Z axis
 *   - Dielectric raw ~1.5-3.5. We multiply by 100 to get 150-350 — sitting
 *     near the top of the Z axis around 200-400
 */
export function buildSurface3DData(params) {
    const rhoGlass = params.glassDensity ?? 2250;

    const phiAxis = [];
    const rhoAxis = [];

    for (let i = 0; i < N_PHI; i++)
        phiAxis.push(PHI_MIN + (PHI_MAX - PHI_MIN) * i / (N_PHI - 1));
    for (let j = 0; j < N_RHO; j++)
        rhoAxis.push(RHO_MIN + (RHO_MAX - RHO_MIN) * j / (N_RHO - 1));

    const cte = [];
    const density = [];
    const dielectric = [];
    const cteZ = [];
    const densityZ = [];
    const dielectricZ = [];

    for (let j = 0; j < N_RHO; j++) {
        const rhoRow = [], denRow = [], epsRow = [];
        const cteZRow = [], denZRow = [], epsZRow = [];
        const rhoP = rhoAxis[j];
        const eta = deriveEta(rhoP, rhoGlass);

        for (let i = 0; i < N_PHI; i++) {
            const phi = phiAxis[i];

            const cteVal = computeCTEat(phi, eta, params);
            const denVal = computeDensityAt(phi, eta, params);
            const epsVal = computeDielectricAt(phi, eta, params);

            rhoRow.push(cteVal);
            denRow.push(denVal);
            epsRow.push(epsVal);

            // Z placement for shared axis:
            // CTE: multiply by -10 → -800 to -300 range (bottom surface)
            cteZRow.push(isFinite(cteVal) ? cteVal * -10 : null);

            // Density: subtract matrix density and scale → near 0 (middle surface)
            // (composite_density - matrix_density) / 6  →  roughly -25 to +25
            denZRow.push(isFinite(denVal) ? (denVal - params.dm) / 6 : null);

            // Dielectric: multiply by 100 → 150-350 range (top surface)
            epsZRow.push(isFinite(epsVal) ? epsVal * 100 : null);
        }

        cte.push(rhoRow);
        density.push(denRow);
        dielectric.push(epsRow);
        cteZ.push(cteZRow);
        densityZ.push(denZRow);
        dielectricZ.push(epsZRow);
    }

    return { phiAxis, rhoAxis, cte, density, dielectric, cteZ, densityZ, dielectricZ };
}