/**
 * ChartsMenu.jsx
 *
 * Two-tab menu:
 *   Plots tab    — carousel of all 9 chart cards
 *   Contours tab — filled contour + overlay, all 6 chart types available
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import ChartCard from '../components/shared/ChartCard';
import ChartCarousel from '../components/shared/ChartCarousel';
import ContourPlot from '../components/shared/ContourPlot';
import { useChartParams } from '../contexts/ChartParamsContext';
import { CONTOUR_CHART_OPTIONS, getAxisGroup } from '../utils/contourDataBuilder';
import { diffScheme } from '../utils/matlabFunctions/diffScheme';
import { odeRK45 } from '../utils/matlabFunctions/odeRK45';

// ─── Mini chart helpers ───────────────────────────────────────────────────────
const LINE_PROPS = {
    type: 'monotone', stroke: '#ef4444', strokeWidth: 1.5,
    strokeDasharray: '4 4', dot: false, activeDot: false, isAnimationActive: false,
};
const MINI_PROPS = {
    width: 600, height: 220,
    margin: { top: 8, right: 8, bottom: 8, left: 8 },
    style: { width: '100%' },
};

const MiniYoung = ({ d }) => (<LineChart data={d} {...MINI_PROPS}><CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" /><XAxis dataKey="phi" hide /><YAxis hide domain={['auto', 'auto']} /><Line {...LINE_PROPS} dataKey="E" /></LineChart>);
const MiniBulk = ({ d }) => (<LineChart data={d} {...MINI_PROPS}><CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" /><XAxis dataKey="phi" hide /><YAxis hide domain={['auto', 'auto']} /><Line {...LINE_PROPS} dataKey="K" /></LineChart>);
const MiniShear = ({ d }) => (<LineChart data={d} {...MINI_PROPS}><CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" /><XAxis dataKey="phi" hide /><YAxis hide domain={['auto', 'auto']} /><Line {...LINE_PROPS} dataKey="G" /></LineChart>);

const Placeholder = ({ text }) => (
    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs text-center px-4 gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span>{text ?? 'Enter particle density in the sidebar to preview'}</span>
    </div>
);

// ─── Tab button ───────────────────────────────────────────────────────────────
const Tab = ({ active, onClick, children }) => (
    <button onClick={onClick}
        className={`px-6 py-2.5 text-sm font-medium border-b-2 transition-colors duration-150 focus:outline-none ${active
            ? 'border-purple-600 text-purple-700'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
        {children}
    </button>
);

// ─── Plots tab ────────────────────────────────────────────────────────────────
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
        const t = setTimeout(() => {
            try {
                const fn = (phi, X) => diffScheme(phi, X, eb, nb, eta, phi_rpl);
                const sol = odeRK45(fn, [0, phi_rpl], [em, nm], { dt: 0.001, tol: 1e-8 });
                const s = 30;
                const PHI = sol.t.filter((_, i) => i % s === 0);
                const Ey = sol.y.filter((_, i) => i % s === 0).map(y => y[0]);
                const Nu = sol.y.filter((_, i) => i % s === 0).map(y => y[1]);
                setChartData(PHI.map((phi, i) => ({
                    phi: Math.round(phi * 1000) / 1000,
                    E: Math.round(Ey[i] * 100) / 100,
                    K: Math.round((Ey[i] / (3 * (1 - 2 * Nu[i]))) * 100) / 100,
                    G: Math.round((Ey[i] / (2 * (1 + Nu[i]))) * 100) / 100,
                })));
            } catch { setChartData(null); }
        }, 150);
        return () => clearTimeout(t);
    }, [em, nm, eb, nb, eta, phi_rpl, paramsValid]);

    const go = url => navigate(url);
    const ok = paramsValid && chartData;

    const CARDS = [
        { id: 1, title: 'Young Modulus Curve', navigateUrl: '/young-modulus-curve', chartComponent: ok ? <MiniYoung d={chartData} /> : <Placeholder /> },
        { id: 2, title: 'Bulk Modulus Curve', navigateUrl: '/bulk-modulus-curve', chartComponent: ok ? <MiniBulk d={chartData} /> : <Placeholder /> },
        { id: 3, title: 'Shear Modulus Curve', navigateUrl: '/shear-modulus-curve', chartComponent: ok ? <MiniShear d={chartData} /> : <Placeholder /> },
        { id: 4, title: 'CTE Curve (×1E-01/°C)', navigateUrl: '/cte-curve', chartComponent: <Placeholder text="Φ (%) vs η — adjust CTE target in sidebar" /> },
        { id: 5, title: 'ModE — Porfiri Gupta', navigateUrl: '/mode-porfiri-gupta', chartComponent: <Placeholder text="Modulus (GPa) vs Φ — Porfiri-Gupta model" /> },
        { id: 6, title: 'ModE — Bardella Genna', navigateUrl: '/mode-bardella-genna', chartComponent: <Placeholder text="Shear Mod vs Bulk Mod (GPa)" /> },
        { id: 7, title: 'Density Curve', navigateUrl: '/density-curve', chartComponent: <Placeholder text="Φ (%) vs η — adjust target density in sidebar" /> },
        { id: 8, title: 'Dielectric Constant Curve', navigateUrl: '/dielectric-curve', chartComponent: <Placeholder text="Φ (%) vs η — adjust target ε in sidebar" /> },
        { id: 9, title: 'CTE Contour (×1E-01/°C)', navigateUrl: '/cte-contour', chartComponent: <Placeholder text="Multi-level CTE iso-lines: Φ (%) vs η" /> },
    ];

    return (
        <div className="p-6">
            <ChartCarousel CHART_CARDS={CARDS} ChartCard={ChartCard} handleChartNavigation={go} />
        </div>
    );
};

// ─── Contours tab ─────────────────────────────────────────────────────────────
const ContoursTab = () => {
    const [contourType, setContourType] = useState('cte');
    const [overlayType, setOverlayType] = useState('density');
    const [activeContour, setActiveContour] = useState(null);
    const [activeOverlay, setActiveOverlay] = useState(null);
    const [plotTriggered, setPlotTriggered] = useState(false);

    // Warn user if axes are incompatible
    const axisWarning = useMemo(() => {
        if (!contourType || !overlayType) return null;
        if (getAxisGroup(contourType) !== getAxisGroup(overlayType)) {
            const cg = getAxisGroup(contourType) === 'eta' ? 'η-based' : 'Φ-based';
            const og = getAxisGroup(overlayType) === 'eta' ? 'η-based' : 'Φ-based';
            return `Note: "${CONTOUR_CHART_OPTIONS.find(o => o.value === contourType)?.label}" is ${cg} and "${CONTOUR_CHART_OPTIONS.find(o => o.value === overlayType)?.label}" is ${og}. The overlay line won't be shown as they use different axes.`;
        }
        return null;
    }, [contourType, overlayType]);

    const handlePlot = () => {
        setActiveContour(contourType);
        setActiveOverlay(overlayType);
        setPlotTriggered(true);
    };

    return (
        <div className="p-4">
            {/* Controls */}
            <div className="flex items-end gap-4 mb-4 flex-wrap">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Contours Graph</label>
                    <select value={contourType} onChange={e => setContourType(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 min-w-70">
                        {CONTOUR_CHART_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Overlay Graph</label>
                    <select value={overlayType} onChange={e => setOverlayType(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 min-w-70">
                        {CONTOUR_CHART_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>

                <button onClick={handlePlot}
                    className="px-6 py-2 rounded text-white font-semibold text-sm hover:opacity-90 focus:outline-none"
                    style={{ background: '#54058c', marginBottom: '1px' }}>
                    Plot Graph
                </button>
            </div>

            {/* Axis compatibility warning */}
            {axisWarning && (
                <div className="mb-3 px-4 py-2 bg-amber-50 border border-amber-300 rounded text-xs text-amber-800">
                    ⚠️ {axisWarning}
                </div>
            )}

            {/* Chart area */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <ContourPlot
                    contourType={plotTriggered ? activeContour : null}
                    overlayType={plotTriggered ? activeOverlay : null}
                />
            </div>
        </div>
    );
};

// ─── ChartsMenu ───────────────────────────────────────────────────────────────
const ChartsMenu = () => {
    const [activeTab, setActiveTab] = useState('plots');
    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="px-6 pt-5 pb-0">
                <h1 className="text-2xl font-semibold text-gray-800 mb-3">Charts Available</h1>
                <div className="flex border-b border-gray-300 bg-white rounded-t-lg px-2 shadow-sm">
                    <Tab active={activeTab === 'plots'} onClick={() => setActiveTab('plots')}>Plots</Tab>
                    <Tab active={activeTab === 'contours'} onClick={() => setActiveTab('contours')}>Contours</Tab>
                </div>
            </div>
            <div className="bg-white shadow-sm rounded-b-lg">
                {activeTab === 'plots' && <PlotsTab />}
                {activeTab === 'contours' && <ContoursTab />}
            </div>
        </div>
    );
};

export default ChartsMenu;