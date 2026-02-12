export const modulusVsVolumeFractionFormatter = (data, modulusType) => {
    const modulusTypeHeader = modulusType === 'E' ? 'Young Modulus (Mpa)' : (modulusType === 'K' ? 'Bulk Modulus (Mpa)' : 'Shear Modulus (Mpa)');
    const formattedData = data.map(point => ({
        [modulusTypeHeader]: point[modulusType],
        'Φ (Volume Fraction)': point.phi
    }));

    return formattedData;
};