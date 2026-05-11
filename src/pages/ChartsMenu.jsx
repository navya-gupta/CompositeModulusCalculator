/**
 * ChartsMenu.jsx
 *
 * 2 × 2 grid:
 *   Row 1: Young Modulus Card  |  Bulk Modulus Card
 *   Row 2: Shear Modulus Card  |  3D Surface Card
 *
 * The 3D card shows a static SVG thumbnail (perspective grid preview)
 * so the page stays fast. Clicking "Show Chart" navigates to /surface-3d
 * which renders the full live Plotly chart.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { useChartParams } from '../contexts/ChartParamsContext';
import { diffScheme } from '../utils/matlabFunctions/diffScheme';
import { odeRK45 } from '../utils/matlabFunctions/odeRK45';

// ─── Mini Recharts previews ───────────────────────────────────────────────────
const LINE_PROPS = {
    type: 'monotone', stroke: '#ef4444', strokeWidth: 1.5,
    strokeDasharray: '4 4', dot: false, activeDot: false, isAnimationActive: false,
};
const MINI_PROPS = {
    width: 600, height: 200,
    margin: { top: 8, right: 8, bottom: 8, left: 8 },
    style: { width: '100%' },
};

const MiniYoung = ({ d }) => (
    <LineChart data={d} {...MINI_PROPS}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
        <XAxis dataKey="phi" hide />
        <YAxis hide domain={['auto', 'auto']} />
        <Line {...LINE_PROPS} dataKey="E" />
    </LineChart>
);
const MiniBulk = ({ d }) => (
    <LineChart data={d} {...MINI_PROPS}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
        <XAxis dataKey="phi" hide />
        <YAxis hide domain={['auto', 'auto']} />
        <Line {...LINE_PROPS} dataKey="K" />
    </LineChart>
);
const MiniShear = ({ d }) => (
    <LineChart data={d} {...MINI_PROPS}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
        <XAxis dataKey="phi" hide />
        <YAxis hide domain={['auto', 'auto']} />
        <Line {...LINE_PROPS} dataKey="G" />
    </LineChart>
);

const EmptyPreview = () => (
    <div className="w-full flex items-center justify-center text-gray-400 text-xs text-center px-4"
        style={{ height: 200 }}>
        Enter particle density in the sidebar to preview
    </div>
);

// ─── Static 3D thumbnail ──────────────────────────────────────────────────────
/**
 * A lightweight SVG that gives the visual impression of three stacked 3D surfaces.
 * No computation needed — just a decorative preview.
 */
const Surface3DThumbnail = () => (
    <div className="w-full flex items-center justify-center" style={{ height: 200 }}>
        <svg
            viewBox="0 0 340 200"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', height: '100%', maxWidth: 340 }}
        >
            {/* ── Bottom surface — CTE (red/orange gradient) ── */}
            <defs>
                <linearGradient id="g_cte" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffb2" />
                    <stop offset="50%" stopColor="#fd8d3c" />
                    <stop offset="100%" stopColor="#bd0026" />
                </linearGradient>
                <linearGradient id="g_den" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffcc" />
                    <stop offset="50%" stopColor="#7fcdbb" />
                    <stop offset="100%" stopColor="#253494" />
                </linearGradient>
                <linearGradient id="g_eps" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fff7bc" />
                    <stop offset="50%" stopColor="#fec44f" />
                    <stop offset="100%" stopColor="#7f0000" />
                </linearGradient>
            </defs>

            {/* CTE surface — bottom */}
            <polygon
                points="20,170 170,140 320,170 170,190"
                fill="url(#g_cte)" stroke="#c0392b" strokeWidth="0.8" opacity="0.9"
            />
            <polygon
                points="20,170 20,155 170,125 170,140"
                fill="#f97316" stroke="#c0392b" strokeWidth="0.8" opacity="0.85"
            />
            <polygon
                points="170,140 170,125 320,155 320,170"
                fill="#ef4444" stroke="#c0392b" strokeWidth="0.8" opacity="0.85"
            />
            {/* CTE label */}
            <text x="290" y="168" fontSize="9" fill="#7f1d1d" fontWeight="bold">CTE</text>

            {/* Density surface — middle */}
            <polygon
                points="30,120 170,88 310,120 170,140"
                fill="url(#g_den)" stroke="#1d4ed8" strokeWidth="0.8" opacity="0.9"
            />
            <polygon
                points="30,120 30,105 170,73 170,88"
                fill="#60a5fa" stroke="#1d4ed8" strokeWidth="0.8" opacity="0.85"
            />
            <polygon
                points="170,88 170,73 310,105 310,120"
                fill="#3b82f6" stroke="#1d4ed8" strokeWidth="0.8" opacity="0.85"
            />
            <text x="275" y="118" fontSize="9" fill="#1e3a8a" fontWeight="bold">Density</text>

            {/* Dielectric surface — top */}
            <polygon
                points="40,68 170,36 300,68 170,90"
                fill="url(#g_eps)" stroke="#92400e" strokeWidth="0.8" opacity="0.9"
            />
            <polygon
                points="40,68 40,53 170,21 170,36"
                fill="#fbbf24" stroke="#92400e" strokeWidth="0.8" opacity="0.85"
            />
            <polygon
                points="170,36 170,21 300,53 300,68"
                fill="#f59e0b" stroke="#92400e" strokeWidth="0.8" opacity="0.85"
            />
            <text x="258" y="66" fontSize="9" fill="#78350f" fontWeight="bold">Dielectric</text>

            {/* Grid lines on top surface */}
            {[0.25, 0.5, 0.75].map((t, i) => (
                <line key={i}
                    x1={40 + t * 260} y1={68 - t * 0}
                    x2={170 + t * 130} y2={36 + t * 54}
                    stroke="rgba(0,0,0,0.12)" strokeWidth="0.6"
                />
            ))}

            {/* Axis labels */}
            <text x="85" y="197" fontSize="8" fill="#6b7280">Microballoon vol fraction Φ →</text>
            <text x="2" y="100" fontSize="7.5" fill="#6b7280"
                transform="rotate(-90,10,110)">Density (kg/m³) →</text>
        </svg>
    </div>
);

