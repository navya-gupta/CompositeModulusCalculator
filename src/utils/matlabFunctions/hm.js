export const hm = (kb, km, mb, mm, h) => {
    const lm = km - 2 * mm / 3;
    const lb = kb - 2 * mb / 3;

    // Numerator coefficients
    const c0 = 15 * (9 * lb + 14 * mb) * (mb - mm) * mm * (lm + 2 * mm) *
        (14 * mb * (mb + 4 * mm) + lb * (19 * mb + 16 * mm));

    const c3 = -375 * mm * (lm + 2 * mm) *
        (3 * lb * lb * (9 * mb * mb - 10 * mb * mm + 8 * mm * mm) +
            4 * lb * mb * (14 * mb * mb - 9 * mb * mm + 16 * mm * mm) +
            28 * (Math.pow(mb, 4) + 2 * mb * mb * mm * mm));

    const c5 = 15120 * Math.pow(lb + mb, 2) * Math.pow(mb - mm, 2) * mm * (lm + 2 * mm);

    const c7 = -375 * (27 * lb * lb + 56 * lb * mb + 28 * mb * mb) *
        Math.pow(mb - mm, 2) * mm * (lm + 2 * mm);

    const c10 = 15 * (19 * lb + 14 * mb) * (mb - mm) * mm * (lm + 2 * mm) *
        (lb * (9 * mb + 6 * mm) + 2 * mb * (7 * mb + 8 * mm));

    // Denominator coefficients
    const d0 = (9 * lb + 14 * mb) * (2 * mm * (8 * mb + 7 * mm) + lm * (6 * mb + 9 * mm)) *
        (14 * mb * (mb + 4 * mm) + lb * (19 * mb + 16 * mm));

    const d3 = -50 * (2 * lb * mb * (3 * lm * (28 * mb * mb + 13 * mb * mm - 48 * mm * mm) +
        14 * mm * (16 * mb * mb + 3 * mb * mm - 16 * mm * mm)) +
        28 * mb * mb * (2 * mm * (4 * mb * mb + 3 * mb * mm - 7 * mm * mm) +
            3 * lm * (mb * mb + mb * mm - 3 * mm * mm)) +
        3 * lb * lb * (9 * lm * (3 * mb * mb + mb * mm - 4 * mm * mm) -
            2 * mm * (-36 * mb * mb + mb * mm + 28 * mm * mm)));

    const d5 = 1008 * Math.pow(lb + mb, 2) * (mb - mm) *
        (2 * mm * (8 * mb + 7 * mm) + lm * (6 * mb + 9 * mm));

    const d7 = -25 * (27 * lb * lb + 56 * lb * mb + 28 * mb * mb) * (mb - mm) *
        (2 * mm * (8 * mb + 7 * mm) + lm * (6 * mb + 9 * mm));

    const d10 = 2 * (19 * lb + 14 * mb) * (mb - mm) *
        (3 * lb * (9 * lm * (mb - mm) + 2 * (12 * mb - 7 * mm) * mm) +
            2 * mb * (3 * lm * (7 * mb - 12 * mm) + 56 * (mb - mm) * mm));

    const h3 = Math.pow(h, 3);
    const h5 = Math.pow(h, 5);
    const h7 = Math.pow(h, 7);
    const h10 = Math.pow(h, 10);

    return (c0 + c3 * h3 + c5 * h5 + c7 * h7 + c10 * h10) /
        (d0 + d3 * h3 + d5 * h5 + d7 * h7 + d10 * h10);
};

export default hm;