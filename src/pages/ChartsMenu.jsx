// /**
//  * ChartsMenu.jsx
//  *
//  * Updated menu page with all 9 charts: 3 existing + 6 new.
//  * New charts don't have mini-preview computations (they use different
//  * math with eta-sweep rather than phi-sweep), so they show descriptive
//  * placeholder cards with a subtle icon.
//  */
// import React, { useEffect, useMemo, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//     CartesianGrid, Line, LineChart, XAxis, YAxis
// } from 'recharts';
// import ChartCard from '../components/shared/ChartCard';
// import ChartCarousel from '../components/shared/ChartCarousel';
// import { useChartParams } from '../contexts/ChartParamsContext';
// import { diffScheme } from '../utils/matlabFunctions/diffScheme';
// import { odeRK45 } from '../utils/matlabFunctions/odeRK45';

// // ─── Mini chart styles ────────────────────────────────────────────────────────
// const LINE_PROPS = {
//     type: 'monotone',
//     stroke: '#ef4444',
//     strokeWidth: 1.5,
//     strokeDasharray: '4 4',
//     dot: false,
//     activeDot: false,
//     isAnimationActive: false,
// };

// const MINI_CHART_PROPS = {
//     width: 600,
//     height: 220,
//     margin: { top: 8, right: 8, bottom: 8, left: 8 },
//     style: { width: '100%' },
// };

// // ─── Mini charts for existing modulus previews ────────────────────────────────
// const MiniYoungChart = ({ chartData }) => (
//     <LineChart data={chartData} {...MINI_CHART_PROPS}>
//         <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
//         <XAxis dataKey="phi" hide />
//         <YAxis hide domain={['auto', 'auto']} />
//         <Line {...LINE_PROPS} dataKey="E" />
//     </LineChart>
// );

// const MiniBulkChart = ({ chartData }) => (
//     <LineChart data={chartData} {...MINI_CHART_PROPS}>
//         <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
//         <XAxis dataKey="phi" hide />
//         <YAxis hide domain={['auto', 'auto']} />
//         <Line {...LINE_PROPS} dataKey="K" />
//     </LineChart>
// );

// const MiniShearChart = ({ chartData }) => (
//     <LineChart data={chartData} {...MINI_CHART_PROPS}>
//         <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
//         <XAxis dataKey="phi" hide />
//         <YAxis hide domain={['auto', 'auto']} />
//         <Line {...LINE_PROPS} dataKey="G" />
//     </LineChart>
// );

// // ─── Descriptive placeholder for new charts (no mini preview) ─────────────────
// const MiniDescPlaceholder = ({ subtitle }) => (
//     <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-sm text-center px-4 gap-2">
//         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
//                 d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//         </svg>
//         <span className="text-xs text-gray-400">{subtitle}</span>
//     </div>
// );

// // ─── Generic missing-data placeholder ─────────────────────────────────────────
// const MiniPlaceholder = () => (
//     <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm text-center px-4">
//         Enter particle density in the sidebar to preview
//     </div>
// );

// // ─── Menu ─────────────────────────────────────────────────────────────────────
// const ChartsMenu = () => {
//     const navigate = useNavigate();
//     const { em, nm, eb, nb, eta, phi_rpl } = useChartParams();

//     const [chartData, setChartData] = useState(null);

//     const paramsValid = useMemo(
//         () => [em, nm, eb, nb, eta, phi_rpl].every(v => !isNaN(v) && v !== undefined),
//         [em, nm, eb, nb, eta, phi_rpl]
//     );

//     useEffect(() => {
//         if (!paramsValid) return;

//         const timer = setTimeout(() => {
//             try {
//                 const odefn = (phi, X) => diffScheme(phi, X, eb, nb, eta, phi_rpl);
//                 const solution = odeRK45(odefn, [0, phi_rpl], [em, nm], { dt: 0.001, tol: 1e-8 });

//                 const step = 30;
//                 const PHI = solution.t.filter((_, i) => i % step === 0);
//                 const Ey = solution.y.filter((_, i) => i % step === 0).map(y => y[0]);
//                 const Nu = solution.y.filter((_, i) => i % step === 0).map(y => y[1]);

//                 const data = PHI.map((phi, i) => ({
//                     phi: Math.round(phi * 1000) / 1000,
//                     E: Math.round(Ey[i] * 100) / 100,
//                     K: Math.round((Ey[i] / (3 * (1 - 2 * Nu[i]))) * 100) / 100,
//                     G: Math.round((Ey[i] / (2 * (1 + Nu[i]))) * 100) / 100,
//                 }));

