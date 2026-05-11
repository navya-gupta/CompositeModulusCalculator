/**
 * CTEContour.jsx
 *
 * CTE Contour plot: multiple CTE iso-lines on Φ (%) vs η axes.
 * Each line = a different target CTE value (like contour levels).
 * Color-coded from green (low CTE) → red (high CTE), matching the Django screenshot.
 */
import { useEffect, useState } from 'react';
import {
    CartesianGrid, Label, Legend, Line, LineChart,
    ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import FullscreenChart from '../components/shared/FullScreenChart';
import { useChartParams } from '../contexts/ChartParamsContext';
import { computeCTEContours } from '../utils/cteCalc';

// CTE contour levels matching Django screenshot: 20, 30, 40, 50, 60 (×1E-6/°C)
const CTE_LEVELS = [20, 30, 40, 50, 60];

// Color scale: green → yellow → orange → red (matches Django contour palette)
const CONTOUR_COLORS = {
    20: '#22c55e',  // green
    30: '#84cc16',  // lime
    40: '#eab308',  // yellow
    50: '#f97316',  // orange
    60: '#ef4444',  // red
};

/**
 * Merge multiple contour datasets into a single array keyed by eta,
 * so Recharts can draw multiple lines from one data array.
 * Shape: [{eta: 0.9, cte_20: 12.3, cte_30: 18.4, ...}, ...]
 */
function mergeContourData(contours) {
    // Build a map: eta → {cte_N: phi}
    const map = new Map();

    for (const { cte, data } of contours) {
        const key = `cte_${cte}`;
        for (const { eta, phi } of data) {
            if (!map.has(eta)) map.set(eta, { eta });
            map.get(eta)[key] = phi;
        }
    }

    return Array.from(map.values()).sort((a, b) => a.eta - b.eta);
}

const CTEContour = () => {
    const { em, nm, eb, nb, alpm, alpf } = useChartParams();

    const [results, setResults] = useState(null);
    const [computing, setComputing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const required = [em, nm, eb, nb, alpm, alpf];
        if (required.some(v => isNaN(v) || v === undefined)) {
            setResults(null);
            setError('Fill in all sidebar fields to compute the CTE contour.');
            return;
        }

        setComputing(true);
        setError(null);

        const timer = setTimeout(() => {
            try {
                const contours = computeCTEContours(CTE_LEVELS, em, nm, alpm, eb, nb, alpf);
                const merged = mergeContourData(contours);

                // Y domain: find global min/max across all contour phi values
                let allPhi = [];
                for (const cte of CTE_LEVELS) {
                    allPhi = allPhi.concat(
                        contours.find(c => c.cte === cte).data
                            .map(d => d.phi)
                            .filter(isFinite)
                    );
                }
                const minPhi = Math.min(...allPhi);
                const maxPhi = Math.max(...allPhi);

                setResults({
                    chartData: merged,
                    yDomain: [
                        Math.floor(Math.max(minPhi * 0.95, 0)),
                        Math.ceil(maxPhi * 1.05),
                    ],
                });
            } catch (err) {
                console.error('CTE contour computation error:', err);
                setError(err.message || 'Failed to compute CTE contours');
            } finally {
                setComputing(false);
            }
        }, 150);

        return () => clearTimeout(timer);
    }, [em, nm, eb, nb, alpm, alpf]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-300 rounded shadow-lg min-w-40">
                    <p className="font-semibold text-gray-800 mb-1">η: {Number(label).toFixed(4)}</p>
                    {payload.map(p => (
                        <p key={p.dataKey} style={{ color: p.color }} className="text-sm">
                            CTE {p.dataKey.replace('cte_', '')} ×10⁻⁶: {p.value?.toFixed(1)}%
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const renderLegend = () => (
        <div className="flex items-center justify-center gap-4 mt-2">
            {CTE_LEVELS.map(cte => (
                <div key={cte} className="flex items-center gap-1.5 text-sm text-gray-700">
                    <span
                        style={{ background: CONTOUR_COLORS[cte] }}
                        className="inline-block w-4 h-0.5 rounded"
                    />
                    <span>{cte}</span>
                </div>
            ))}
        </div>
    );

    if (computing) return (
        <FullscreenChart title="CTE Contour (×1E-01/°C)">
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-xl text-gray-600">Computing CTE contours...</div>
            </div>
        </FullscreenChart>
    );

    if (error) return (
        <FullscreenChart title="CTE Contour (×1E-01/°C)">
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-lg text-gray-400 text-center px-8">{error}</div>
            </div>
        </FullscreenChart>
    );

    if (!results) return (
        <FullscreenChart title="CTE Contour (×1E-01/°C)">
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-xl text-gray-600">Preparing chart...</div>
            </div>
        </FullscreenChart>
    );

    return (
        <FullscreenChart title="CTE Contour (×1E-01/°C)" watermark={false}>
            <div className="w-full" style={{ height: 'calc(100vh - 200px)' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={results.chartData} margin={{ top: 10, right: 30, bottom: 40, left: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis
                            dataKey="eta"
                            type="number"
                            domain={[0.9, 1.0]}
                            tickFormatter={(v) => v.toFixed(2)}
                            tickCount={11}
                        >
                            <Label value="This is η" offset={-10} position="insideBottom" />
                        </XAxis>
                        <YAxis
                            type="number"
                            domain={results.yDomain}
                            tickFormatter={(v) => v.toFixed(0)}
                        >
                            <Label value="This is Φ (%)" angle={-90} position="insideLeft" offset={-10} />
                        </YAxis>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={renderLegend} />
                        {CTE_LEVELS.map(cte => (
                            <Line
                                key={cte}
                                type="monotone"
                                dataKey={`cte_${cte}`}
                                stroke={CONTOUR_COLORS[cte]}
                                strokeWidth={2}
                                dot={false}
                                name={`${cte} ×10⁻⁶/°C`}
                                isAnimationActive={false}
                                connectNulls={true}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
                {renderLegend()}
            </div>
        </FullscreenChart>
    );
};

export default CTEContour;