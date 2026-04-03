// import { useState } from 'react';
// import { useLocation } from 'react-router-dom';
// import { ChartParamsContext } from '../../contexts/ChartParamsContext';
// import Sidebar2 from '../../pages/SideBar2';

// const DEFAULT_PARAMS = {
//     // Existing modulus params
//     em: 1100,
//     nm: 0.425,
//     eb: 30000,
//     nb: 0.2,
//     glassType: 'soda-lime',
//     particleDensity: 600,
//     phi_rpl: 0.6,
//     // NEW: Matrix material extra props
//     epsm: 3.87,       // Dielectric constant of matrix
//     alpm: 76.5,       // CTE of matrix (×1E-6/°C)
//     dm: 942,          // Density of matrix (kg/m³)
//     // NEW: Hollow particle extra props
//     epsf: 5.60,       // Dielectric constant of hollow particle
//     alpf: 4.0,        // CTE of hollow particle (×1E-6/°C)
//     wpdf: 1600,       // Wall particle density (kg/m³)
//     c2r: 76,          // Cenosphere diameter (×1E-6 m)
//     // NEW: Slider / variant values
//     cteVariant: 40,   // CTE slider value (×1E-6/°C)
//     rhoVariant: 920,  // Density slider value (kg/m³)
//     epsVariant: 2.5,  // Dielectric constant slider value
// };

// const Layout = ({ children, sidebarRoutes = [] }) => {
//     const [collapsed, setCollapsed] = useState(false);
//     const [formValues, setFormValues] = useState(DEFAULT_PARAMS);

//     const location = useLocation();
//     const showSidebar = sidebarRoutes.includes(location.pathname);

//     const toggleSidebar = () => setCollapsed(prev => !prev);

//     const handleFormChange = (name, value) => {
//         setFormValues(prev => ({ ...prev, [name]: value }));
//     };

//     const GLASS_DENSITIES = { 'soda-lime': 2500, 'borosilicate': 2250 };
//     const glassDensity = GLASS_DENSITIES[formValues.glassType] ?? 2500;
//     const rhoP = parseFloat(formValues.particleDensity);
//     const eta =
//         !isNaN(rhoP) && rhoP > 0
//             ? Math.pow(1 - rhoP / glassDensity, 1 / 3)
//             : NaN;

//     const chartParams = {
//         // Modulus params (existing)
//         em: parseFloat(formValues.em),
//         nm: parseFloat(formValues.nm),
//         eb: parseFloat(formValues.eb),
//         nb: parseFloat(formValues.nb),
//         eta,
//         phi_rpl: parseFloat(formValues.phi_rpl),
//         // New material props
//         epsm: parseFloat(formValues.epsm),
//         alpm: parseFloat(formValues.alpm),
//         dm: parseFloat(formValues.dm),
//         epsf: parseFloat(formValues.epsf),
//         alpf: parseFloat(formValues.alpf),
//         wpdf: parseFloat(formValues.wpdf),
//         c2r: parseFloat(formValues.c2r),
//         // Slider variants
//         cteVariant: parseFloat(formValues.cteVariant),
//         rhoVariant: parseFloat(formValues.rhoVariant),
//         epsVariant: parseFloat(formValues.epsVariant),
//     };

//     return (
//         <ChartParamsContext.Provider value={chartParams}>
//             <div className="flex w-screen overflow-x-hidden">
//                 {showSidebar && (
//                     <Sidebar2
//                         collapsed={collapsed}
//                         toggleSidebar={toggleSidebar}
//                         formValues={formValues}
//                         onFormChange={handleFormChange}
//                     />
//                 )}
//                 <main className="flex-1 min-w-0 overflow-x-hidden min-h-screen">
//                     {children}
//                 </main>
//             </div>
//         </ChartParamsContext.Provider>
//     );
// };

// export default Layout;

import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { HOLLOW_PARTICLE_PRESETS } from '../../constants/materialPresets';
import { ChartParamsContext } from '../../contexts/ChartParamsContext';
import Sidebar2 from '../../pages/SideBar2';
// ─── Default form values — must mirror Sidebar2's localForm defaults ──────────
const DEFAULT_PARAMS = {
    // Material type selectors
    matrixType: 'vinyl-ester',
    hollowType: 'borosilicate',
    // Matrix properties (Vinyl Ester defaults)
    em: 2820,
    nm: 0.35,
    epsm: 3.87,
    alpm: 76.5,
    dm: 942,
    // Hollow particle properties (Borosilicate Glass defaults)
    eb: 63000,
    nb: 0.20,
    epsf: 4.70,
    alpf: 3.3,
    wpdf: 1600,
    c2r: 76,
    // Geometry
    particleDensity: 600,
    phi_rpl: 0.6,
    // Chart variant sliders
    cteVariant: 40,
    rhoVariant: 920,
    epsVariant: 2.5,
};

const Layout = ({ children, sidebarRoutes = [] }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [formValues, setFormValues] = useState(DEFAULT_PARAMS);

    const location = useLocation();
    const showSidebar = sidebarRoutes.includes(location.pathname);

    const toggleSidebar = () => setCollapsed(prev => !prev);

    // Support both single-field and batch updates
    const handleFormChange = (name, value) => {
        setFormValues(prev => ({ ...prev, [name]: value }));
    };

    // ── Derive eta from true particle density + selected hollow particle glass density ──
    const hollowPreset = HOLLOW_PARTICLE_PRESETS[formValues.hollowType];
    const glassDensity = hollowPreset?.glassDensity ?? 2500;
    const rhoP = parseFloat(formValues.particleDensity);
    const eta =
        !isNaN(rhoP) && rhoP > 0
            ? Math.pow(1 - rhoP / glassDensity, 1 / 3)
            : NaN;

    // ── Expose all params to chart pages via context ──────────────────────────
    const chartParams = {
        // Modulus / mechanical
        em: parseFloat(formValues.em),
        nm: parseFloat(formValues.nm),
        eb: parseFloat(formValues.eb),
        nb: parseFloat(formValues.nb),
        eta,
        phi_rpl: parseFloat(formValues.phi_rpl),
        // Thermal
        alpm: parseFloat(formValues.alpm),
        alpf: parseFloat(formValues.alpf),
        // Electrical
        epsm: parseFloat(formValues.epsm),
        epsf: parseFloat(formValues.epsf),
        // Density / geometry
        dm: parseFloat(formValues.dm),
        wpdf: parseFloat(formValues.wpdf),
        c2r: parseFloat(formValues.c2r),
        // Slider variants
        cteVariant: parseFloat(formValues.cteVariant),
        rhoVariant: parseFloat(formValues.rhoVariant),
        epsVariant: parseFloat(formValues.epsVariant),
        // Pass through type keys in case charts want to display them
        matrixType: formValues.matrixType,
        hollowType: formValues.hollowType,
    };

    return (
        <ChartParamsContext.Provider value={chartParams}>
            <div className="flex w-screen overflow-x-hidden">
                {showSidebar && (
                    <Sidebar2
                        collapsed={collapsed}
                        toggleSidebar={toggleSidebar}
                        formValues={formValues}
                        onFormChange={handleFormChange}
                    />
                )}
                <main className="flex-1 min-w-0 overflow-x-hidden min-h-screen">
                    {children}
                </main>
            </div>
        </ChartParamsContext.Provider>
    );
};

export default Layout;