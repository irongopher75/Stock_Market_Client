import React, { useEffect, useState, useRef, useMemo } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import useTerminalStore from '../../store/useTerminalStore';

const INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1D', '1W'];

// Generate realistic-looking OHLCV data seeded by symbol
const generateCandles = (symbol, count = 100) => {
    const seed = symbol?.charCodeAt(0) ?? 65;
    let price = 100 + (seed % 200);
    const now = Math.floor(Date.now() / 1000);
    return Array.from({ length: count }, (_, i) => {
        const open = price;
        const chg = (Math.random() - 0.48) * price * 0.012;
        const close = Math.max(open + chg, 1);
        const high = Math.max(open, close) * (1 + Math.random() * 0.005);
        const low = Math.min(open, close) * (1 - Math.random() * 0.005);
        const volume = Math.floor(Math.random() * 8000000 + 500000);
        price = close;
        return {
            time: now - (count - i) * 300,
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            volume
        };
    });
};

const MainChart = () => {
    const { activeSymbol, equityPrices } = useTerminalStore();
    const [interval, setInterval] = useState('5m');
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const candlestickSeriesRef = useRef(null);
    const volumeSeriesRef = useRef(null);
    const sma20SeriesRef = useRef(null);
    const sma50SeriesRef = useRef(null);

    const candles = useMemo(() => generateCandles(activeSymbol), [activeSymbol, interval]);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: '#0D0D0D' },
                textColor: '#666',
            },
            grid: {
                vertLines: { color: '#1A1A1A' },
                horzLines: { color: '#1A1A1A' },
            },
            crosshair: {
                mode: 0, // Normal mode
            },
            rightPriceScale: {
                borderVisible: false,
            },
            timeScale: {
                borderVisible: false,
                timeVisible: true,
                secondsVisible: false,
            },
            handleScroll: true,
            handleScale: true,
        });

        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#00FF41',
            downColor: '#FF2244',
            borderVisible: false,
            wickUpColor: '#00FF41',
            wickDownColor: '#FF2244',
        });

        const volumeSeries = chart.addHistogramSeries({
            color: '#26a69a',
            priceFormat: { type: 'volume' },
            priceScaleId: '', // overlay
        });

        volumeSeries.priceScale().applyOptions({
            scaleMargins: { top: 0.8, bottom: 0 },
        });

        const sma20Series = chart.addLineSeries({ color: '#FF6600', lineWidth: 1 });
        const sma50Series = chart.addLineSeries({ color: '#00CCFF', lineWidth: 1 });

        chartRef.current = chart;
        candlestickSeriesRef.current = candlestickSeries;
        volumeSeriesRef.current = volumeSeries;
        sma20SeriesRef.current = sma20Series;
        sma50SeriesRef.current = sma50Series;

        const handleResize = () => {
            chart.applyOptions({
                width: chartContainerRef.current.clientWidth,
                height: chartContainerRef.current.clientHeight
            });
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    useEffect(() => {
        if (!candlestickSeriesRef.current || !volumeSeriesRef.current) return;

        const data = candles;
        candlestickSeriesRef.current.setData(data);

        const volData = data.map(d => ({
            time: d.time,
            value: d.volume,
            color: d.close >= d.open ? 'rgba(0, 255, 65, 0.4)' : 'rgba(255, 34, 68, 0.4)'
        }));
        volumeSeriesRef.current.setData(volData);

        // SMA Data
        const sma20Data = data.map((d, i) => {
            if (i < 20) return null;
            const slice = data.slice(i - 19, i + 1);
            const sum = slice.reduce((a, b) => a + b.close, 0);
            return { time: d.time, value: sum / 20 };
        }).filter(d => d !== null);
        sma20SeriesRef.current.setData(sma20Data);

        const sma50Data = data.map((d, i) => {
            if (i < 50) return null;
            const slice = data.slice(i - 49, i + 1);
            const sum = slice.reduce((a, b) => a + b.close, 0);
            return { time: d.time, value: sum / 50 };
        }).filter(d => d !== null);
        sma50SeriesRef.current.setData(sma50Data);

        chartRef.current.timeScale().fitContent();
    }, [candles]);

    // Live Data Integration
    useEffect(() => {
        if (!candlestickSeriesRef.current || !equityPrices[activeSymbol]) return;

        const live = equityPrices[activeSymbol];
        const last = candles[candles.length - 1];

        // Update the last candle with live tick if it's the same minute
        // For simplicity, we just update the price here
        candlestickSeriesRef.current.update({
            time: last.time,
            open: last.open,
            high: Math.max(last.high, live.price),
            low: Math.min(last.low, live.price),
            close: live.price
        });
    }, [equityPrices, activeSymbol]);

    const liveData = equityPrices[activeSymbol];

    return (
        <div style={{ height: '100%', background: '#0D0D0D', border: '1px solid #1A1A1A', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '6px 12px', borderBottom: '1px solid #1A1A1A', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontFamily: 'IBM Plex Mono', fontSize: '12px' }}>
                    <span style={{ color: '#FFF', fontWeight: 'bold' }}>{activeSymbol ?? 'AAPL'}</span>
                    {liveData ? (
                        <>
                            <span style={{ color: '#FFF', fontSize: '16px' }}>{Number(liveData.price).toFixed(2)}</span>
                            {liveData.changePercent != null && (
                                <span style={{ color: liveData.up ? '#00FF41' : '#FF2244', fontSize: '11px' }}>
                                    {liveData.up ? '▲' : '▼'} {Math.abs(liveData.changePercent).toFixed(2)}%
                                </span>
                            )}
                        </>
                    ) : (
                        <span style={{ color: '#333', fontSize: '13px' }}>---</span>
                    )}
                    <span style={{ color: '#444', fontSize: '9px' }}>ENGINE: LIGHTWEIGHT CHARTS</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', fontFamily: 'IBM Plex Mono', fontSize: '10px' }}>
                    {INTERVALS.map(iv => (
                        <button key={iv} onClick={() => setInterval(iv)}
                            style={{ padding: '2px 6px', border: `1px solid ${interval === iv ? '#FF6600' : '#1A1A1A'}`, background: 'transparent', color: interval === iv ? '#FF6600' : '#666', cursor: 'pointer', fontFamily: 'IBM Plex Mono', fontSize: '10px' }}>
                            {iv}
                        </button>
                    ))}
                </div>
            </div>

            <div ref={chartContainerRef} style={{ flex: 1, position: 'relative' }} />
        </div>
    );
};

export default MainChart;
