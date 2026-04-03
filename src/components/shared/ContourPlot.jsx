/**
 * ContourPlot.jsx
 *
 * Renders the filled contour chart + overlay line.
 *
 * Visual behaviour (matching Django screenshots):
 *  - Background: filled colour bands across full η × Φ space
 *    (yellow → orange → red gradient, one band per contour level)
 *  - Overlay: a single black line from a different chart type
 *  - X axis: η (0.9 → 1.0)
 *  - Y axis: Φ (%) (0 → 100), mirrored on both sides
 *  - Legend: coloured triangles with level values at the bottom
 */
import { useEffect, useMemo, useState } from 'react';
import {
    Area, AreaChart, CartesianGrid,
    ComposedChart,
    Label, Legend, Line, LineChart,
    ReferenceLine, ResponsiveContainer,
    Tooltip, XAxis, YAxis,
} from 'recharts';
import { useChartParams } from '../../contexts/ChartParamsContext';
import {
    buildContourChartData,
    computeOverlayCurve,
    CONTOUR_CONFIGS,
} from '../../utils/contourDataBuilder';

// ─── Chart type options ───────────────────────────────────────────────────────
import { CHART_OPTIONS } from '../../constants/chartOptions';

// ─── Custom legend ────────────────────────────────────────────────────────────
const ContourLegend = ({ bands }) => (
    <div className="flex items-center justify-center gap-4 flex-wrap mt-1 pb-1">
        {bands.map(b => (
            <span key={b.level} className="flex items-center gap-1 text-xs text-gray-700">
                {/* Triangle marker */}
                <svg width="12" height="10" viewBox="0 0 12 10">
                    <polygon points="6,0 12,10 0,10" fill={b.color} />
                </svg>
                {b.level}
            </span>
        ))}
    </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const ContourPlot = ({ contourType, overlayType }) => {
    const params = useChartParams();

    const [contourData, setContourData] = useState(null);
    const [overlayData, setOverlayData] = useState(null);
    const [computing, setComputing] = useState(false);
    const [error, setError] = useState(null);

    // Validate required params
    const paramsReady = useMemo(() => {
        const base = [params.em, params.nm, params.eb, params.nb,
        params.alpm, params.alpf, params.epsm, params.epsf,
        params.dm, params.wpdf];
        return base.every(v => v !== undefined && !isNaN(v));
    }, [params]);

    useEffect(() => {
        if (!paramsReady) {
            setError('Fill in all sidebar fields to render the contour.');
            return;
        }
        if (!contourType) return;

        setComputing(true);
        setError(null);

        const timer = setTimeout(() => {
            try {
                // Build filled contour bands
                const built = buildContourChartData(contourType, params);
                setContourData(built);

                // Build overlay line (use current slider variant value)
                if (overlayType && overlayType !== contourType) {
                    const variantValue = overlayType === 'cte' ? params.cteVariant
                        : overlayType === 'density' ? params.rhoVariant
                            : overlayType === 'dielectric' ? params.epsVariant
                                : null;
                    if (variantValue !== null) {
                        const ol = computeOverlayCurve(overlayType, variantValue, params);
                        setOverlayData(ol);
                    } else {
                        setOverlayData(null);
                    }
                } else {
                    setOverlayData(null);
                }
            } catch (err) {
                console.error('Contour plot error:', err);
                setError(err.message || 'Failed to render contour');
            } finally {
                setComputing(false);
            }
        }, 200);

        return () => clearTimeout(timer);
    }, [contourType, overlayType, params, paramsReady]);

    // ── Merge overlay into contour data ───────────────────────────────────────
    const mergedData = useMemo(() => {
        if (!contourData) return null;
        if (!overlayData || !overlayData.length) return contourData.merged;

        // Index overlay by eta for fast lookup
        const olMap = new Map(overlayData.map(d => [d.eta, d.phi]));

        return contourData.merged.map(row => ({
            ...row,
            _overlay: olMap.has(row.eta)
                ? Math.max(0, Math.min(100, olMap.get(row.eta)))
                : undefined,
        }));
    }, [contourData, overlayData]);

    // ── States ────────────────────────────────────────────────────────────────
    if (computing) return (
        <div className="flex items-center justify-center h-full text-gray-500 text-lg">
            Computing contour...
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center h-full text-gray-400 text-base text-center px-8">
            {error}
        </div>
    );

    if (!contourData || !mergedData) return (
        <div className="flex items-center justify-center h-full text-gray-400 text-base text-center px-8">
            Select a contour type and click Plot Graph.
        </div>
    );

    const config = CONTOUR_CONFIGS[contourType];
    const { bands } = contourData;

    // Determine overlay label for legend
    const overlayLabel = overlayType
        ? CHART_OPTIONS.find(o => o.value === overlayType)?.label
        : null;

    return (
        <div className="w-full flex flex-col" style={{ height: 'calc(100vh - 260px)', minHeight: 400 }}>
            <h2 className="text-center font-semibold text-gray-800 text-base mb-1">
                {config?.label} (×1E-01/°C)
            </h2>
            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={mergedData}
                        margin={{ top: 10, right: 60, bottom: 40, left: 60 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                        <XAxis
                            dataKey="eta"
                            type="number"
                            domain={[0.9, 1.0]}
                            tickFormatter={v => v.toFixed(2)}
                            tickCount={11}
                            tick={{ fontSize: 11 }}
                        >
                            <Label value="This is η" offset={-10} position="insideBottom" style={{ fontSize: 12 }} />
                        </XAxis>
                        {/* Left Y axis */}
                        <YAxis
                            yAxisId="left"
                            domain={[0, 100]}
                            tickFormatter={v => v.toFixed(0)}
                            tick={{ fontSize: 11 }}
                        >
                            <Label value="This is Φ (%)" angle={-90} position="insideLeft" offset={-10} style={{ fontSize: 12 }} />
                        </YAxis>
                        {/* Right Y axis (mirror) */}
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            domain={[0, 100]}
                            tickFormatter={v => v.toFixed(0)}
                            tick={{ fontSize: 11 }}
                        >
                            <Label value="This is Φ (%)" angle={90} position="insideRight" offset={10} style={{ fontSize: 12 }} />
                        </YAxis>

                        <Tooltip
                            formatter={(val, name) => {
                                if (name === '_overlay') return [`${Number(val).toFixed(1)}%`, overlayLabel || 'Overlay'];
                                const lvl = name.replace('level_', '');
                                return [`${Number(val).toFixed(1)}%`, `${lvl} ${config?.unit || ''}`];
                            }}
                            labelFormatter={v => `η = ${Number(v).toFixed(4)}`}
                        />

                        {/* ── Filled contour bands ── */}
                        {bands.map((band, i) => (
                            <Area
                                key={band.level}
                                yAxisId="left"
                                type="monotone"
                                dataKey={band.dataKey}
                                stroke="none"
                                fill={band.color}
                                fillOpacity={1}
                                // Stack by using previous band as baseline
                                stackId={i === 0 ? undefined : 'contour'}
                                isAnimationActive={false}
                                dot={false}
                                activeDot={false}
                                legendType="none"
                                connectNulls
                            />
                        ))}

                        {/* ── Overlay black line ── */}
                        {overlayData && overlayData.length > 0 && (
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="_overlay"
                                stroke="#000000"
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={false}
                                name={overlayLabel || 'Overlay'}
                                isAnimationActive={false}
                                connectNulls
                            />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <ContourLegend bands={bands} />
        </div>
    );
};

export default ContourPlot;