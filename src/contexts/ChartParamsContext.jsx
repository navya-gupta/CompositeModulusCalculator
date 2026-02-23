import { createContext, useContext } from 'react';

export const ChartParamsContext = createContext(null);

export const useChartParams = () => {
    const ctx = useContext(ChartParamsContext);
    if (!ctx) throw new Error('useChartParams must be used inside <Layout>');
    return ctx;
};