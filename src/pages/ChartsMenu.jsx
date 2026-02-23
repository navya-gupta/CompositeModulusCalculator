import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CartesianGrid,
    Line, LineChart, XAxis, YAxis
} from 'recharts';
import ChartCard from '../components/shared/ChartCard';
// ADDED: useChartParams to get live sidebar values instead of location.state
import { useChartParams } from '../contexts/ChartParamsContext';
import { diffScheme } from '../utils/matlabFunctions/diffScheme';
import { odeRK45 } from '../utils/matlabFunctions/odeRK45';

// ─── Shared mini chart styles ─────────────────────────────────────────────────
const LINE_PROPS = {
    type: 'monotone',
    stroke: '#ef4444',
    strokeWidth: 1.5,
    strokeDasharray: '4 4',
    dot: false,
    activeDot: false,
    isAnimationActive: false, // ADDED: disable animation so cards update instantly
};

// CHANGED: removed ResponsiveContainer entirely for mini previews — it can't
// reliably measure flex/grid children before paint and warns "width(-1)/height(-1)".
// Fixed pixel dimensions on LineChart itself are the simplest reliable fix.
// Width uses a large value; the SVG will scale down naturally inside the card.
const MINI_CHART_PROPS = {
    width: 600,
    height: 220,
    margin: { top: 8, right: 8, bottom: 8, left: 8 },
    style: { width: '100%' }, // let CSS shrink it visually without Recharts measuring
};

const MiniYoungChart = ({ chartData }) => (
    <LineChart data={chartData} {...MINI_CHART_PROPS}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />

        <XAxis dataKey="phi" hide />
        <YAxis hide domain={['auto', 'auto']} />
        <Line {...LINE_PROPS} dataKey="E" />
    </LineChart>
);

const MiniBulkChart = ({ chartData }) => (
    <LineChart className='border-none border-0' data={chartData} {...MINI_CHART_PROPS}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />

        <XAxis dataKey="phi" hide />
        <YAxis hide domain={['auto', 'auto']} />
        <Line {...LINE_PROPS} dataKey="K" />
    </LineChart>
);

const MiniShearChart = ({ chartData }) => (
    <LineChart data={chartData} {...MINI_CHART_PROPS}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />

        <XAxis dataKey="phi" hide />
        <YAxis hide domain={['auto', 'auto']} />
        <Line {...LINE_PROPS} dataKey="G" />
    </LineChart>
);

// ─── Placeholder shown while params are not yet valid ─────────────────────────
const MiniPlaceholder = () => (
    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm text-center px-4">
        Enter particle density in the sidebar to preview
    </div>
);

// ─── Menu ─────────────────────────────────────────────────────────────────────
const Menu = () => {
    const navigate = useNavigate();

    // CHANGED: was `location.state?.formData`; now live from sidebar context
    const { em, nm, eb, nb, eta, phi_rpl } = useChartParams();

    const [chartData, setChartData] = useState(null);

    const paramsValid = useMemo(
        () => [em, nm, eb, nb, eta, phi_rpl].every(v => !isNaN(v) && v !== undefined),
        [em, nm, eb, nb, eta, phi_rpl]
    );

    // Recompute whenever sidebar params change
    useEffect(() => {
        // FIXED: removed synchronous setChartData(null) here — instead we guard
        // with paramsValid at render time (see CHART_CARDS below) to avoid
        // cascading setState calls inside the effect body
        if (!paramsValid) return;

        const timer = setTimeout(() => {
            try {
                const odefn = (phi, X) => diffScheme(phi, X, eb, nb, eta, phi_rpl);
                const solution = odeRK45(odefn, [0, phi_rpl], [em, nm], { dt: 0.001, tol: 1e-8 });

                // Downsample more aggressively for previews (every 30th point is enough)
                const step = 30;
                const PHI = solution.t.filter((_, i) => i % step === 0);
                const Ey = solution.y.filter((_, i) => i % step === 0).map(y => y[0]);
                const Nu = solution.y.filter((_, i) => i % step === 0).map(y => y[1]);

                const data = PHI.map((phi, i) => ({
                    phi: Math.round(phi * 1000) / 1000,
                    E: Math.round(Ey[i] * 100) / 100,
                    K: Math.round((Ey[i] / (3 * (1 - 2 * Nu[i]))) * 100) / 100,
                    G: Math.round((Ey[i] / (2 * (1 + Nu[i]))) * 100) / 100,
                }));

                setChartData(data);
            } catch (err) {
                console.error('Menu preview computation error:', err);
                setChartData(null);
            }
        }, 150); // slightly longer debounce since we're rendering 3 charts

        return () => clearTimeout(timer);
    }, [em, nm, eb, nb, eta, phi_rpl, paramsValid]);

    const handleChartNavigation = (url) => {
        navigate(url);
        // REMOVED: no longer passing formData as route state — charts read from context
    };

    // Build chart configs with live mini chart elements
    const CHART_CARDS = [
        {
            id: 1,
            title: 'Young Modulus Curve',
            navigateUrl: '/young-modulus-curve',
            // FIXED: gate on paramsValid too — when params become invalid (e.g. user
            // clears particle density), show placeholder without a setState in the effect
            chartComponent: paramsValid && chartData ? <MiniYoungChart chartData={chartData} /> : <MiniPlaceholder />,
        },
        {
            id: 2,
            title: 'Bulk Modulus Curve',
            navigateUrl: '/bulk-modulus-curve',
            chartComponent: paramsValid && chartData ? <MiniBulkChart chartData={chartData} /> : <MiniPlaceholder />,
        },
        {
            id: 3,
            title: 'Shear Modulus Curve',
            navigateUrl: '/shear-modulus-curve',
            chartComponent: paramsValid && chartData ? <MiniShearChart chartData={chartData} /> : <MiniPlaceholder />,
        },
    ];

    return (
        <React.Fragment>
            <div className="bg-gray-100 min-h-screen p-6">
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">Charts Available</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {CHART_CARDS.map((chart) => (
                        <div key={chart.id} className="h-full">
                            <ChartCard
                                title={chart.title}
                                chartComponent={chart.chartComponent}
                                navigateUrl={chart.navigateUrl}
                                onShowChart={handleChartNavigation}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </React.Fragment>
    );
};

export default Menu;