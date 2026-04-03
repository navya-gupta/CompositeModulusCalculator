/**
 * DielectricCurve.jsx
 *
 * Dielectric Constant chart: Φ (%) vs η
 * X-axis: η (0.9 → 1), Y-axis: Φ (%)
 * Slider: target dielectric constant (epsVariant)
 */
import { useEffect, useState } from 'react';
import {
    CartesianGrid, Label, Line, LineChart,
    ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import FullscreenChart from '../components/shared/FullScreenChart';
import { useChartParams } from '../contexts/ChartParamsContext';
import { computeDielectric } from '../utils/dielectricCalc';

const DielectricCurve = () => {
    const { epsm, epsf, epsVariant } = useChartParams();

    const [results, setResults] = useState(null);
    const [computing, setComputing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const required = [epsm, epsf, epsVariant];
        if (required.some(v => isNaN(v) || v === undefined)) {
            setResults(null);
            setError('Fill in matrix dielectric constant, filler dielectric constant, and target value to compute.');
            return;
        }

        setComputing(true);
        setError(null);

        const timer = setTimeout(() => {
            try {
                const data = computeDielectric(epsVariant, epsm, epsf);

                const phis = data.map(d => d.phi).filter(isFinite);
                const minPhi = Math.min(...phis);
                const maxPhi = Math.max(...phis);

                setResults({
                    chartData: data,
                    yDomain: [
                        Math.floor(Math.max(minPhi * 0.95, 0)),
                        Math.ceil(maxPhi * 1.05),
                    ],
                });
            } catch (err) {
                console.error('Dielectric computation error:', err);
                setError(err.message || 'Failed to compute dielectric curve');
            } finally {
                setComputing(false);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [epsm, epsf, epsVariant]);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                    <p className="font-semibold text-gray-800">η: {payload[0].payload.eta.toFixed(4)}</p>
                    <p className="text-red-600">Φ: {payload[0].value.toFixed(2)}%</p>
                </div>
            );
        }
        return null;
    };

    if (computing) return (
        <FullscreenChart title="Dielectric Constant Curve">
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-xl text-gray-600">Computing dielectric curve...</div>
            </div>
        </FullscreenChart>
    );

    if (error) return (
        <FullscreenChart title="Dielectric Constant Curve">
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-lg text-gray-400 text-center px-8">{error}</div>
            </div>
        </FullscreenChart>
    );

    if (!results) return (
        <FullscreenChart title="Dielectric Constant Curve">
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-xl text-gray-600">Preparing chart...</div>
            </div>
        </FullscreenChart>
    );

    return (
        <FullscreenChart
            title={`Dielectric Constant Curve  —  target ε = ${epsVariant.toFixed(2)}`}
            watermark={false}
        >
            <div className="w-full" style={{ height: 'calc(100vh - 180px)' }}>
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
                        <Line
                            type="monotone"
                            dataKey="phi"
                            stroke="#ef4444"
                            strokeWidth={2}
                            dot={false}
                            name="Φ (%)"
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </FullscreenChart>
    );
};

export default DielectricCurve;