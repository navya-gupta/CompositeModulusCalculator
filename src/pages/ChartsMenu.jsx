import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import youngModulusCurve from '../assets/images/chart_images/young_modulus_curve.png';
import ChartCard from '../components/shared/ChartCard';
// import Loader from '../components/shared/Loader';

// Move static data outside component
const CHART_INFORMATION_DATA = [
    {
        id: 1,
        title: 'Young Modulus Curve',
        chartImage: youngModulusCurve,
        navigateUrl: `/young-modulus-curve`
    },
    {
        id: 2,
        title: 'Bulk Modulus Curve',
        chartImage: youngModulusCurve,
        navigateUrl: `/bulk-modulus-curve`
    },
    {
        id: 3,
        title: 'Shear Modulus Curve',
        chartImage: youngModulusCurve,
        navigateUrl: `/shear-modulus-curve`
    }
];

const Menu = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [imagesLoaded, setImagesLoaded] = useState(0);


    const formData = location.state?.formData;
    // Track image loading
    useEffect(() => {
        const totalImages = CHART_INFORMATION_DATA.length;
        const loadImages = () => {
            let loadedCount = 0;

            CHART_INFORMATION_DATA.forEach((chart) => {
                const img = new Image();
                img.src = chart.chartImage;
                img.onload = () => {
                    loadedCount++;
                    setImagesLoaded(loadedCount);
                    if (loadedCount === totalImages) {
                        setLoading(false);
                    }
                };
                img.onerror = () => {
                    loadedCount++;
                    setImagesLoaded(loadedCount);
                    if (loadedCount === totalImages) {
                        setLoading(false);
                    }
                };
            });
        };

        const timer = setTimeout(() => {
            loadImages();
        }, 100);

        return () => clearTimeout(timer);
    }, []); // No dependencies needed now!

    const handleChartNavigation = (url) => {
        console.log(`Navigating to: ${url}`);
        navigate(url, {
            state: { formData }
        });
    };

    return (
        <React.Fragment>
            {/* {loading && <Loader isLoading={loading} />} */}
            {/* {loading && <span>Loading...</span>} */}
            <div className="bg-gray-100 min-h-screen p-6">
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">Charts Available</h1>

                {loading && (
                    <div className="text-sm text-gray-600 mb-4">
                        Loading images: {imagesLoaded} of {CHART_INFORMATION_DATA.length}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {CHART_INFORMATION_DATA.map((chart) => (
                        <div key={chart.id} className="h-full">
                            <ChartCard
                                title={chart.title}
                                chartImage={chart.chartImage}
                                navigateUrl={chart.navigateUrl}
                                onShowChart={handleChartNavigation}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </React.Fragment>
    );
};

export default Menu;