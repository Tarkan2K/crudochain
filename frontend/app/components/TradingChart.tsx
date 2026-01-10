'use client';

import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';

export const TradingChart = () => {
    const chartContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#22c55e',
            },
            grid: {
                vertLines: { color: '#14532d' }, // green-900
                horzLines: { color: '#14532d' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 500,
        });

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#22c55e', // green-500
            downColor: '#ef4444', // red-500
            borderVisible: false,
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
        });

        // Dummy Data (Simulating CRDO price action)
        const data = [
            { time: '2023-12-22', open: 100.00, high: 105.00, low: 99.00, close: 102.00 },
            { time: '2023-12-23', open: 102.00, high: 108.00, low: 101.00, close: 107.00 },
            { time: '2023-12-24', open: 107.00, high: 110.00, low: 105.00, close: 109.00 },
            { time: '2023-12-25', open: 109.00, high: 115.00, low: 108.00, close: 112.00 },
            { time: '2023-12-26', open: 112.00, high: 112.00, low: 100.00, close: 101.00 },
            { time: '2023-12-27', open: 101.00, high: 105.00, low: 98.00, close: 103.00 },
            { time: '2023-12-28', open: 103.00, high: 110.00, low: 102.00, close: 108.00 },
            { time: '2023-12-29', open: 108.00, high: 120.00, low: 108.00, close: 118.00 },
        ];

        candlestickSeries.setData(data);

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    return (
        <div className="w-full h-full bg-black/40 backdrop-blur-md border border-green-900/30 rounded-2xl p-4 relative">
            <div className="absolute top-4 left-4 z-10 flex gap-4">
                <h3 className="text-green-400 font-bold tracking-widest">CRDO/USDT</h3>
                <span className="text-green-500 text-sm opacity-70">1H</span>
            </div>
            <div ref={chartContainerRef} className="w-full h-full" />
        </div>
    );
};
