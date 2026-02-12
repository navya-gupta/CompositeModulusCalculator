export const hkV = (km, mm) => {
    return -km / (1 - km / (km + 4 * mm / 3));
};

export default hkV;