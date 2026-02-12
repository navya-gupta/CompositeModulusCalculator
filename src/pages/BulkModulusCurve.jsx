import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
import { modulusVsVolumeFractionFormatter } from '../utils/dataFormatterForExcel';
import { diffScheme } from '../utils/matlabFunctions/diffScheme';
import { odeRK45 } from '../utils/matlabFunctions/odeRK45';

const BulkModulusCurve = () => {
    const location = useLocation();

    const [inputData] = useState(location.state?.formData);
    const [results, setResults] = useState(null);
    const [computing, setComputing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!inputData) {
            setError('No input data available');
            return;
        }

        setComputing(true);
        setError(null);

        const timer = setTimeout(() => {
            try {
                const Em = parseFloat(inputData.em);
                const nm = parseFloat(inputData.nm);
                const Eb = parseFloat(inputData.eb);
                const nb = parseFloat(inputData.nb);
                const eta = parseFloat(inputData.eta);
                const PHI_RPL = parseFloat(inputData.phi_rpl || 0.6);

                if (
                    isNaN(Em) ||
                    isNaN(nm) ||
                    isNaN(Eb) ||
                    isNaN(nb) ||
                    isNaN(eta) ||
                    isNaN(PHI_RPL)
                ) {
                    throw new Error('Invalid input values');
                }

                const odefn = (phi, X) =>
                    diffScheme(phi, X, Eb, nb, eta, PHI_RPL);

                const solution = odeRK45(
                    odefn,
                    [0, PHI_RPL],
                    [Em, nm],
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

                const K = E.map(
                    (e, i) => e / (3 * (1 - 2 * Nu[i]))
                );

                // ✅ FLOATING POINT CLEANUP
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
    }, [inputData]);

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
            <FullscreenChart title={'Bulk Modulus Curve'}>
                <div className="w-full h-full flex items-center justify-center">
                    <div className="text-xl text-gray-600">
                        Computing properties...
                    </div>
                </div>
            </FullscreenChart>
        );
    }

    if (error) {
        return (
            <FullscreenChart title={'Bulk Modulus Curve'}>
                <div className="w-full h-full flex items-center justify-center">
                    <div className="text-xl text-red-600">{error}</div>
                </div>
            </FullscreenChart>
        );
    }

    if (!results) {
        return (
            <FullscreenChart title={'Bulk Modulus Curve'}>
                <div className="w-full h-full flex items-center justify-center">
                    <div className="text-xl text-gray-600">
                        Preparing chart...
                    </div>
                </div>
            </FullscreenChart>
        );
    }

    const excelFormattedChartData =
        modulusVsVolumeFractionFormatter(results.chartData, 'K');

    return (
        <FullscreenChart
            title={'Bulk Modulus Curve'}
            watermark={false}
            exportData={excelFormattedChartData}
        >
            <div className="w-full h-full">
                <ResponsiveContainer width="100%" height={700}>
                    <LineChart data={results.chartData}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e0e0e0"
                        />

                        {/* ✅ Clean X-Axis */}
                        <XAxis
                            dataKey="phi"
                            domain={[0, 0.6]}
                            tickFormatter={(value) =>
                                value.toFixed(2)
                            }
                            label={{
                                value: 'Φ (Volume Fraction)',
                                position: 'insideBottom',
                                offset: -5
                            }}
                        />

                        {/* ✅ Auto Scaling Y-Axis */}
                        <YAxis
                            domain={['auto', 'auto']}
                            tickFormatter={(value) =>
                                value.toFixed(0)
                            }
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