//                 setChartData(data);
//             } catch (err) {
//                 console.error('Menu preview computation error:', err);
//                 setChartData(null);
//             }
//         }, 150);

//         return () => clearTimeout(timer);
//     }, [em, nm, eb, nb, eta, phi_rpl, paramsValid]);

//     const handleChartNavigation = (url) => navigate(url);

//     const CHART_CARDS = [
//         // ── Existing ──────────────────────────────────────────────────────────
//         {
//             id: 1,
//             title: 'Young Modulus Curve',
//             navigateUrl: '/young-modulus-curve',
//             chartComponent: paramsValid && chartData ? <MiniYoungChart chartData={chartData} /> : <MiniPlaceholder />,
//         },
//         {
//             id: 2,
//             title: 'Bulk Modulus Curve',
//             navigateUrl: '/bulk-modulus-curve',
//             chartComponent: paramsValid && chartData ? <MiniBulkChart chartData={chartData} /> : <MiniPlaceholder />,
//         },
//         {
//             id: 3,
//             title: 'Shear Modulus Curve',
//             navigateUrl: '/shear-modulus-curve',
//             chartComponent: paramsValid && chartData ? <MiniShearChart chartData={chartData} /> : <MiniPlaceholder />,
//         },
//         // ── New ───────────────────────────────────────────────────────────────
//         {
//             id: 4,
//             title: 'CTE Curve (×1E-01/°C)',
//             navigateUrl: '/cte-curve',
//             chartComponent: <MiniDescPlaceholder subtitle="Φ (%) vs η — adjust CTE target in sidebar" />,
//         },
//         {
//             id: 5,
//             title: 'ModE — Porfiri Gupta',
//             navigateUrl: '/mode-porfiri-gupta',
//             chartComponent: <MiniDescPlaceholder subtitle="Modulus (GPa) vs Φ — Porfiri-Gupta model" />,
//         },
//         {
//             id: 6,
//             title: 'ModE — Bardella Genna',
//             navigateUrl: '/mode-bardella-genna',
//             chartComponent: <MiniDescPlaceholder subtitle="Shear Mod vs Bulk Mod (GPa) — Bardella-Genna model" />,
//         },
//         {
//             id: 7,
//             title: 'Density Curve',
//             navigateUrl: '/density-curve',
//             chartComponent: <MiniDescPlaceholder subtitle="Φ (%) vs η — adjust target density in sidebar" />,
//         },
//         {
//             id: 8,
//             title: 'Dielectric Constant Curve',
//             navigateUrl: '/dielectric-curve',
//             chartComponent: <MiniDescPlaceholder subtitle="Φ (%) vs η — adjust target ε in sidebar" />,
//         },
//         {
//             id: 9,
//             title: 'CTE Contour (×1E-01/°C)',
//             navigateUrl: '/cte-contour',
//             chartComponent: <MiniDescPlaceholder subtitle="Multi-level CTE iso-lines: Φ (%) vs η" />,
//         },
//     ];

//     return (
//         <React.Fragment>
//             <div className="bg-gray-100 min-h-screen p-6">
//                 <h1 className="text-2xl font-semibold text-gray-800 mb-6">Charts Available</h1>
//                 <ChartCarousel
//                     CHART_CARDS={CHART_CARDS}
//                     ChartCard={ChartCard}
//                     handleChartNavigation={handleChartNavigation}
//                 />
//             </div>
//         </React.Fragment>
//     );
// };

// export default ChartsMenu;








