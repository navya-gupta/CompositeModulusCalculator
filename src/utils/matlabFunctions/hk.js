export const hk = (kb, km, mb, mm, h) => {
    const a0 = 4 * mb * (-kb + km) * (-3 * km - 4 * mm);
    const a3 = kb * (3 * km + 4 * mb) * (-3 * km - 4 * mm);
    const b0 = 4 * mb * (3 * kb + 4 * mm);
    const b3 = -12 * kb * (mb - mm);

    const h3 = Math.pow(h, 3);
    return (a0 + a3 * h3) / (b0 + b3 * h3);
};

export default hk;