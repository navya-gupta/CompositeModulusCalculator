import { useEffect, useState } from 'react';
import {
    CartesianGrid, Legend, Line, LineChart,
    ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import FullscreenChart from '../components/shared/FullScreenChart';
import { useChartParams } from '../contexts/ChartParamsContext';
import { modulusVsVolumeFractionFormatter } from '../utils/dataFormatterForExcel';
import { diffScheme } from '../utils/matlabFunctions/diffScheme';
import { odeRK45 } from '../utils/matlabFunctions/odeRK45';

const YoungModulusCurve2 = () => {
    // ── Live params from sidebar form ──────────────────────────────────────
    const { em, nm, eb, nb, eta, phi_rpl } = useChartParams();

    const [results, setResults] = useState(null);
    const [computing, setComputing] = useState(false);
    const [error, setError] = useState(null);

    // Re-run whenever any param changes
    useEffect(() => {
        // Validate all required values
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

                const solution = odeRK45(
                    odefn,
                    [0, phi_rpl],
                    [em, nm],
                    { dt: 0.001, tol: 1e-8 }
                );

                const step = 10;
                const PHI = solution.t.filter((_, i) => i % step === 0);
                const E = solution.y.filter((_, i) => i % step === 0).map(y => y[0]);

                const chartData = PHI.map((phi, i) => ({
                    phi: Math.round(phi * 1000) / 1000,
                    E: Math.round(E[i] * 100) / 100,
                }));

                const Evalues = chartData.map(d => d.E);
                const minE = Math.min(...Evalues);
                const maxE = Math.max(...Evalues);

                setResults({
                    chartData,
                    yDomain: [Math.floor(minE * 0.95), Math.ceil(maxE * 1.05)],
                });
            } catch (err) {
                console.error('Computation error:', err);
                setError(err.message || 'Failed to compute properties');
            } finally {
                setComputing(false);
            }
        }, 100); // small debounce so fast typing doesn't thrash

        return () => clearTimeout(timer);
    }, [em, nm, eb, nb, eta, phi_rpl]);

    // ── Custom Tooltip ─────────────────────────────────────────────────────
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                    <p className="font-semibold text-gray-800">
                        Φ: {payload[0].payload.phi.toFixed(3)}
                    </p>
                    <p className="text-red-600">
                        E: {payload[0].value.toFixed(2)} MPa
                    </p>
                </div>
            );
        }
        return null;
    };

    // ── States ─────────────────────────────────────────────────────────────
    if (computing) {
        return (
            <FullscreenChart title="Young Modulus Curve">
                <div className="w-full h-full flex items-center justify-center">
                    <div className="text-xl text-gray-600">Computing properties...</div>
                </div>
            </FullscreenChart>
        );
    }

    if (error) {
        return (
            <FullscreenChart title="Young Modulus Curve">
                <div className="w-full h-full flex items-center justify-center">
                    <div className="text-lg text-gray-400 text-center px-8">{error}</div>
                </div>
            </FullscreenChart>
        );
    }

    if (!results) {
        return (
            <FullscreenChart title="Young Modulus Curve">
                <div className="w-full h-full flex items-center justify-center">
                    <div className="text-xl text-gray-600">Preparing chart...</div>
                </div>
            </FullscreenChart>
        );
    }

    const excelFormattedChartData = modulusVsVolumeFractionFormatter(results.chartData, 'E');

    return (
        <FullscreenChart
            title="Young Modulus Curve"
            watermark={false}
            exportData={excelFormattedChartData}
        >
            <div className="w-full"
                style={{
                    height: 'calc(100vh - 180px)'
                }}
            >
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={results.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis
                            dataKey="phi"
                            type="number"
                            domain={[0, phi_rpl]}
                            tickFormatter={(v) => v.toFixed(2)}
                            label={{ value: 'Φ (Volume Fraction)', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis
                            type="number"
                            domain={results.yDomain}
                            tickFormatter={(v) => v.toFixed(0)}
                            label={{ value: 'E (MPa)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="E"
                            stroke="#ef4444"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            name="Prediction"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </FullscreenChart>
    );
};

export default YoungModulusCurve2;