import html2canvas from 'html2canvas';
import React from 'react';

/**
 * Utility function to download a chart as an image using html2canvas
 */
export const downloadChartAsImage = async (chartRef, options = {}) => {
    const {
        filename = 'chart.png',
        backgroundColor = 'white',
        watermark = null,
        format = 'png',
        quality = 0.95,
        scale = 2
    } = options;

    if (!chartRef.current) {
        console.error('Chart reference is not available');
        return;
    }

    try {
        // Use html2canvas to capture the entire chart container
        const canvas = await html2canvas(chartRef.current, {
            backgroundColor: backgroundColor,
            scale: scale,
            logging: false,
            useCORS: true,
            allowTaint: true,
            removeContainer: true
        });

        // Add watermark if specified
        // if (watermark) {
        //     const ctx = canvas.getContext('2d');
        //     const width = canvas.width / scale;
        //     const height = canvas.height / scale;

        //     ctx.scale(1 / scale, 1 / scale); // Adjust for scale

        //     if (watermark.matchDomPosition) {
        //         const watermarkElement = chartRef.current.querySelector('.chart-watermark');
        //         if (watermarkElement) {
        //             const chartRect = chartRef.current.getBoundingClientRect();
        //             const watermarkRect = watermarkElement.getBoundingClientRect();

        //             const relativePos = {
        //                 left: (watermarkRect.left - chartRect.left) * scale,
        //                 top: (watermarkRect.top - chartRect.top) * scale,
        //                 width: watermarkRect.width * scale,
        //                 height: watermarkRect.height * scale
        //             };

        //             addWatermarkAtPosition(ctx, watermark, relativePos, width * scale, height * scale);
        //         } else {
        //             addWatermarkByPosition(ctx, watermark, width * scale, height * scale);
        //         }
        //     } else {
        //         addWatermarkByPosition(ctx, watermark, width * scale, height * scale);
        //     }

        //     ctx.scale(scale, scale); // Reset scale
        // }

        // Convert to blob and download
        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        const fileExtension = format === 'jpeg' ? 'jpg' : 'png';

        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename.endsWith(`.${fileExtension}`)
                ? filename
                : `${filename}.${fileExtension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, mimeType, quality);
    } catch (err) {
        console.error('Error downloading chart:', err);
    }
};

/**
 * Add watermark at exact position
 */
const addWatermarkAtPosition = (ctx, watermark, position, width, height) => {
    const {
        text = 'NYU-ViscoMOD',
        color = 'rgba(0,0,0,0.1)',
        fontSize = 36,
        fontFamily = 'Arial',
        rotation = 0
    } = watermark;

    ctx.save();
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = 'middle';

    if (rotation !== 0) {
        const centerX = position.left + position.width / 2;
        const centerY = position.top + position.height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.translate(-centerX, -centerY);
    }

    ctx.fillText(text, position.left, position.top + position.height / 2);
    ctx.restore();
};

/**
 * Add watermark based on position string
 */
const addWatermarkByPosition = (ctx, watermark, width, height) => {
    const {
        text = 'NYU-ViscoMOD',
        color = 'rgba(0,0,0,0.1)',
        position = 'bottom-right',
        fontSize = 36,
        fontFamily = 'Arial',
        rotation = 0,
        bottomShift = null,
        topShift = null,
        leftShift = null,
        rightShift = null
    } = watermark;

    ctx.save();
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = 'middle';

    const textWidth = ctx.measureText(text).width;

    const getShiftValue = (shiftValue, dimension) => {
        if (!shiftValue) return null;
        if (typeof shiftValue === 'string' && shiftValue.endsWith('%')) {
            return (parseFloat(shiftValue) / 100) * dimension;
        }
        return parseFloat(shiftValue);
    };

    const bottomShiftPx = getShiftValue(bottomShift, height);
    const topShiftPx = getShiftValue(topShift, height);
    const leftShiftPx = getShiftValue(leftShift, width);
    const rightShiftPx = getShiftValue(rightShift, width);

    let x, y;

    switch (position) {
        case 'top-left':
            x = leftShiftPx || width * 0.05;
            y = topShiftPx || height * 0.05;
            break;
        case 'top-right':
            x = rightShiftPx ? width - textWidth - rightShiftPx : width * 0.95 - textWidth;
            y = topShiftPx || height * 0.05;
            break;
        case 'bottom-left':
            x = leftShiftPx || width * 0.05;
            y = bottomShiftPx ? height - bottomShiftPx : height * 0.95;
            break;
        case 'center':
            x = (width - textWidth) / 2;
            y = height / 2;
            break;
        case 'bottom-right':
        default:
            x = rightShiftPx ? width - textWidth - rightShiftPx : width * 0.95 - textWidth;
            y = bottomShiftPx ? height - bottomShiftPx : height * 0.95;
            break;
    }

    if (rotation !== 0) {
        const centerX = x + textWidth / 2;
        const centerY = y;
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.translate(-centerX, -centerY);
    }

    ctx.fillText(text, x, y);
    ctx.restore();
};

/**
 * Hook to create a downloadable chart
 */
export const useChartDownload = (options = {}) => {
    const chartRef = React.useRef(null);

    const downloadChart = (customOptions = {}) => {
        downloadChartAsImage(chartRef, { ...options, ...customOptions });
    };

    return { chartRef, downloadChart };
};