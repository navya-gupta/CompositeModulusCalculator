// ─── Material presets ─────────────────────────────────────────────────────────

/**
 * Matrix material presets.
 * Vinyl Ester values are from Django (confirmed).
 * Epoxy and HDPE use standard engineering literature values.
 */
export const MATRIX_PRESETS = {
    'vinyl-ester': {
        label: 'Vinyl Ester',
        em: 2820,
        nm: 0.35,
        epsm: 3.87,
        alpm: 76.5,
        dm: 942,
    },
    'epoxy': {
        label: 'Epoxy',
        em: 3500,
        nm: 0.38,
        epsm: 3.60,
        alpm: 55.0,
        dm: 1200,
    },
    'hdpe': {
        label: 'HDPE',
        em: 800,
        nm: 0.46,
        epsm: 2.30,
        alpm: 150.0,
        dm: 955,
    },
};

/**
 * Hollow particle presets.
 * Only Borosilicate Glass and Soda-Lime Glass (no generic Glass or Carbon).
 * glassDensity is used to derive eta from true particle density.
 */
export const HOLLOW_PARTICLE_PRESETS = {
    'borosilicate': {
        label: 'BoroSilicate Glass',
        eb: 63000,
        nb: 0.20,
        epsf: 4.70,
        alpf: 3.3,
        wpdf: 1600,
        c2r: 76,
        glassDensity: 2250,
    },
    'sodalime': {
        label: 'SodaLime Glass',
        eb: 70000,
        nb: 0.23,
        epsf: 7.20,
        alpf: 9.0,
        wpdf: 1600,
        c2r: 76,
        glassDensity: 2500,
    },
};