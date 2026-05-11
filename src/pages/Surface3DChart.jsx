/**
 * Surface3DChart.jsx
 *
 * Changes in this version:
 *  - plotW: was `w - 288 - 130`, now `w - 288 - 20`  → chart fills nearly full remaining width
 *  - plotH: was `h - 200`, now `h - 180`              → slightly taller
 *  - right margin: was 110, now 160                   → colorbars have room, plot itself wider
 *  - all axis title fonts: 11 → 14
 *  - all tick fonts:       9  → 11
 *  - colorbar title fonts: 11 → 12
 *  - annotation fonts:     13 → 16
 */
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import Plot from 'react-plotly.js';
import { useChartParams } from '../contexts/ChartParamsContext';
import { buildSurface3DData } from '../utils/surface3DCalc';

const CS_CTE = [
    [0, '#ffffb2'],
    [0.15, '#d9f0a3'],
    [0.30, '#addd8e'],
    [0.45, '#f03b20'],
    [0.65, '#bd0026'],
    [0.82, '#800026'],
    [1.0, '#4d0015'],
];
const CS_DENSITY = [
    [0, '#ffffd4'],
    [0.3, '#fee391'],
    [0.6, '#fec44f'],
    [0.8, '#fe9929'],
    [1.0, '#d95f0e'],
];
const CS_DIELECTRIC = [
    [0, '#fdd49e'],
    [0.3, '#fc8d59'],
    [0.6, '#ef6548'],
    [0.8, '#d7301f'],
    [1.0, '#7f0000'],
];

function matMinMax(mat) {
    let min = Infinity, max = -Infinity;
    for (const row of mat)
        for (const v of row) {
            if (!isFinite(v)) continue;
            if (v < min) min = v;
            if (v > max) max = v;
        }
    return { min, max };
}

function buildCSVRows(phiAxis, rhoAxis, cte, density, dielectric) {
    const rows = ['Phi,Rho_particle_kg_m3,CTE_x1e6_per_C,Density_kg_m3,Dielectric'];
    for (let j = 0; j < rhoAxis.length; j++)
        for (let i = 0; i < phiAxis.length; i++)
            rows.push([
                phiAxis[i].toFixed(4), rhoAxis[j].toFixed(1),
                isFinite(cte[j][i]) ? cte[j][i].toFixed(4) : '',
                isFinite(density[j][i]) ? density[j][i].toFixed(2) : '',
                isFinite(dielectric[j][i]) ? dielectric[j][i].toFixed(4) : '',
            ].join(','));
    return rows.join('\n');
}

function useWindowSize() {
    const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
    useEffect(() => {
        const fn = () => setSize({ w: window.innerWidth, h: window.innerHeight });
        window.addEventListener('resize', fn);
        return () => window.removeEventListener('resize', fn);
    }, []);
    return size;
}

