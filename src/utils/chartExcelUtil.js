import * as XLSX from 'xlsx';

export const downloadChartDataAsExcel = (data, filename = 'chart_data.xlsx') => {
    // Check if data is valid
    if (!Array.isArray(data) || data.length === 0) {
        console.error('No valid data provided for export');
        return;
    }

    // Flatten nested data structure (specific to MasterCurveGraph format)

    // const flattenedData = data.flatMap(temp =>
    //     temp.data.map(point => ({
    //         reference_temp: temp.reference_temp,
    //         frequency: point.frequency,
    //         storage_modulus: point.storage_modulus,
    //         fitted_storage_modulus: point.fitted_storage_modulus || null
    //     }))
    // );   

    // Convert to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ChartData');

    // Export file
    XLSX.writeFile(workbook, filename);
};