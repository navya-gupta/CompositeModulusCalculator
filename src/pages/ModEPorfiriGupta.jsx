/**
 * ModEPorfiriGupta.jsx
 *
 * Modulus of Elasticity curve using the Porfiri-Gupta differential scheme.
 * X-axis: Φ (volume fraction), Y-axis: Modulus (GPa)
 *
 * Reuses existing diffScheme + odeRK45 utilities, same as YoungModulusCurve2
 * but converts MPa → GPa for display.
 */
import { useEffect, useState } from 'react';
import {
    CartesianGrid, Label, Line, LineChart,
    ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import FullscreenChart from '../components/shared/FullScreenChart';
import { useChartParams } from '../contexts/ChartParamsContext';
import { diffScheme } from '../utils/matlabFunctions/diffScheme';
import { odeRK45 } from '../utils/matlabFunctions/odeRK45';

const ModEPorfiriGupta = () => {
    const { em, nm, eb, nb, eta, phi_rpl } = useChartParams();

    const [results, setResults] = useState(null);
    const [computing, setComputing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if ([em, nm, eb, nb, eta, phi_rpl].some(v => isNaN(v) || v === undefined)) {
            setResults(null);
            setError('Fill in all sidebar fields (including particle density) to compute.');
            return;
        }

        setComputing(true);
        setError(null);

        const timer = setTimeout(() => {
            try {
                const odefn = (phi, X) => diffScheme(phi, X, eb, nb, eta, phi_rpl);
                const solution = odeRK45(odefn, [0, phi_rpl], [em, nm], { dt: 0.001, tol: 1e-8 });

                const step = 10;
                const PHI = solution.t.filter((_, i) => i % step === 0);
                const E_MPa = solution.y.filter((_, i) => i % step === 0).map(y => y[0]);

                const chartData = PHI.map((phi, i) => ({
                    phi: Math.round(phi * 1000) / 1000,
                    // Convert MPa → GPa for display (matches Django chart which shows GPa)
                    E: Math.round((E_MPa[i] / 1000) * 1000) / 1000,
                }));

                const Evals = chartData.map(d => d.E);
                const minE = Math.min(...Evals);
                const maxE = Math.max(...Evals);

                setResults({
                    chartData,
                    yDomain: [
                        Math.floor(minE * 0.95 * 10) / 10,
                        Math.ceil(maxE * 1.05 * 10) / 10,
                    ],
                });
            } catch (err) {
                console.error('ModE PG computation error:', err);
                setError(err.message || 'Failed to compute modulus');
            } finally {
                setComputing(false);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [em, nm, eb, nb, eta, phi_rpl]);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                    <p className="font-semibold text-gray-800">Φ: {payload[0].payload.phi.toFixed(3)}</p>
                    <p className="text-red-600">E: {payload[0].value.toFixed(3)} GPa</p>
                </div>
            );
        }
        return null;
    };

    if (computing) return (
        <FullscreenChart title="ModE — Porfiri Gupta">
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-xl text-gray-600">Computing modulus...</div>
            </div>
        </FullscreenChart>
    );

    if (error) return (
        <FullscreenChart title="ModE — Porfiri Gupta">
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-lg text-gray-400 text-center px-8">{error}</div>
            </div>
        </FullscreenChart>
    );

    if (!results) return (
        <FullscreenChart title="ModE — Porfiri Gupta">
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-xl text-gray-600">Preparing chart...</div>
            </div>
        </FullscreenChart>
    );

    return (
        <FullscreenChart title="ModE — Porfiri Gupta" watermark={false}>
            <div className="w-full" style={{ height: 'calc(100vh - 180px)' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={results.chartData} margin={{ top: 10, right: 30, bottom: 40, left: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis
                            dataKey="phi"
                            type="number"
                            domain={[0, phi_rpl]}
                            tickFormatter={(v) => v.toFixed(2)}
                        >
                            <Label value="Φ" offset={-10} position="insideBottom" />
                        </XAxis>
                        <YAxis
                            type="number"
                            domain={results.yDomain}
                            tickFormatter={(v) => v.toFixed(2)}
                        >
                            <Label value="Modulus (GPa)" angle={-90} position="insideLeft" offset={-10} />
                        </YAxis>
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="E"
                            stroke="#ef4444"
                            strokeWidth={2}
                            dot={false}
                            name="E (GPa)"
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </FullscreenChart>
    );
};

export default ModEPorfiriGupta;