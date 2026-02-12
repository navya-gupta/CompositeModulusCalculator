import { hk } from './hk';
import { hkV } from './hkV';
import { hm } from './hm';
import { hmV } from './hmV';


export const diffScheme = (phi, X, Eb, nb, eta, PHI_RPL) => {
    const Em = X[0];
    const nm = X[1];

    // Lamé constants
    const lm = Em * nm / ((1 + nm) * (1 - 2 * nm));
    const mm = 0.5 * Em / (1 + nm);
    const lb = Eb * nb / ((1 + nb) * (1 - 2 * nb));
    const mb = 0.5 * Eb / (1 + nb);

    // Bulk moduli
    const km = lm + 2 * mm / 3;
    const kb = lb + 2 * mb / 3;

    const h = eta;

    // Particle family effect
    const hk_val = hk(kb, km, mb, mm, h);
    const hm_val = hm(kb, km, mb, mm, h);

    const xx1_particle = (hk_val * Math.pow(1 - 2 * nm, 2) +
        (4 / 3) * hm_val * Math.pow(1 + nm, 2)) /
        (1 - phi / PHI_RPL);

    const xx2_particle = (1 / (3 * Em)) *
        ((-1 + nm + 2 * nm * nm) *
            (2 * hm_val * (1 + nm) +
                3 * hk_val * (-1 + 2 * nm))) /
        (1 - phi / PHI_RPL);

    // Void effect
    const hkV_val = hkV(km, mm);
    const hmV_val = hmV(km, mm);

    const xx1_void = (hkV_val * Math.pow(1 - 2 * nm, 2) +
        (4 / 3) * hmV_val * Math.pow(1 + nm, 2)) /
        (1 - phi / PHI_RPL);

    const xx2_void = (1 / (3 * Em)) *
        ((-1 + nm + 2 * nm * nm) *
            (2 * hmV_val * (1 + nm) +
                3 * hkV_val * (-1 + 2 * nm))) /
        (1 - phi / PHI_RPL);

    // Combine (psij=1, psi0=0 for our case)
    const dE = xx1_particle * 1 + xx1_void * 0;
    const dNu = xx2_particle * 1 + xx2_void * 0;

    return [dE, dNu];
};

export default diffScheme;