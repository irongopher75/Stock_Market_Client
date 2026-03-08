import React, { useEffect, useState, useRef } from 'react';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, Cell, LineChart } from 'recharts';
import useTerminalStore from '../../store/useTerminalStore';

const INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1D', '1W'];

// Generate realistic-looking OHLCV data seeded by symbol
const generateCandles = (symbol, count = 60) => {
    const seed = symbol?.charCodeAt(0) ?? 65;
    let price = 100 + (seed % 200);
    return Array.from({ length: count }, (_, i) => {
        const open = price;
        const chg = (Math.random() - 0.48) * price * 0.012;
        const close = Math.max(open + chg, 1);
        const high = Math.max(open, close) * (1 + Math.random() * 0.005);
        const low = Math.min(open, close) * (1 - Math.random() * 0.005);
        const volume = Math.floor(Math.random() * 8000000 + 500000);
        const isUp = close >= open;
        price = close;
        const now = new Date();
        now.setMinutes(now.getMinutes() - (count - i) * 5);
        return { time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }), open, close, high, low, volume, isUp };
    });
};

const MainChart = () => {
    const { activeSymbol, equityPrices } = useTerminalStore();
    const [interval, setInterval] = useState('5m');
    const [candles, setCandles] = useState([]);

    useEffect(() => {
        setCandles(generateCandles(activeSymbol));
    }, [activeSymbol]);

    const lastCandle = candles[candles.length - 1];

    // Only show a price if we have it from the real store (last-close or live tick)
    // Never display randomly-generated candle close as if it's the real price
    const realPrice = equityPrices[activeSymbol]?.price ?? null;
    const livePrice = realPrice;
    const prevClose = equityPrices[activeSymbol]?.prev_close ?? equityPrices[activeSymbol]?.changePercent != null ? null : null;

    // Compute display change from equityPrices metadata
    const changePct = equityPrices[activeSymbol]?.changePercent ?? null;
    const priceUp = equityPrices[activeSymbol]?.up ?? null;
    const isStale = equityPrices[activeSymbol]?.stale ?? false;

    // SMA overlay
    const withSMA = candles.map((c, i, arr) => {
        const slice20 = arr.slice(Math.max(0, i - 20), i + 1).map(x => x.close);
        const sma20 = slice20.reduce((a, b) => a + b, 0) / slice20.length;
        const slice50 = arr.slice(Math.max(0, i - 50), i + 1).map(x => x.close);
        const sma50 = slice50.reduce((a, b) => a + b, 0) / slice50.length;
        return { ...c, sma20: parseFloat(sma20.toFixed(2)), sma50: parseFloat(sma50.toFixed(2)) };
    });

    return (
        <div style={{ height: '100%', background: '#0D0D0D', border: '1px solid #1A1A1A', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Chart Header */}
            <div style={{ padding: '6px 12px', borderBottom: '1px solid #1A1A1A', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontFamily: 'IBM Plex Mono', fontSize: '12px' }}>
                    <span style={{ color: '#FFF', fontWeight: 'bold' }}>{activeSymbol ?? 'AAPL'}</span>
                    {livePrice ? (
                        <>
                            <span style={{ color: '#FFF', fontSize: '16px' }}>{Number(livePrice).toFixed(2)}</span>
                            {changePct != null && (
                                <span style={{ color: priceUp ? '#00FF41' : '#FF2244', fontSize: '11px' }}>
                                    {priceUp ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
                                </span>
                            )}
                            {isStale && (
                                <span style={{ color: '#FFCC00', fontSize: '9px', border: '1px solid #FFCC0044', padding: '1px 4px' }} title="Last close — market closed">
                                    CLOSE
                                </span>
                            )}
                        </>
                    ) : (
                        <span style={{ color: '#333', fontSize: '13px' }}>---</span>
                    )}
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

            {/* Main Candlestick Chart */}
            <div style={{ flex: 3, padding: '8px 8px 0' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={withSMA} margin={{ top: 5, right: 50, bottom: 0, left: 0 }}>
                        <CartesianGrid strokeDasharray="2 2" stroke="#111" vertical={false} />
                        <XAxis dataKey="time" tick={{ fill: '#444', fontSize: 9 }} tickLine={false} axisLine={false} interval={9} />
                        <YAxis orientation="right" tick={{ fill: '#666', fontSize: 10 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} tickFormatter={v => v.toFixed(0)} />
                        <Tooltip
                            contentStyle={{ background: '#0D0D0D', border: '1px solid #1A1A1A', fontSize: '10px', fontFamily: 'IBM Plex Mono' }}
                            labelStyle={{ color: '#888' }}
                            formatter={(v, name) => [v?.toFixed(2), name]}
                        />
                        {/* Candle bodies */}
                        <Bar dataKey="close" fill="#00FF41" barSize={6}>
                            {withSMA.map((entry, i) => (
                                <Cell key={i} fill={entry.isUp ? '#00FF41' : '#FF2244'} />
                            ))}
                        </Bar>
                        {/* SMA overlays */}
                        <Line type="monotone" dataKey="sma20" stroke="#FF6600" strokeWidth={1} dot={false} name="SMA20" opacity={0.7} />
                        <Line type="monotone" dataKey="sma50" stroke="#00CCFF" strokeWidth={1} dot={false} name="SMA50" opacity={0.6} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Volume sub-chart */}
            <div style={{ flex: 1, padding: '0 8px 4px', borderTop: '1px solid #111' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={withSMA} margin={{ top: 4, right: 50, bottom: 0, left: 0 }}>
                        <XAxis dataKey="time" hide />
                        <YAxis orientation="right" tick={{ fill: '#333', fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1e6).toFixed(1)}M`} />
                        <Bar dataKey="volume" barSize={6}>
                            {withSMA.map((entry, i) => (
                                <Cell key={i} fill={entry.isUp ? 'rgba(0,255,65,0.4)' : 'rgba(255,34,68,0.4)'} />
                            ))}
                        </Bar>
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MainChart;
