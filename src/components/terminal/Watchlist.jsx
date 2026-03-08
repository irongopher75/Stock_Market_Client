import React, { useEffect, useState, useRef } from 'react';
import useTerminalStore from '../../store/useTerminalStore';

const Watchlist = () => {
    const { activeSymbol, setActiveSymbol, equityPrices } = useTerminalStore();
    const prevPrices = useRef({});
    const [flashMap, setFlashMap] = useState({});  // { symbol: 'up' | 'down' }

    // Symbols to show in watchlist
    const WATCHLIST = ['RELIANCE', 'TCS', 'AAPL', 'NVDA', 'TSLA', 'GOOGL', 'MSFT', 'AMZN', 'META', 'BINANCE:BTCUSDT'];

    // Detect price changes and trigger flash
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
    }, [equityPrices]);

    // Seed data for when live prices haven't arrived yet
    const SEED = {
        RELIANCE: { ltp: 2847.35, chg: +1.24, signal: 'BULL', conf: 82 },
        TCS: { ltp: 3921.60, chg: -0.43, signal: 'NEUTRAL', conf: 54 },
        AAPL: { ltp: 189.45, chg: +0.87, signal: 'BULL', conf: 76 },
        NVDA: { ltp: 726.13, chg: +2.15, signal: 'BULL', conf: 91 },
        TSLA: { ltp: 175.22, chg: -3.45, signal: 'BEAR', conf: 88 },
        GOOGL: { ltp: 142.18, chg: +0.21, signal: 'BULL', conf: 67 },
        MSFT: { ltp: 415.50, chg: +0.42, signal: 'BULL', conf: 73 },
        AMZN: { ltp: 182.30, chg: -0.18, signal: 'NEUTRAL', conf: 51 },
        META: { ltp: 497.60, chg: +1.02, signal: 'BULL', conf: 79 },
        'BINANCE:BTCUSDT': { ltp: 67432.0, chg: -1.12, signal: 'NEUTRAL', conf: 52 },
    };

    const rows = WATCHLIST.map(sym => {
        const live = equityPrices[sym];
        const seed = SEED[sym] || {};
        const ltp = live ? live.price.toFixed(2) : seed.ltp?.toFixed(2) ?? '---';
        const chg = seed.chg ?? 0;
        return { symbol: sym.replace('BINANCE:', ''), rawSym: sym, ltp, chg, signal: seed.signal, conf: seed.conf, up: chg >= 0 };
    });

    const SIGNAL_COLOR = { BULL: '#00FF41', BEAR: '#FF2244', NEUTRAL: '#FFCC00' };

    return (
        <div style={{ height: '100%', background: '#0D0D0D', border: '1px solid #1A1A1A', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '6px 10px', borderBottom: '1px solid #1A1A1A', fontSize: '11px', color: '#FF6600', letterSpacing: '0.06em', flexShrink: 0 }}>
                WATCHLIST / NSE · BSE · US · CRYPTO
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'IBM Plex Mono, monospace' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#0D0D0D' }}>
                        <tr>
                            <th style={{ padding: '5px 8px', fontWeight: 'normal', color: '#555', textAlign: 'left', borderBottom: '1px solid #1A1A1A' }}>SYMBOL</th>
                            <th style={{ padding: '5px 8px', fontWeight: 'normal', color: '#555', textAlign: 'right', borderBottom: '1px solid #1A1A1A' }}>LTP</th>
                            <th style={{ padding: '5px 8px', fontWeight: 'normal', color: '#555', textAlign: 'right', borderBottom: '1px solid #1A1A1A' }}>CHG%</th>
                            <th style={{ padding: '5px 8px', fontWeight: 'normal', color: '#555', textAlign: 'right', borderBottom: '1px solid #1A1A1A' }}>SIG</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(row => {
                            const flash = flashMap[row.rawSym];
                            return (
                                <tr
                                    key={row.rawSym}
                                    onClick={() => setActiveSymbol(row.rawSym)}
                                    style={{
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #111',
                                        background: flash === 'up'
                                            ? 'rgba(0,255,65,0.12)'
                                            : flash === 'down'
                                                ? 'rgba(255,34,68,0.12)'
                                                : activeSymbol === row.rawSym
                                                    ? 'rgba(255,102,0,0.06)'
                                                    : 'transparent',
                                        transition: 'background 0.15s ease',
                                    }}
                                >
                                    <td style={{ padding: '7px 8px', color: activeSymbol === row.rawSym ? '#FF6600' : '#FFFFFF' }}>{row.symbol}</td>
                                    <td style={{ padding: '7px 8px', textAlign: 'right', color: '#FFFFFF' }}>{row.ltp}</td>
                                    <td style={{ padding: '7px 8px', textAlign: 'right', color: row.up ? '#00FF41' : '#FF2244' }}>
                                        {row.up ? '▲' : '▼'} {Math.abs(row.chg).toFixed(2)}%
                                    </td>
                                    <td style={{ padding: '7px 8px', textAlign: 'right' }}>
                                        <span style={{ color: SIGNAL_COLOR[row.signal] ?? '#888', fontSize: '10px' }}>
                                            {row.signal ?? '---'}
                                        </span>
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
