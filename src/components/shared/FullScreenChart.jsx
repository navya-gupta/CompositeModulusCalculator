import React, { useEffect, useRef, useState } from 'react';
import { downloadChartDataAsExcel } from '../../utils/chartExcelUtil';
import { downloadChartAsImage } from '../../utils/chartUtils';

const DEFAULT_WATERMARK = {
    text: 'NYU-ViscoMOD',
    position: 'bottom-right',
    color: 'rgba(0,0,0,0.5)',
    fontSize: 30,
    rotation: 0,
    topShift: null,
    leftShift: null,
    rightShift: null,
    bottomShift: null
};

const FullscreenChart = ({
    children,
    title,
    className = '',
    actionButton = null,
    surplusActionButtons = [],
    showDownloadButton = true,
    downloadOptions = {},
    watermark = DEFAULT_WATERMARK,
    exportData = []
}) => {
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const chartContainerRef = useRef(null);
    const chartContentRef = useRef(null);
    const watermarkRef = useRef(null);
    const downloadMenuRef = useRef(null);

    const watermarkConfig = (() => {
        if (watermark === false) return null;
        if (typeof watermark === 'string') return { ...DEFAULT_WATERMARK, text: watermark };
        if (typeof watermark === 'object') return { ...DEFAULT_WATERMARK, ...watermark };
        return DEFAULT_WATERMARK;
    })();

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            if (chartContainerRef.current.requestFullscreen) {
                chartContainerRef.current.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable fullscreen: ${err.message}`);
                });
            } else if (chartContainerRef.current.webkitRequestFullscreen) {
                chartContainerRef.current.webkitRequestFullscreen();
            } else if (chartContainerRef.current.msRequestFullscreen) {
                chartContainerRef.current.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    };

    const handleDownloadChart = () => {
        const options = {
            filename: `${title || 'chart'}.png`,
            ...downloadOptions
        };

        if (watermarkConfig && !downloadOptions.watermark) {
            options.watermark = {
                ...watermarkConfig,
                matchDomPosition: true
            };
        }

        downloadChartAsImage(chartContentRef, options);
        setIsDropdownOpen(false);
    };

    const handleDownloadChartData = () => {
        downloadChartDataAsExcel(exportData, `${title || 'chart'}_data.xlsx`);
        setIsDropdownOpen(false);
    };

    const handleToggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                downloadMenuRef.current &&
                !downloadMenuRef.current.contains(event.target)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const handleFullScreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullScreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
        document.addEventListener('mozfullscreenchange', handleFullScreenChange);
        document.addEventListener('MSFullscreenChange', handleFullScreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullScreenChange);
        };
    }, []);

    const getPositionStyle = () => {
        if (!watermarkConfig) return {};

        const position = watermarkConfig.position || 'bottom-right';
        const style = {
            bottom: position.includes('bottom') ? (watermarkConfig.bottomShift || '10%') : 'auto',
            top: position.includes('top') ? (watermarkConfig.topShift || '10%') : 'auto',
            left: position.includes('left') ? (watermarkConfig.leftShift || '10%') : 'auto',
            right: position.includes('right') ? (watermarkConfig.rightShift || '10%') : 'auto',
        };

        if (position === 'center') {
            style.top = '50%';
            style.left = '50%';
            style.transform = watermarkConfig.rotation
                ? `translate(-50%, -50%) rotate(${watermarkConfig.rotation}deg)`
                : 'translate(-50%, -50%)';
        } else if (watermarkConfig.rotation) {
            style.transform = `rotate(${watermarkConfig.rotation}deg)`;
        }

        return style;
    };

    return (
        <div
            ref={chartContainerRef}
            className={`flex flex-col w-full min-h-screen bg-white ${isFullScreen ? 'fixed inset-0 z-50 p-8' : 'p-8'} ${className}`}
        >
            {/* Title Section */}
            {title && (
                <div className="w-full mb-4">
                    <h2 className="text-2xl text-center font-semibold text-gray-800 py-3">
                        {title}
                    </h2>
                    <hr className="border-gray-300" />
                </div>
            )}

            {/* Action Buttons */}
            <div className="w-full flex justify-end items-center mb-4">
                <div className="flex items-center gap-2">
                    {actionButton}
                    {surplusActionButtons.map((button, index) => (
                        <React.Fragment key={`action-button-${index}`}>{button}</React.Fragment>
                    ))}

                    {/* Fullscreen Button */}
                    <button
                        onClick={toggleFullScreen}
                        className="p-2 rounded-full hover:bg-gray-200 text-gray-700 cursor-pointer border-0 transition-colors"
                        title={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
                        aria-label={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
                    >
                        {isFullScreen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 4a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2H7.414l6.293 6.293a1 1 0 0 1-1.414 1.414L6 6.414V9a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1zm10 12a1 1 0 0 1-1 1h-4a1 1 0 1 1 0-2h2.586l-6.293-6.293a1 1 0 0 1 1.414-1.414L14 13.586V11a1 1 0 1 1 2 0v4a1 1 0 0 1-1 1z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 512 512" fill="currentColor">
                                <path d="M448 344v112a23.94 23.94 0 0 1-24 24H312c-21.39 0-32.09-25.9-17-41l36.2-36.2L224 295.6 116.77 402.9 153 439c15.09 15.1 4.39 41-17 41H24a23.94 23.94 0 0 1-24-24V344c0-21.4 25.89-32.1 41-17l36.19 36.2L184.46 256 77.18 148.7 41 185c-15.1 15.1-41 4.4-41-17V56a23.94 23.94 0 0 1 24-24h112c21.39 0 32.09 25.9 17 41l-36.2 36.2L224 216.4l107.23-107.3L295 73c-15.09-15.1-4.39-41 17-41h112a23.94 23.94 0 0 1 24 24v112c0 21.4-25.89 32.1-41 17l-36.19-36.2L263.54 256l107.28 107.3L407 327.1c15.1-15.2 41-4.5 41 16.9z" />
                            </svg>
                        )}
                    </button>

                    {/* Download Button */}
                    {showDownloadButton && (
                        <div className="relative">
                            <button
                                onClick={handleToggleDropdown}
                                className="p-2 cursor-pointer rounded-full hover:bg-gray-200 text-gray-700 border-0 transition-colors"
                                title="Download options"
                                aria-label='Download options'
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>

                            {isDropdownOpen && (
                                <div
                                    ref={downloadMenuRef}
                                    className="absolute right-0 mt-2 w-56 bg-white border-0 rounded-lg shadow-lg z-50"
                                >
                                    <button
                                        onClick={handleDownloadChart}
                                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-t-lg transition-colors"
                                    >
                                        Download chart image
                                    </button>
                                    <hr className="border-gray-200" />
                                    {exportData && <button
                                        onClick={handleDownloadChartData}
                                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-b-lg transition-colors"
                                    >
                                        Download chart data
                                    </button>}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Chart Content */}
            <div className="flex-1 w-full bg-white">
                <div
                    ref={chartContentRef}
                    className="w-full h-full relative bg-white"
                >
                    {React.cloneElement(children, {
                        height: isFullScreen ? '85vh' : children.props.height || 600
                    })}
                    {watermarkConfig && (
                        <div
                            ref={watermarkRef}
                            className="absolute pointer-events-none select-none"
                            style={{
                                ...getPositionStyle(),
                                fontSize: `${watermarkConfig.fontSize}px`,
                                color: watermarkConfig.color,
                                opacity: parseFloat(watermarkConfig.color.split(',')[3]) || 0.1,
                                zIndex: 10,
                                fontFamily: watermarkConfig.fontFamily || 'Arial'
                            }}
                        >
                            {watermarkConfig.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FullscreenChart;