/**
 * ChartsMenu.jsx
 *
 * Menu page with two tabs:
 *   - Plots tab:    carousel of all 9 chart cards (existing behaviour)
 *   - Contours tab: filled contour chart with Contours Graph + Overlay Graph dropdowns
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CartesianGrid, Line, LineChart, XAxis, YAxis,
} from 'recharts';
import ChartCard from '../components/shared/ChartCard';
import ChartCarousel from '../components/shared/ChartCarousel';
import ContourPlot from '../components/shared/ContourPlot';
import { CHART_OPTIONS } from '../constants/chartOptions';
import { useChartParams } from '../contexts/ChartParamsContext';
import { diffScheme } from '../utils/matlabFunctions/diffScheme';
import { odeRK45 } from '../utils/matlabFunctions/odeRK45';

// ─── Mini chart shared styles ─────────────────────────────────────────────────
const LINE_PROPS = {
    type: 'monotone',
    stroke: '#ef4444',
    strokeWidth: 1.5,
    strokeDasharray: '4 4',
    dot: false,
    activeDot: false,
    isAnimationActive: false,
};
const MINI_CHART_PROPS = {
    width: 600,
    height: 220,
    margin: { top: 8, right: 8, bottom: 8, left: 8 },
    style: { width: '100%' },
};

const MiniYoungChart = ({ chartData }) => (<LineChart data={chartData} {...MINI_CHART_PROPS}><CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" /><XAxis dataKey="phi" hide /><YAxis hide domain={['auto', 'auto']} /><Line {...LINE_PROPS} dataKey="E" /></LineChart>);
const MiniBulkChart = ({ chartData }) => (<LineChart data={chartData} {...MINI_CHART_PROPS}><CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" /><XAxis dataKey="phi" hide /><YAxis hide domain={['auto', 'auto']} /><Line {...LINE_PROPS} dataKey="K" /></LineChart>);
const MiniShearChart = ({ chartData }) => (<LineChart data={chartData} {...MINI_CHART_PROPS}><CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" /><XAxis dataKey="phi" hide /><YAxis hide domain={['auto', 'auto']} /><Line {...LINE_PROPS} dataKey="G" /></LineChart>);

const MiniPlaceholder = () => (
    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm text-center px-4">
        Enter particle density in the sidebar to preview
    </div>
);
const MiniDescPlaceholder = ({ subtitle }) => (
    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-sm text-center px-4 gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span className="text-xs text-gray-400">{subtitle}</span>
    </div>
);

// ─── Tab button ───────────────────────────────────────────────────────────────
const TabButton = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-6 py-2 text-sm font-medium border-b-2 transition-colors duration-150 focus:outline-none ${active
            ? 'border-purple-600 text-purple-700'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
    >
        {children}
    </button>
);

// ─── Contours tab content ─────────────────────────────────────────────────────
const ContoursTab = () => {
    const [contourType, setContourType] = useState('cte');
    const [overlayType, setOverlayType] = useState('density');
    const [plotTriggered, setPlotTriggered] = useState(false);
    // committed values — only update when "Plot Graph" is clicked
    const [activeContour, setActiveContour] = useState(null);
    const [activeOverlay, setActiveOverlay] = useState(null);

    const handlePlot = () => {
        setActiveContour(contourType);
        setActiveOverlay(overlayType);
        setPlotTriggered(true);
    };

    return (
        <div className="p-4">
            {/* ── Controls row ── */}
            <div className="flex items-end gap-4 mb-5 flex-wrap">
                {/* Contours Graph dropdown */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Contours Graph</label>
                    <select
                        value={contourType}
                        onChange={e => setContourType(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 min-w-65"
                    >
                        {CHART_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>

                {/* Overlay Graph dropdown */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Overlay Graph</label>
                    <select
                        value={overlayType}
                        onChange={e => setOverlayType(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 min-w-65"
                    >
                        {CHART_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>

                {/* Plot Graph button */}
                <button
                    onClick={handlePlot}
                    className="px-6 py-2 rounded text-white font-semibold text-sm transition-opacity hover:opacity-90 focus:outline-none"
                    style={{ background: '#54058c', marginBottom: '1px' }}
                >
                    Plot Graph
                </button>
            </div>

            {/* ── Contour chart ── */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <ContourPlot
                    contourType={plotTriggered ? activeContour : null}
                    overlayType={plotTriggered ? activeOverlay : null}
                />
            </div>
        </div>
    );
};

// ─── Plots tab content ────────────────────────────────────────────────────────
const PlotsTab = () => {
    const navigate = useNavigate();
    const { em, nm, eb, nb, eta, phi_rpl } = useChartParams();
    const [chartData, setChartData] = useState(null);

    const paramsValid = useMemo(
        () => [em, nm, eb, nb, eta, phi_rpl].every(v => !isNaN(v) && v !== undefined),
        [em, nm, eb, nb, eta, phi_rpl]
    );

    useEffect(() => {
        if (!paramsValid) return;
        const timer = setTimeout(() => {
            try {
                const odefn = (phi, X) => diffScheme(phi, X, eb, nb, eta, phi_rpl);
                const solution = odeRK45(odefn, [0, phi_rpl], [em, nm], { dt: 0.001, tol: 1e-8 });
                const step = 30;
                const PHI = solution.t.filter((_, i) => i % step === 0);
                const Ey = solution.y.filter((_, i) => i % step === 0).map(y => y[0]);
                const Nu = solution.y.filter((_, i) => i % step === 0).map(y => y[1]);
                setChartData(PHI.map((phi, i) => ({
                    phi: Math.round(phi * 1000) / 1000,
                    E: Math.round(Ey[i] * 100) / 100,
                    K: Math.round((Ey[i] / (3 * (1 - 2 * Nu[i]))) * 100) / 100,
                    G: Math.round((Ey[i] / (2 * (1 + Nu[i]))) * 100) / 100,
                })));
            } catch { setChartData(null); }
        }, 150);
        return () => clearTimeout(timer);
    }, [em, nm, eb, nb, eta, phi_rpl, paramsValid]);

    const handleChartNavigation = url => navigate(url);

    const CHART_CARDS = [
        {
            id: 1, title: 'Young Modulus Curve', navigateUrl: '/young-modulus-curve',
            chartComponent: paramsValid && chartData ? <MiniYoungChart chartData={chartData} /> : <MiniPlaceholder />,
        },
        {
            id: 2, title: 'Bulk Modulus Curve', navigateUrl: '/bulk-modulus-curve',
            chartComponent: paramsValid && chartData ? <MiniBulkChart chartData={chartData} /> : <MiniPlaceholder />,
        },
        {
            id: 3, title: 'Shear Modulus Curve', navigateUrl: '/shear-modulus-curve',
            chartComponent: paramsValid && chartData ? <MiniShearChart chartData={chartData} /> : <MiniPlaceholder />,
        },
        {
            id: 4, title: 'CTE Curve (×1E-01/°C)', navigateUrl: '/cte-curve',
            chartComponent: <MiniDescPlaceholder subtitle="Φ (%) vs η — adjust CTE target in sidebar" />,
        },
        {
            id: 5, title: 'ModE — Porfiri Gupta', navigateUrl: '/mode-porfiri-gupta',
            chartComponent: <MiniDescPlaceholder subtitle="Modulus (GPa) vs Φ — Porfiri-Gupta model" />,
        },
        {
            id: 6, title: 'ModE — Bardella Genna', navigateUrl: '/mode-bardella-genna',
            chartComponent: <MiniDescPlaceholder subtitle="Shear Mod vs Bulk Mod (GPa) — Bardella-Genna model" />,
        },
        {
            id: 7, title: 'Density Curve', navigateUrl: '/density-curve',
            chartComponent: <MiniDescPlaceholder subtitle="Φ (%) vs η — adjust target density in sidebar" />,
        },
        {
            id: 8, title: 'Dielectric Constant Curve', navigateUrl: '/dielectric-curve',
            chartComponent: <MiniDescPlaceholder subtitle="Φ (%) vs η — adjust target ε in sidebar" />,
        },
        {
            id: 9, title: 'CTE Contour (×1E-01/°C)', navigateUrl: '/cte-contour',
            chartComponent: <MiniDescPlaceholder subtitle="Multi-level CTE iso-lines: Φ (%) vs η" />,
        },
    ];

    return (
        <div className="p-6">
            <ChartCarousel
                CHART_CARDS={CHART_CARDS}
                ChartCard={ChartCard}
                handleChartNavigation={handleChartNavigation}
            />
        </div>
    );
};

// ─── ChartsMenu ───────────────────────────────────────────────────────────────
const ChartsMenu = () => {
    const [activeTab, setActiveTab] = useState('plots');

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Page header */}
            <div className="px-6 pt-5 pb-0">
                <h1 className="text-2xl font-semibold text-gray-800 mb-3">Charts Available</h1>

                {/* Tab bar */}
                <div className="flex border-b border-gray-300 bg-white rounded-t-lg px-2 shadow-sm">
                    <TabButton active={activeTab === 'plots'} onClick={() => setActiveTab('plots')}>
                        Plots
                    </TabButton>
                    <TabButton active={activeTab === 'contours'} onClick={() => setActiveTab('contours')}>
                        Contours
                    </TabButton>
                </div>
            </div>

            {/* Tab content */}
            <div className="bg-white shadow-sm rounded-b-lg mx-0">
                {activeTab === 'plots' && <PlotsTab />}
                {activeTab === 'contours' && <ContoursTab />}
            </div>
        </div>
    );
};

export default ChartsMenu;