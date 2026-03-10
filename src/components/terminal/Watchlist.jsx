import React, { useEffect, useState, useRef, useMemo } from 'react';
import useTerminalStore from '../../store/useTerminalStore';

const Watchlist = () => {
    // Current user's expanded watchlist
    const WATCHLIST = [
        'NIFTY 50', 'SENSEX', 'RELIANCE', 'TCS', 'HDFC', 'INFY',
        'AAPL', 'NVDA', 'TSLA', 'META', 'MSFT',
        'BTCUSDT', 'ETHUSDT'
    ];

    const activeSymbol = useTerminalStore(state => state.activeSymbol);
    const setActiveSymbol = useTerminalStore(state => state.setActiveSymbol);
    const equityPrices = useTerminalStore(state => state.equityPrices);

    const prevPrices = useRef({});
    const [flashMap, setFlashMap] = useState({});

    useEffect(() => {
        const newFlash = {};
        WATCHLIST.forEach(sym => {
            const livePrice = equityPrices[sym]?.price;
            const prevPrice = prevPrices.current[sym];
            if (livePrice !== undefined && prevPrice !== undefined && livePrice !== prevPrice) {
                newFlash[sym] = livePrice > prevPrice ? 'up' : 'down';
            }
            if (livePrice !== undefined) {
                prevPrices.current[sym] = livePrice;
            }
        });

        if (Object.keys(newFlash).length > 0) {
            setFlashMap(newFlash);
            const t = setTimeout(() => setFlashMap({}), 600);
            return () => clearTimeout(t);
        }
    }, [equityPrices, WATCHLIST]);

    const rows = useMemo(() => WATCHLIST.map(sym => {
        const live = equityPrices[sym];
        const ltp = live?.price != null ? Number(live.price).toFixed(2) : '---';
        const chg = live?.changePercent ?? 0;
        const up = live?.up ?? chg >= 0;
        const currency = live?.currency || 'USD';
        const curSign = currency === 'INR' ? '₹' : currency === 'USDT' ? '₮' : '$';

        return {
            symbol: sym,
            ltp: live?.price != null ? `${curSign}${ltp}` : '---',
            chg,
            signal: chg > 0.5 ? 'BULL' : chg < -0.5 ? 'BEAR' : 'NEUTRAL',
            up
        };
    }), [equityPrices, WATCHLIST]);

    const SIGNAL_COLOR = { BULL: '#00FF41', BEAR: '#FF2244', NEUTRAL: '#FFCC00' };

    return (
        <div style={{ height: '100%', background: '#0D0D0D', border: '1px solid #1A1A1A', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '6px 10px', borderBottom: '1px solid #1A1A1A', fontSize: '11px', color: '#FF6600', letterSpacing: '0.06em', flexShrink: 0 }}>
                WATCHLIST
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'IBM Plex Mono, monospace' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#0D0D0D', zIndex: 1 }}>
                        <tr>
                            <th style={{ padding: '5px 8px', fontWeight: 'normal', color: '#555', textAlign: 'left', borderBottom: '1px solid #1A1A1A' }}>SYMBOL</th>
                            <th style={{ padding: '5px 8px', fontWeight: 'normal', color: '#555', textAlign: 'right', borderBottom: '1px solid #1A1A1A' }}>LTP</th>
                            <th style={{ padding: '5px 8px', fontWeight: 'normal', color: '#555', textAlign: 'right', borderBottom: '1px solid #1A1A1A' }}>CHG%</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(row => {
                            const flash = flashMap[row.symbol];
                            return (
                                <tr
                                    key={row.symbol}
                                    onClick={() => setActiveSymbol(row.symbol)}
                                    style={{
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #111',
                                        background: flash === 'up'
                                            ? 'rgba(0,255,65,0.12)'
                                            : flash === 'down'
                                                ? 'rgba(255,34,68,0.12)'
                                                : activeSymbol === row.symbol
                                                    ? 'rgba(255,102,0,0.06)'
                                                    : 'transparent',
                                        transition: 'background 0.15s ease',
                                    }}
                                >
                                    <td style={{ padding: '7px 8px', color: activeSymbol === row.symbol ? '#FF6600' : '#FFFFFF' }}>{row.symbol}</td>
                                    <td style={{ padding: '7px 8px', textAlign: 'right', color: '#FFFFFF' }}>{row.ltp}</td>
                                    <td style={{ padding: '7px 8px', textAlign: 'right', color: row.up ? '#00FF41' : '#FF2244' }}>
                                        {row.up ? '▲' : '▼'}{Math.abs(row.chg).toFixed(2)}%
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Watchlist;
