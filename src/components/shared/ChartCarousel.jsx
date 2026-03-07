/**
 * ChartCarousel.jsx
 * Drop-in replacement for the grid layout.
 * - All cards in one row (no wrapping)
 * - Arrow buttons appear when scroll is possible
 * - No auto-slide
 * - Keyboard accessible
 */

import { useCallback, useEffect, useRef, useState } from 'react';

const ARROW_COLOR = '#54058c';

const ChevronLeft = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

const ChevronRight = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

const ChartCarousel = ({ CHART_CARDS, ChartCard, handleChartNavigation }) => {
    const trackRef = useRef(null);
    const [canLeft, setCanLeft] = useState(false);
    const [canRight, setCanRight] = useState(false);

    // Check scroll position and update arrow visibility
    const updateArrows = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;
        setCanLeft(el.scrollLeft > 4);
        setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }, []);

    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;
        updateArrows();
        el.addEventListener('scroll', updateArrows, { passive: true });
        const ro = new ResizeObserver(updateArrows);
        ro.observe(el);
        return () => {
            el.removeEventListener('scroll', updateArrows);
            ro.disconnect();
        };
    }, [updateArrows]);

    const scroll = (dir) => {
        const el = trackRef.current;
        if (!el) return;
        // Scroll by one card width + gap
        const card = el.querySelector('[data-card]');
        const step = card ? card.offsetWidth + 24 : 340;
        el.scrollBy({ left: dir * step, behavior: 'smooth' });
    };

    return (
        <div className="relative w-full">

            {/* Left arrow */}
            <button
                onClick={() => scroll(-1)}
                aria-label="Scroll left"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10
                           flex items-center justify-center w-10 h-10 rounded-full
                           bg-white shadow-md border border-gray-200
                           transition-all duration-200 hover:scale-110 active:scale-95"
                style={{
                    color: ARROW_COLOR,
                    opacity: canLeft ? 1 : 0,
                    pointerEvents: canLeft ? 'auto' : 'none',
                    transitionProperty: 'opacity, transform',
                }}
            >
                <ChevronLeft />
            </button>

            {/* Scrollable track */}
            <div
                ref={trackRef}
                className="flex gap-6 overflow-x-auto pb-2"
                style={{
                    scrollSnapType: 'x mandatory',
                    WebkitOverflowScrolling: 'touch',
                    /* Hide scrollbar cross-browser */
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}
            >
                <style>{`
                    .chart-carousel-track::-webkit-scrollbar { display: none; }
                `}</style>

                {CHART_CARDS.map((chart) => (
                    <div
                        key={chart.id}
                        data-card
                        style={{
                            flex: '0 0 clamp(280px, 38vw, 460px)',
                            scrollSnapAlign: 'start',
                        }}
                    >
                        <ChartCard
                            title={chart.title}
                            chartComponent={chart.chartComponent}
                            navigateUrl={chart.navigateUrl}
                            onShowChart={handleChartNavigation}
                        />
                    </div>
                ))}
            </div>

            {/* Right arrow */}
            <button
                onClick={() => scroll(1)}
                aria-label="Scroll right"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10
                           flex items-center justify-center w-10 h-10 rounded-full
                           bg-white shadow-md border border-gray-200
                           transition-all duration-200 hover:scale-110 active:scale-95"
                style={{
                    color: ARROW_COLOR,
                    opacity: canRight ? 1 : 0,
                    pointerEvents: canRight ? 'auto' : 'none',
                    transitionProperty: 'opacity, transform',
                }}
            >
                <ChevronRight />
            </button>

            {/* Dot indicators */}
            <DotIndicators
                total={CHART_CARDS.length}
                trackRef={trackRef}
                onDotClick={(i) => {
                    const el = trackRef.current;
                    const card = el?.querySelectorAll('[data-card]')[i];
                    card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
                }}
            />
        </div>
    );
};

// Small dot indicators showing which card(s) are visible
const DotIndicators = ({ total, trackRef, onDotClick }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;
        const onScroll = () => {
            const card = el.querySelector('[data-card]');
            if (!card) return;
            const cardW = card.offsetWidth + 24;
            setActiveIndex(Math.round(el.scrollLeft / cardW));
        };
        el.addEventListener('scroll', onScroll, { passive: true });
        return () => el.removeEventListener('scroll', onScroll);
    }, [trackRef]);

    if (total <= 1) return null;

    return (
        <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: total }).map((_, i) => (
                <button
                    key={i}
                    onClick={() => onDotClick(i)}
                    aria-label={`Go to chart ${i + 1}`}
                    className="rounded-full transition-all duration-300"
                    style={{
                        width: i === activeIndex ? 20 : 8,
                        height: 8,
                        background: i === activeIndex ? ARROW_COLOR : '#d1c4e9',
                    }}
                />
            ))}
        </div>
    );
};

export default ChartCarousel;