// ─── Chart card ───────────────────────────────────────────────────────────────
const ChartCard = ({ title, onShow, children }) => (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 flex flex-col overflow-hidden hover:scale-[1.03] hover:shadow-xl transition-all duration-200 ease-out cursor-pointer focus:outline-none focus:ring-0 focus:ring-offset-0">
        {/* Purple accent bar */}
        <div className="h-1 w-full" style={{ background: '#54058c' }} />

        {/* Header */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 shrink-0"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-sm font-semibold text-gray-800 truncate">{title}</h3>
        </div>

        {/* Preview area */}
        <div className="flex-1 px-2 pb-2 overflow-hidden">
            {children}
        </div>

        {/* Show Chart button */}
        <div className="px-4 pb-4">
            <button
                onClick={onShow}
                className="w-full py-2.5 rounded-lg text-white text-sm font-semibold
                           transition-opacity hover:opacity-90 focus:outline-none"
                style={{ background: '#54058c' }}
            >
                Show Chart
            </button>
        </div>
    </div>
);

// ─── ChartsMenu ───────────────────────────────────────────────────────────────
const ChartsMenu = () => {
    const navigate = useNavigate();
    const { em, nm, eb, nb, eta, phi_rpl } = useChartParams();

    const [chartData, setChartData] = useState(null);

    const paramsValid = useMemo(
        () => [em, nm, eb, nb, eta, phi_rpl].every(v => !isNaN(v) && v !== undefined),
        [em, nm, eb, nb, eta, phi_rpl]
    );

    // All setState calls inside setTimeout — no synchronous setState in effect body
    useEffect(() => {
        const t = setTimeout(() => {
            if (!paramsValid) {
                setChartData(null);
                return;
            }
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
            } catch {
                setChartData(null);
            }
        }, 150);
        return () => clearTimeout(t);
    }, [em, nm, eb, nb, eta, phi_rpl, paramsValid]);

    const ok = paramsValid && chartData;

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Charts Available</h1>

            {/* 2 × 2 grid */}
            <div className="grid grid-cols-2 gap-5">

                {/* Row 1, Col 1 — Young Modulus */}
                <ChartCard
                    title="Young Modulus Curve"
                    onShow={() => navigate('/young-modulus-curve')}
                >
                    {ok ? <MiniYoung d={chartData} /> : <EmptyPreview />}
                </ChartCard>

                {/* Row 1, Col 2 — Bulk Modulus */}
                <ChartCard
                    title="Bulk Modulus Curve"
                    onShow={() => navigate('/bulk-modulus-curve')}
                >
                    {ok ? <MiniBulk d={chartData} /> : <EmptyPreview />}
                </ChartCard>

                {/* Row 2, Col 1 — Shear Modulus */}
                <ChartCard
                    title="Shear Modulus Curve"
                    onShow={() => navigate('/shear-modulus-curve')}
                >
                    {ok ? <MiniShear d={chartData} /> : <EmptyPreview />}
                </ChartCard>

                {/* Row 2, Col 2 — 3D Surface */}
                <ChartCard
                    title="3D Property Surfaces (CTE · Density · Dielectric)"
                    onShow={() => navigate('/surface-3d')}
                >
                    <Surface3DThumbnail />
                </ChartCard>

            </div>
        </div>
    );
};

export default ChartsMenu;