// const ChartCard = ({ title, chartComponent, navigateUrl, onShowChart }) => {
//     const handleShowChart = () => {
//         if (onShowChart) onShowChart(navigateUrl);
//     };

//     return (
//         // FIX outline: tabIndex=-1 + outline-none removes browser focus ring
//         // Hover effect: scale-[1.03] lifts the card, shadow-xl deepens the shadow
//         // transition-all + duration-200 makes it smooth
//         <div
//             tabIndex={-1}
//             className="
//                 flex flex-col bg-white rounded-2xl overflow-hidden
//                 border border-gray-200
//                 shadow-md
//                 outline-none focus:outline-none
//                 transition-all duration-200 ease-out
//                 hover:scale-[1.03] hover:shadow-xl
//                 h-full cursor-pointer
//             "
//              style={{ outline: "none" }}
//         >
//             {/* Card header */}
//             <div className="flex items-center p-4 border-t-[3px] border-[#54058c]">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                 </svg>
//                 <h2 className="text-lg font-medium text-gray-800">{title}</h2>
//             </div>

//             {/* Mini chart */}
//             {/* No extra wrapper div — plain container with explicit px height so
//                 Recharts never measures a 0/1px box */}
//             <div className="px-2" style={{ height: '220px' }}>
//                 {chartComponent}
//             </div>

//             {/* Show Chart button */}
//             <div className="p-4 mt-auto">
//                 <button
//                     onClick={handleShowChart}
//                     className="w-full py-3 bg-[#54058c] text-white rounded-lg hover:opacity-80 transition-opacity duration-150 font-medium"
//                 >
//                     Show Chart
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default ChartCard;

const ChartCard = ({ title, chartComponent, navigateUrl, onShowChart }) => {
    const handleShowChart = () => {
        if (onShowChart) onShowChart(navigateUrl);
    };

    return (
        <div
            tabIndex={-1}
            className="
                flex flex-col bg-white rounded-2xl overflow-hidden
                border border-gray-200
                shadow-md
                transition-all duration-200 ease-out
                hover:scale-[1.03] hover:shadow-xl
                h-full cursor-pointer
                focus:outline-none focus:ring-0 focus:ring-offset-0
            "
        >
            <div className="flex items-center p-4 border-t-[3px] border-[#54058c]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h2 className="text-lg font-medium text-gray-800">{title}</h2>
            </div>

            <div className="px-2" style={{ height: "220px" }}>
                {chartComponent}
            </div>

            <div className="p-4 mt-auto">
                <button
                    onClick={handleShowChart}
                    className="
                        w-full py-3 bg-[#54058c] text-white rounded-lg
                        hover:opacity-80 transition-opacity duration-150 font-medium
                        focus:outline-none focus:ring-0 focus:ring-offset-0
                    "
                >
                    Show Chart
                </button>
            </div>
        </div>
    );
};

export default ChartCard;