const Surface3DChart = forwardRef((_props, ref) => {
    const params = useChartParams();
    const plotRef = useRef(null);
    const { w, h } = useWindowSize();

    const [surfaces, setSurfaces] = useState(null);
    const [computing, setComputing] = useState(false);

    // ── KEY FIX: was subtracting 418px total, now only 308px ─────────────────
    // w - 288 (sidebar) - 20 (small buffer) = nearly full remaining width
    // The right margin of 160px is INSIDE Plotly's own layout, so the
    // plot area itself is plotW minus 160px, which is still large.
    const plotW = Math.max(w - 288 - 20, 500);
    const plotH = Math.max(h - 180, 500);

    const paramsReady = useMemo(() => {
        const needed = [params.em, params.nm, params.eb, params.nb,
        params.alpm, params.alpf, params.epsm, params.epsf,
        params.dm, params.wpdf, params.glassDensity];
        return needed.every(v => v !== undefined && !isNaN(v));
    }, [params]);

    useEffect(() => {
        const t = setTimeout(() => {
            if (!paramsReady) { setSurfaces(null); return; }
            setComputing(true);
            try { setSurfaces(buildSurface3DData(params)); }
            catch (e) { console.error('3D error:', e); setSurfaces(null); }
            finally { setComputing(false); }
        }, 120);
        return () => clearTimeout(t);
    }, [params, paramsReady]);

    useImperativeHandle(ref, () => ({
        downloadImage: () => {
            if (!plotRef.current?.el) return;
            window.Plotly?.downloadImage(plotRef.current.el, {
                format: 'png', width: 1600, height: 1000, filename: '3D_surface_chart',
            });
        },
        downloadCSV: () => {
            if (!surfaces) return;
            const csv = buildCSVRows(surfaces.phiAxis, surfaces.rhoAxis, surfaces.cte, surfaces.density, surfaces.dielectric);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            Object.assign(document.createElement('a'), { href: url, download: '3D_surface_data.csv' }).click();
            URL.revokeObjectURL(url);
        },
    }), [surfaces]);

    if (!paramsReady) return (
        <div style={{ width: plotW, height: plotH }}
            className="flex items-center justify-center text-gray-400 text-sm text-center p-6">
            Fill in all sidebar material properties to render the 3D chart.
        </div>
    );
    if (computing) return (
        <div style={{ width: plotW, height: plotH }}
            className="flex items-center justify-center text-gray-500 text-sm">
            Computing surfaces…
        </div>
    );
    if (!surfaces) return (
        <div style={{ width: plotW, height: plotH }}
            className="flex items-center justify-center text-gray-400 text-sm text-center p-6">
            Could not compute surface data. Check sidebar values.
        </div>
    );

    const { phiAxis, rhoAxis, cte, density, dielectric, cteZ, densityZ, dielectricZ } = surfaces;

    const cteR = matMinMax(cte);
    const denR = matMinMax(density);
    const epsR = matMinMax(dielectric);
    const cteZR = matMinMax(cteZ);
    const denZR = matMinMax(densityZ);
    const epsZR = matMinMax(dielectricZ);

    const phiMid = phiAxis[Math.floor(phiAxis.length * 0.7)];
    const rhoMax = rhoAxis[rhoAxis.length - 1];

    const traces = [
        {
            type: 'surface', name: 'CTE',
            x: phiAxis, y: rhoAxis, z: cteZ,
            colorscale: CS_CTE, cmin: cteR.min, cmax: cteR.max,
            surfacecolor: cte, cauto: false, opacity: 0.95,
            showscale: true,
            colorbar: {
                title: { text: 'CTE ×10⁻⁶/°C', font: { size: 12 } },
                thickness: 16, len: 0.28, y: 0.10,
                tickfont: { size: 11 }, tickformat: '.1f',
            },
            hovertemplate: 'Φ: %{x:.3f}<br>ρ_p: %{y:.0f} kg/m³<br>CTE: %{surfacecolor:.2f} ×10⁻⁶/°C<extra>CTE</extra>',
        },
        {
            type: 'surface', name: 'Density',
            x: phiAxis, y: rhoAxis, z: densityZ,
            colorscale: CS_DENSITY, cmin: denR.min, cmax: denR.max,
            surfacecolor: density, cauto: false, opacity: 0.95,
            showscale: true,
            colorbar: {
                title: { text: 'Density kg/m³', font: { size: 12 } },
                thickness: 16, len: 0.28, y: 0.50,
                tickfont: { size: 11 }, tickformat: '.0f',
            },
            hovertemplate: 'Φ: %{x:.3f}<br>ρ_p: %{y:.0f} kg/m³<br>ρ_c: %{surfacecolor:.1f} kg/m³<extra>Density</extra>',
        },
        {
            type: 'surface', name: 'Dielectric',
            x: phiAxis, y: rhoAxis, z: dielectricZ,
            colorscale: CS_DIELECTRIC, cmin: epsR.min, cmax: epsR.max,
            surfacecolor: dielectric, cauto: false, opacity: 0.95,
            showscale: true,
            colorbar: {
                title: { text: 'Dielectric ε', font: { size: 12 } },
                thickness: 16, len: 0.28, y: 0.90,
                tickfont: { size: 11 }, tickformat: '.3f',
            },
            hovertemplate: 'Φ: %{x:.3f}<br>ρ_p: %{y:.0f} kg/m³<br>ε: %{surfacecolor:.4f}<extra>Dielectric</extra>',
        },
    ];

    const annotations3d = [
        {
            x: phiMid, y: rhoMax, z: (cteZR.min + cteZR.max) / 2,
            text: '<b>CTE</b>', showarrow: false,
            font: { size: 16, color: '#111', family: 'Arial Black, Arial' },
        },
        {
            x: phiMid, y: rhoMax, z: (denZR.min + denZR.max) / 2,
            text: '<b>Density</b>', showarrow: false,
            font: { size: 16, color: '#111', family: 'Arial Black, Arial' },
        },
        {
            x: phiMid, y: rhoMax, z: (epsZR.min + epsZR.max) / 2,
            text: '<b>Dielectric<br>constant</b>', showarrow: false,
            font: { size: 16, color: '#111', family: 'Arial Black, Arial' },
        },
    ];

    const layout = {
        width: plotW,
        height: plotH,
        // ── r:160 reserves space for 3 colorbars on the right ─────────────────
        margin: { l: 0, r: 160, t: 10, b: 0 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        autosize: false,
        scene: {
            xaxis: {
                title: { text: 'Microballoon volume fraction %', font: { size: 14 } },
                autorange: 'reversed',
                tickvals: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6],
                ticktext: ['0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6'],
                tickfont: { size: 11 },
                gridcolor: '#d0d0d0',
            },
            yaxis: {
                title: { text: 'Microballoon density kg/m³', font: { size: 14 } },
                range: [100, 700],
                tickvals: [100, 200, 300, 400, 500, 600, 700],
                tickfont: { size: 11 },
                gridcolor: '#d0d0d0',
            },
            zaxis: {
                title: { text: 'α × 10⁻³ °C⁻¹', font: { size: 14 } },
                range: [-800, 400],
                tickvals: [-800, -700, -600, -500, -400, -300, -200, -100, 0, 100, 200, 300, 400],
                tickfont: { size: 11 },
                gridcolor: '#d0d0d0',
                zeroline: true,
                zerolinecolor: '#888',
                zerolinewidth: 1.5,
            },
            camera: {
                eye: { x: -1.5, y: -1.8, z: 1.0 },
                center: { x: 0, y: 0, z: -0.1 },
            },
            aspectmode: 'manual',
            aspectratio: { x: 1.2, y: 1.0, z: 1.0 },
            bgcolor: 'rgba(255,255,255,1)',
            annotations: annotations3d,
        },
        showlegend: false,
    };

    return (
        <Plot
            ref={plotRef}
            data={traces}
            layout={layout}
            config={{ responsive: false, displayModeBar: false }}
        />
    );
});

Surface3DChart.displayName = 'Surface3DChart';
export default Surface3DChart;