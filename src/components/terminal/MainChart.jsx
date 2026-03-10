import React, { useEffect, useState, useRef, useMemo } from 'react';
import { createChart, ColorType, CandlestickSeries, HistogramSeries, LineSeries } from 'lightweight-charts';
import useTerminalStore from '../../store/useTerminalStore';

const INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1D', '1W'];

// Generate realistic-looking OHLCV data walking backwards from latest price
const generateCandles = (symbol, basePrice, count = 100) => {
    const seed = symbol?.charCodeAt(0) ?? 65;
    let price = basePrice || (100 + (seed % 200));
    const now = Math.floor(Date.now() / 1000);
    const result = [];

    for (let i = 0; i < count; i++) {
        const close = price;
        const chg = (Math.random() - 0.5) * price * 0.01;
        const open = Math.max(close - chg, 1);
        const high = Math.max(open, close) * (1 + Math.random() * 0.005);
        const low = Math.min(open, close) * (1 - Math.random() * 0.005);
        const volume = Math.floor(Math.random() * 8000000 + 500000);

        result.unshift({
            time: now - i * 300, // 5m intervals
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            volume
        });
        price = open;
    }
    return result;
};

const MainChart = () => {
    const activeSymbol = useTerminalStore(state => state.activeSymbol);
    const liveData = useTerminalStore(state => state.equityPrices[activeSymbol]);
    const [interval, setInterval] = useState('5m');
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const candlestickSeriesRef = useRef(null);
    const volumeSeriesRef = useRef(null);
    const sma20SeriesRef = useRef(null);
    const sma50SeriesRef = useRef(null);

    // Select the base price from the store to anchor the mock generator
    const basePrice = useTerminalStore(state => state.equityPrices[activeSymbol]?.price);

    // Generate historical candles anchored to the real price
    const candles = useMemo(() => generateCandles(activeSymbol, basePrice), [activeSymbol, interval, basePrice]);

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
                mode: 0,
            },
            rightPriceScale: {
                borderVisible: false,
            },
            timeScale: {
                borderVisible: false,
                timeVisible: true,
                secondsVisible: false,
                fixLeftEdge: true,
                fixRightEdge: true,
                shiftVisibleRangeOnNewBar: true,
            },
            handleScroll: true,
            handleScale: true,
            autoSize: false,
        });

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#00FF41',
            downColor: '#FF2244',
            borderVisible: false,
            wickUpColor: '#00FF41',
            wickDownColor: '#FF2244',
        });

        const volumeSeries = chart.addSeries(HistogramSeries, {
            color: '#26a69a',
            priceFormat: { type: 'volume' },
            priceScaleId: '', // overlay
        });

        chart.priceScale('').applyOptions({
            scaleMargins: { top: 0.8, bottom: 0 },
        });

        const sma20Series = chart.addSeries(LineSeries, { color: '#FF6600', lineWidth: 1 });
        const sma50Series = chart.addSeries(LineSeries, { color: '#00CCFF', lineWidth: 1 });

        chartRef.current = chart;
        candlestickSeriesRef.current = candlestickSeries;
        volumeSeriesRef.current = volumeSeries;
        sma20SeriesRef.current = sma20Series;
        sma50SeriesRef.current = sma50Series;

        // Use ResizeObserver for robust panel resizing
        const resizeObserver = new ResizeObserver(entries => {
            if (entries.length === 0 || !chartContainerRef.current) return;
            const { width, height } = entries[0].contentRect;
            chart.applyOptions({ width, height });
            // Small delay to ensure fitContent works after resize
            setTimeout(() => chart.timeScale().fitContent(), 50);
        });

        resizeObserver.observe(chartContainerRef.current);

        return () => {
            resizeObserver.disconnect();
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

        if (chartRef.current) {
            setTimeout(() => {
                chartRef.current.timeScale().fitContent();
            }, 50);
        }
    }, [candles]);

    // Live Data Integration
    useEffect(() => {
        if (!candlestickSeriesRef.current || !liveData || !candles.length) return;

        const live = liveData;
        const last = candles[candles.length - 1];

        const currentMinute = Math.floor(Date.now() / 1000 / 60) * 60;
        const lastCandleMinute = Math.floor(last.time / 60) * 60;
        const isNewMinute = currentMinute > lastCandleMinute;

        if (!live.price || !last.close) return;
        if (Number(live.price).toFixed(2) === Number(last.close).toFixed(2) && !isNewMinute) return;

        candlestickSeriesRef.current.update({
            time: isNewMinute ? currentMinute : last.time,
            open: isNewMinute ? live.price : last.open,
            high: isNewMinute ? live.price : Math.max(last.high, live.price),
            low: isNewMinute ? live.price : Math.min(last.low, live.price),
            close: live.price
        });
    }, [liveData, activeSymbol]);


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

            <div ref={chartContainerRef} style={{ flex: 1, minHeight: 0, position: 'relative' }} />
        </div>
    );
};

export default MainChart;
