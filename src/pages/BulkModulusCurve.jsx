import { useEffect, useState } from 'react';
// REMOVED: useLocation — no longer reading from route state
// ADDED: useChartParams to get live values from sidebar form
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import FullscreenChart from '../components/shared/FullScreenChart';
import { useChartParams } from '../contexts/ChartParamsContext';
import { modulusVsVolumeFractionFormatter } from '../utils/dataFormatterForExcel';
import { diffScheme } from '../utils/matlabFunctions/diffScheme';
import { odeRK45 } from '../utils/matlabFunctions/odeRK45';

const BulkModulusCurve = () => {
    // CHANGED: was `const location = useLocation()` + `location.state?.formData`
    const { em, nm, eb, nb, eta, phi_rpl } = useChartParams();

    const [results, setResults] = useState(null);
    const [computing, setComputing] = useState(false);
    const [error, setError] = useState(null);

    // CHANGED: dependency array was [inputData], now tracks all live params
    useEffect(() => {
        // CHANGED: was checking `!inputData`; now validates each param from context
        if ([em, nm, eb, nb, eta, phi_rpl].some(v => isNaN(v) || v === undefined)) {
            setResults(null);
            setError('Fill in all sidebar fields (including particle density) to compute.');
            return;
        }

        setComputing(true);
        setError(null);

        const timer = setTimeout(() => {
            try {
                // CHANGED: was parseFloat(inputData.em) etc.; now using context values directly
                const odefn = (phi, X) => diffScheme(phi, X, eb, nb, eta, phi_rpl);

                const solution = odeRK45(
                    odefn,
                    [0, phi_rpl], // CHANGED: was hardcoded PHI_RPL from inputData
                    [em, nm],
                    { dt: 0.001, tol: 1e-8 }
                );

                const step = 10;
                const PHI = solution.t.filter((_, i) => i % step === 0);
                const E = solution.y
                    .filter((_, i) => i % step === 0)
                    .map((y) => y[0]);
                const Nu = solution.y
                    .filter((_, i) => i % step === 0)
                    .map((y) => y[1]);

                const K = E.map((e, i) => e / (3 * (1 - 2 * Nu[i])));

                const chartData = PHI.map((phi, i) => ({
                    phi: Number(phi.toFixed(3)),
                    K: Number(K[i].toFixed(4))
                }));

                setResults({
                    chartData,
                    stats: {
                        K: {
                            min: Math.min(...K),
                            max: Math.max(...K)
                        }
                    }
                });
            } catch (err) {
                console.error('Computation error:', err);
                setError(err.message || 'Failed to compute properties');
            } finally {
                setComputing(false);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [em, nm, eb, nb, eta, phi_rpl]); // CHANGED: was [inputData]

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                    <p className="font-semibold text-gray-800">
                        Φ: {payload[0].payload.phi.toFixed(3)}
                    </p>
                    <p className="text-red-600">
                        K: {payload[0].value.toFixed(2)} MPa
                    </p>
                </div>
            );
        }
        return null;
    };

    if (computing) {
        return (
            <FullscreenChart title="Bulk Modulus Curve">
                <div className="w-full h-full flex items-center justify-center">
                    <div className="text-xl text-gray-600">Computing properties...</div>
                </div>
            </FullscreenChart>
        );
    }

    if (error) {
        return (
            <FullscreenChart title="Bulk Modulus Curve">
                <div className="w-full h-full flex items-center justify-center">
                    <div className="text-lg text-gray-400 text-center px-8">{error}</div>
                </div>
            </FullscreenChart>
        );
    }

    if (!results) {
        return (
            <FullscreenChart title="Bulk Modulus Curve">
                <div className="w-full h-full flex items-center justify-center">
                    <div className="text-xl text-gray-600">Preparing chart...</div>
                </div>
            </FullscreenChart>
        );
    }

    const excelFormattedChartData = modulusVsVolumeFractionFormatter(results.chartData, 'K');

    return (
        <FullscreenChart
            title="Bulk Modulus Curve"
            watermark={false}
            exportData={excelFormattedChartData}
        >
            <div className="w-full h-full">
                <ResponsiveContainer width="100%" height={700}>
                    <LineChart data={results.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />

                        <XAxis
                            dataKey="phi"
                            type="number"
                            domain={[0, phi_rpl]} // CHANGED: was hardcoded [0, 0.6]
                            tickFormatter={(value) => value.toFixed(2)}
                            label={{
                                value: 'Φ (Volume Fraction)',
                                position: 'insideBottom',
                                offset: -5
                            }}
                        />

                        <YAxis
                            domain={['auto', 'auto']}
                            tickFormatter={(value) => value.toFixed(0)}
                            label={{
                                value: 'K (MPa)',
                                angle: -90,
                                position: 'insideLeft'
                            }}
                        />

                        <Tooltip content={<CustomTooltip />} />
                        <Legend />

                        <Line
                            type="monotone"
                            dataKey="K"
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

export default BulkModulusCurve;