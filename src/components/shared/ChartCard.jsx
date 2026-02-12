
// Reusable Chart Card Component with fixed height
const ChartCard = ({ title, chartImage, navigateUrl, onShowChart }) => {
    const handleShowChart = () => {
        if (onShowChart) {
            onShowChart(navigateUrl);
        }
    };

    return (
        <div className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 h-full">
            <div className="flex items-center justify-between p-4 border-t-[3px] border-[#54058c]">
                <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h2 className="text-lg font-medium text-gray-800">{title}</h2>
                </div>
            </div>

            <div className="grow flex flex-col">
                <div className="flex-1 p-4 flex items-center justify-center">
                    <div className="w-full h-80 bg-transparent relative overflow-hidden">
                        <img
                            src={chartImage}
                            alt={`${title} visualization`}
                            className="w-full h-full object-contain mix-blend-multiply"
                            style={{
                                mixBlendMode: 'multiply',
                                filter: 'brightness(1.05) contrast(1.1)',
                                backgroundColor: 'transparent'
                            }}
                        />
                    </div>
                </div>

                <div className="p-4 mt-auto">
                    <button
                        onClick={handleShowChart}
                        className="w-full py-3 bg-[#54058c] text-white rounded-md hover:opacity-70 transition-colors duration-150 font-medium"
                    >
                        Show Chart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChartCard;