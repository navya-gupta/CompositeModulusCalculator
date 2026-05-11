/**
 * Surface3DPage.jsx
 * Full page for 3D surface chart.
 * Passes download buttons into FullscreenChart's surplusActionButtons.
 */
import { useRef } from 'react';
import FullscreenChart from '../components/shared/FullScreenChart';
import Surface3DChart from './Surface3DChart';

const Btn = ({ onClick, title, children }) => (
    <button onClick={onClick} title={title} aria-label={title}
        className="p-2 rounded-full hover:bg-gray-200 text-gray-700 cursor-pointer border-0 transition-colors">
        {children}
    </button>
);

const ImageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const CSVIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const Surface3DPage = () => {
    const chartRef = useRef(null);

    const extraButtons = [
        <Btn key="img" onClick={() => chartRef.current?.downloadImage()} title="Download chart as PNG">
            <ImageIcon />
        </Btn>,
        <Btn key="csv" onClick={() => chartRef.current?.downloadCSV()} title="Download data as CSV">
            <CSVIcon />
        </Btn>,
    ];

    return (
        <FullscreenChart
            title="3D Property Surfaces — CTE · Density · Dielectric"
            watermark={false}
            showDownloadButton={false}
            surplusActionButtons={extraButtons}
        >
            {/* Single div child — FullscreenChart's cloneElement injects height here (ignored) */}
            <div>
                <Surface3DChart ref={chartRef} />
            </div>
        </FullscreenChart>
    );
};

export default Surface3DPage;