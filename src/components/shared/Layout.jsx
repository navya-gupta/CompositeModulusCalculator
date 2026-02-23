// // src/components/Layout.jsx
// import { useEffect, useState } from 'react';
// import { useLocation } from 'react-router-dom';
// import Sidebar from './SideBar/SideBar';

// const Layout = ({ children, sidebarRoutes = [] }) => {
//     const location = useLocation();
//     const [collapsed, setCollapsed] = useState(false);
//     const [isMobile, setIsMobile] = useState(false);

//     // Check if current route should have sidebar
//     const showSidebar = sidebarRoutes.includes(location.pathname);

//     // Toggle sidebar collapsed state
//     const toggleSidebar = () => {
//         setCollapsed(prev => !prev);
//     };

//     // Handle responsive behavior
//     useEffect(() => {
//         const checkScreenSize = () => {
//             setIsMobile(window.innerWidth < 768);
//             if (window.innerWidth < 768) {
//                 setCollapsed(true);
//             }
//         };

//         checkScreenSize();
//         window.addEventListener('resize', checkScreenSize);

//         return () => {
//             window.removeEventListener('resize', checkScreenSize);
//         };
//     }, []);

//     return (
//         <div className="flex min-h-screen w-screen overflow-x-hidden">
//             {showSidebar && (
//                 <Sidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />
//             )}
//             {/* <div className={`flex-1 grow transition-all duration-300 ${showSidebar ? (collapsed ? 'ml-0' : 'ml-0') : 'ml-0'}`}> */}
//             <div className={`flex-1 min-w-0 overflow-x-hidden transition-all duration-300`}>

//                 {children}
//             </div>
//         </div>
//     );
// };

// export default Layout;
// import { useState } from 'react';
// import { ChartParamsContext } from '../../contexts/ChartParamsContext'; // adjust path as needed
// import Sidebar from '../../pages/SideBar2'; // adjust path as needed

// // ─── Default form values ──────────────────────────────────────────────────────
// const DEFAULT_PARAMS = {
//     em: 1100,
//     nm: 0.425,
//     eb: 30000,
//     nb: 0.2,
//     glassType: 'soda-lime',
//     particleDensity: '',
//     phi_rpl: 0.6,
// };

// // ─── Layout ───────────────────────────────────────────────────────────────────
// const Layout = ({ children, showSidebar = true }) => {
//     const [collapsed, setCollapsed] = useState(false);
//     const [formValues, setFormValues] = useState(DEFAULT_PARAMS);

//     const toggleSidebar = () => setCollapsed(prev => !prev);

//     const handleFormChange = (name, value) => {
//         setFormValues(prev => ({ ...prev, [name]: value }));
//     };

//     // Derive eta from particle density + glass type whenever either changes
//     const GLASS_DENSITIES = { 'soda-lime': 2500, 'borosilicate': 2250 };
//     const glassDensity = GLASS_DENSITIES[formValues.glassType] ?? 2500;
//     const rhoP = parseFloat(formValues.particleDensity);
//     const eta =
//         !isNaN(rhoP) && rhoP > 0
//             ? Math.pow(1 - rhoP / glassDensity, 1 / 3)
//             : NaN;

//     // Expose clean numeric params to chart pages
//     const chartParams = {
//         em: parseFloat(formValues.em),
//         nm: parseFloat(formValues.nm),
//         eb: parseFloat(formValues.eb),
//         nb: parseFloat(formValues.nb),
//         eta,
//         phi_rpl: parseFloat(formValues.phi_rpl),
//     };

//     return (
//         <ChartParamsContext.Provider value={chartParams}>
//             <div className="flex w-screen overflow-x-hidden">
//                 {showSidebar && (
//                     <Sidebar
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
// ADDED: useLocation to check current route against sidebarRoutes (restored from old Layout)
import { useLocation } from 'react-router-dom';
import { ChartParamsContext } from '../../contexts/ChartParamsContext';
import Sidebar from '../../pages/SideBar2';

const DEFAULT_PARAMS = {
    em: 1100,
    nm: 0.425,
    eb: 30000,
    nb: 0.2,
    glassType: 'soda-lime',
    particleDensity: 600,
    phi_rpl: 0.6,
};

// CHANGED: replaced `showSidebar = true` prop with `sidebarRoutes = []`
// to allow per-route sidebar control, matching the old Layout's API
const Layout = ({ children, sidebarRoutes = [] }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [formValues, setFormValues] = useState(DEFAULT_PARAMS);

    // ADDED: derive showSidebar from current pathname vs allowed routes
    const location = useLocation();
    const showSidebar = sidebarRoutes.includes(location.pathname);

    const toggleSidebar = () => setCollapsed(prev => !prev);

    const handleFormChange = (name, value) => {
        setFormValues(prev => ({ ...prev, [name]: value }));
    };

    const GLASS_DENSITIES = { 'soda-lime': 2500, 'borosilicate': 2250 };
    const glassDensity = GLASS_DENSITIES[formValues.glassType] ?? 2500;
    const rhoP = parseFloat(formValues.particleDensity);
    const eta =
        !isNaN(rhoP) && rhoP > 0
            ? Math.pow(1 - rhoP / glassDensity, 1 / 3)
            : NaN;

    const chartParams = {
        em: parseFloat(formValues.em),
        nm: parseFloat(formValues.nm),
        eb: parseFloat(formValues.eb),
        nb: parseFloat(formValues.nb),
        eta,
        phi_rpl: parseFloat(formValues.phi_rpl),
    };

    return (
        <ChartParamsContext.Provider value={chartParams}>
            <div className="flex w-screen overflow-x-hidden">
                {showSidebar && (
                    <Sidebar
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