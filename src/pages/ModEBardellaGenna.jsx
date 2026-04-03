/**
 * ModEBardellaGenna.jsx
 *
 * Modulus of Elasticity using Bardella-Genna model.
 * X-axis: Bulk Mod (GPa), Y-axis: Shear Mod (GPa)
 * (matches the Django "ModE" scatter-style plot in the screenshot)
 */
import { useEffect, useState } from 'react';
import {
    CartesianGrid, Label, Line, LineChart,
    ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import FullscreenChart from '../components/shared/FullScreenChart';
import { useChartParams } from '../contexts/ChartParamsContext';
import { computeBardellaGenna } from '../utils/bardellaGennaCalc';

const ModEBardellaGenna = () => {
    const { em, nm, eb, nb, eta, c2r } = useChartParams();

    const [results, setResults] = useState(null);
    const [computing, setComputing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const required = [em, nm, eb, nb, eta, c2r];
        if (required.some(v => isNaN(v) || v === undefined)) {
            setResults(null);
            setError('Fill in all sidebar fields (including particle density and cenosphere diameter) to compute.');
            return;
        }

        setComputing(true);
        setError(null);

        const timer = setTimeout(() => {
            try {
                // r = outer radius = c2r / 2  (diameter → radius)
                const r = c2r / 2;
                const raw = computeBardellaGenna(eta, em, nm, eb, nb, r);

                // Downsample for performance — every 5th point
                const step = 5;
                const chartData = raw
                    .filter((_, i) => i % step === 0)
                    .map(d => ({ ...d }));

                const Kvals = chartData.map(d => d.K).filter(isFinite);
                const Gvals = chartData.map(d => d.G).filter(isFinite);

                setResults({
                    chartData,
                    xDomain: [
                        Math.floor(Math.min(...Kvals) * 0.95 * 10) / 10,
                        Math.ceil(Math.max(...Kvals) * 1.05 * 10) / 10,
                    ],
                    yDomain: [
                        Math.floor(Math.min(...Gvals) * 0.95 * 10) / 10,
                        Math.ceil(Math.max(...Gvals) * 1.05 * 10) / 10,
                    ],
                });
            } catch (err) {
                console.error('BG computation error:', err);
                setError(err.message || 'Failed to compute Bardella-Genna moduli');
            } finally {
                setComputing(false);
            }
        }, 150);

        return () => clearTimeout(timer);
    }, [em, nm, eb, nb, eta, c2r]);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const d = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                    <p className="font-semibold text-gray-800">Φ: {d.phi.toFixed(4)}</p>
                    <p className="text-blue-600">K: {d.K.toFixed(4)} GPa</p>
                    <p className="text-red-600">G: {d.G.toFixed(4)} GPa</p>
                    <p className="text-gray-600">E: {d.E.toFixed(4)} GPa</p>
                </div>
            );
        }
        return null;
    };

    if (computing) return (
        <FullscreenChart title="ModE — Bardella Genna">
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-xl text-gray-600">Computing Bardella-Genna moduli...</div>
            </div>
        </FullscreenChart>
    );

    if (error) return (
        <FullscreenChart title="ModE — Bardella Genna">
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-lg text-gray-400 text-center px-8">{error}</div>
            </div>
        </FullscreenChart>
    );

    if (!results) return (
        <FullscreenChart title="ModE — Bardella Genna">
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-xl text-gray-600">Preparing chart...</div>
            </div>
        </FullscreenChart>
    );

    return (
        <FullscreenChart title="ModE — Bardella Genna" watermark={false}>
            <div className="w-full" style={{ height: 'calc(100vh - 180px)' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={results.chartData} margin={{ top: 10, right: 30, bottom: 40, left: 70 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis
                            dataKey="K"
                            type="number"
                            domain={results.xDomain}
                            tickFormatter={(v) => v.toFixed(2)}
                        >
                            <Label value="Bulk Mod (GPa)" offset={-10} position="insideBottom" />
                        </XAxis>
                        <YAxis
                            type="number"
                            domain={results.yDomain}
                            tickFormatter={(v) => v.toFixed(2)}
                        >
                            <Label value="Shear Mod (GPa)" angle={-90} position="insideLeft" offset={-15} />
                        </YAxis>
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="G"
                            stroke="#ef4444"
                            strokeWidth={2}
                            dot={false}
                            name="Shear Mod (GPa)"
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </FullscreenChart>
    );
};

export default ModEBardellaGenna;