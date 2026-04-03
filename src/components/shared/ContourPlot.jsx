/**
 * ContourPlot.jsx
 *
 * Renders the filled contour chart + black overlay line.
 *
 * Handles two axis groups:
 *   Group A (CTE, Density, Dielectric, CTE Contour):
 *     X = η (0.9→1.0),  Y = Φ% (0→100),  mirrored Y on both sides
 *
 *   Group B (MEPG, MEBG):
 *     X = Φ (0→0.63),  Y = Modulus (GPa)
 *
 * The overlay line can be from any chart type — its xKey must match
 * the contour's xKey, otherwise it's silently hidden.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Area, CartesianGrid, ComposedChart,
    Label, Line, ResponsiveContainer,
    Tooltip, XAxis, YAxis,
} from 'recharts';
import { useChartParams } from '../../contexts/ChartParamsContext';
import {
    buildContourDataset,
    buildOverlayCurve,
    CONTOUR_CHART_OPTIONS,
    getAxisGroup,
} from '../../utils/contourDataBuilder';

// ─── Colour triangle legend ───────────────────────────────────────────────────
const BandLegend = ({ bands }) => (
    <div className="flex items-center justify-center gap-3 flex-wrap pt-2 pb-1">
        {bands.map(b => (
            <span key={b.variant} className="flex items-center gap-1 text-xs text-gray-700">
                <svg width="11" height="9" viewBox="0 0 11 9">
                    <polygon points="5.5,0 11,9 0,9" fill={b.color} />
                </svg>
                {typeof b.variant === 'number' && b.variant < 1
                    ? b.variant.toFixed(2)
                    : b.variant}
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

    // Validate all required params are present
    const paramsReady = useMemo(() => {
        const required = [
            params.em, params.nm, params.eb, params.nb,
            params.alpm, params.alpf, params.epsm, params.epsf,
            params.dm, params.wpdf, params.phi_rpl,
        ];
        return required.every(v => v !== undefined && !isNaN(v));
    }, [params]);

    useEffect(() => {
        if (!contourType) return;

        if (!paramsReady) {
            setError('Fill in all sidebar fields to render the contour.');
            return;
        }

        setComputing(true);
        setError(null);

        // Use setTimeout so the UI updates before the heavy computation
        const timer = setTimeout(() => {
            try {
                // ── Build contour bands ──────────────────────────────────────
                const dataset = buildContourDataset(contourType, params);
                setContourData(dataset);

                // ── Build overlay line ───────────────────────────────────────
                // Only overlay if xKey matches (both in same axis group)
                if (overlayType && getAxisGroup(overlayType) === dataset.axisGroup) {
                    const overlayVariant =
                        overlayType === 'cte' || overlayType === 'cte_contour' ? params.cteVariant
                            : overlayType === 'density' ? params.rhoVariant
                                : overlayType === 'dielectric' ? params.epsVariant
                                    : overlayType === 'mepg' ? params.eta          // sidebar η
                                        : overlayType === 'mebg' ? params.eta
                                            : null;

                    if (overlayVariant !== null && overlayVariant !== undefined && !isNaN(overlayVariant)) {
                        const ol = buildOverlayCurve(overlayType, overlayVariant, params);
                        setOverlayData(ol);
                    } else {
                        setOverlayData(null);
                    }
                } else {
                    setOverlayData(null);
                }
            } catch (err) {
                console.error('ContourPlot error:', err);
                setError(err.message || 'Failed to render contour');
            } finally {
                setComputing(false);
            }
        }, 50);

        return () => clearTimeout(timer);
    }, [contourType, overlayType, params, paramsReady]);

    // ── Merge overlay points into the contour merged array ────────────────────
    const mergedWithOverlay = useMemo(() => {
        if (!contourData) return null;
        if (!overlayData || overlayData.length === 0) return contourData.merged;

        const xKey = contourData.xKey;
        const olMap = new Map(overlayData.map(d => [d[xKey], d._overlay]));

        return contourData.merged.map(row => ({
            ...row,
            _overlay: olMap.get(row[xKey]) ?? undefined,
        }));
    }, [contourData, overlayData]);

    // ── Loading / error states ────────────────────────────────────────────────
    if (computing) return (
        <div className="flex items-center justify-center h-64 text-gray-500">
            Computing contour — this may take a moment…
        </div>
    );
    if (error) return (
        <div className="flex items-center justify-center h-64 text-gray-400 text-sm text-center px-8">
            {error}
        </div>
    );
    if (!contourData || !mergedWithOverlay) return (
        <div className="flex items-center justify-center h-64 text-gray-400 text-sm text-center px-8">
            Select a Contours Graph and click <strong className="mx-1">Plot Graph</strong> to render.
        </div>
    );

    const { bands, xKey, xLabel, yLabel, xDomain, yDomain, axisGroup } = contourData;
    const isEtaGroup = axisGroup === 'eta';

    // Overlay label for tooltip
    const overlayLabel = overlayType
        ? CONTOUR_CHART_OPTIONS.find(o => o.value === overlayType)?.label
        : 'Overlay';

    // Chart title
    const contourLabel = CONTOUR_CHART_OPTIONS.find(o => o.value === contourType)?.label ?? '';

    return (
        <div className="w-full flex flex-col">
            {/* Title */}
            <h2 className="text-center font-semibold text-gray-800 text-sm mb-2">
                {contourLabel}
            </h2>

            {/* Chart */}
            <div style={{ height: 'calc(100vh - 320px)', minHeight: 380 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={mergedWithOverlay}
                        margin={{ top: 10, right: isEtaGroup ? 60 : 30, bottom: 40, left: 60 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />

                        {/* X axis */}
                        <XAxis
                            dataKey={xKey}
                            type="number"
                            domain={xDomain}
                            tickFormatter={v =>
                                isEtaGroup ? Number(v).toFixed(2) : Number(v).toFixed(2)
                            }
                            tickCount={isEtaGroup ? 11 : 8}
                            tick={{ fontSize: 11 }}
                        >
                            <Label value={xLabel} offset={-10} position="insideBottom" style={{ fontSize: 12 }} />
                        </XAxis>

                        {/* Left Y axis */}
                        <YAxis
                            yAxisId="left"
                            domain={yDomain ?? ['auto', 'auto']}
                            tickFormatter={v => isEtaGroup ? v.toFixed(0) : v.toFixed(2)}
                            tick={{ fontSize: 11 }}
                        >
                            <Label value={yLabel} angle={-90} position="insideLeft" offset={-10} style={{ fontSize: 12 }} />
                        </YAxis>

                        {/* Right Y axis — only for eta-group (mirror, like Django) */}
                        {isEtaGroup && (
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                domain={[0, 100]}
                                tickFormatter={v => v.toFixed(0)}
                                tick={{ fontSize: 11 }}
                            >
                                <Label value={yLabel} angle={90} position="insideRight" offset={10} style={{ fontSize: 12 }} />
                            </YAxis>
                        )}

                        <Tooltip
                            labelFormatter={v =>
                                isEtaGroup ? `η = ${Number(v).toFixed(4)}` : `Φ = ${Number(v).toFixed(3)}`
                            }
                            formatter={(val, name) => {
                                if (name === '_overlay') return [Number(val).toFixed(3), overlayLabel];
                                const idx = parseInt(name.replace('band_', ''), 10);
                                const variant = bands[idx]?.variant ?? name;
                                return [Number(val).toFixed(2), String(variant)];
                            }}
                        />

                        {/* ── Filled bands ── */}
                        {bands.map((band, i) => (
                            <Area
                                key={band.dataKey}
                                yAxisId="left"
                                type="monotone"
                                dataKey={band.dataKey}
                                stroke="none"
                                fill={band.color}
                                fillOpacity={1}
                                // All areas share the same stackId so they stack from 0 upward
                                stackId="contour"
                                isAnimationActive={false}
                                dot={false}
                                activeDot={false}
                                legendType="none"
                                connectNulls
                            />
                        ))}

                        {/* ── Black overlay line ── */}
                        {overlayData && overlayData.length > 0 && (
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="_overlay"
                                stroke="#000000"
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={false}
                                name={overlayLabel}
                                isAnimationActive={false}
                                connectNulls
                            />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Triangle legend */}
            <BandLegend bands={bands} />
        </div>
    );
};

export default ContourPlot;