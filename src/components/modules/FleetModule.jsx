import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, BarChart, Bar } from 'recharts';

const COMMODITIES = [
    { name: 'WTI CRUDE', ticker: 'CL=F', price: '82.35', chg: '+1.24%', up: true, unit: '/bbl' },
    { name: 'BRENT CRUDE', ticker: 'BZ=F', price: '86.10', chg: '+0.98%', up: true, unit: '/bbl' },
    { name: 'NATURAL GAS', ticker: 'NG=F', price: '1.876', chg: '-2.10%', up: false, unit: '/MMBtu' },
    { name: 'GOLD', ticker: 'GC=F', price: '2,183.40', chg: '+0.33%', up: true, unit: '/oz' },
    { name: 'SILVER', ticker: 'SI=F', price: '24.71', chg: '-0.55%', up: false, unit: '/oz' },
    { name: 'WHEAT', ticker: 'ZW=F', price: '543.25', chg: '+2.44%', up: true, unit: '/bu' },
    { name: 'CORN', ticker: 'ZC=F', price: '432.50', chg: '-0.88%', up: false, unit: '/bu' },
    { name: 'SOYBEANS', ticker: 'ZS=F', price: '1,187.25', chg: '+0.27%', up: true, unit: '/bu' },
];

const CORRELATION_DATA = Array.from({ length: 20 }, (_, i) => ({
    tankers: 15 + Math.floor(Math.random() * 10),
    wti: 78 + Math.random() * 15,
}));

const PORT_CONGESTION = [
    { port: 'SHANGHAI', waiting: 47, baseline: 32 },
    { port: 'ROTTERDAM', waiting: 18, baseline: 22 },
    { port: 'LA/LB', waiting: 31, baseline: 25 },
    { port: 'SINGAPORE', waiting: 24, baseline: 28 },
    { port: 'HAMBURG', waiting: 12, baseline: 15 },
];

const FleetModule = () => (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000', overflow: 'hidden' }}>
        <div style={{ padding: '5px 12px', background: '#0D0D0D', borderBottom: '1px solid #1A1A1A', fontSize: '11px', fontFamily: 'IBM Plex Mono', color: '#888', flexShrink: 0 }}>
            FLEET & COMMODITIES / F7 · Baltic Dry Index: <span style={{ color: '#00FF41' }}>1,842 ▲ +2.1%</span>
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Commodity Prices */}
            <div style={{ width: '260px', background: '#0D0D0D', borderRight: '1px solid #1A1A1A', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
                <div style={{ padding: '6px 10px', borderBottom: '1px solid #1A1A1A', fontSize: '11px', color: '#FF6600' }}>COMMODITY PRICES</div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {COMMODITIES.map(c => (
                        <div key={c.ticker} style={{ padding: '8px 10px', borderBottom: '1px solid #111', fontFamily: 'IBM Plex Mono', fontSize: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#FFFFFF' }}>{c.name}</span>
                                <span style={{ color: c.up ? '#00FF41' : '#FF2244' }}>{c.chg}</span>
                            </div>
                            <div style={{ color: '#888', marginTop: '2px' }}>{c.ticker} · <span style={{ color: '#FFF' }}>${c.price}</span>{c.unit}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Charts */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Tanker vs WTI Correlation */}
                <div style={{ flex: 1, borderBottom: '1px solid #1A1A1A', padding: '10px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '11px', color: '#FF6600', fontFamily: 'IBM Plex Mono', marginBottom: '8px' }}>
                        HORMUZ TANKER COUNT vs WTI PRICE (90d scatter)
                    </div>
                    <div style={{ flex: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart>
                                <CartesianGrid strokeDasharray="2 2" stroke="#1A1A1A" />
                                <XAxis dataKey="tankers" name="Tanker Count" tick={{ fill: '#888', fontSize: 10 }} label={{ value: 'Tankers in Hormuz', fill: '#888', fontSize: 10, position: 'insideBottom', offset: -5 }} />
                                <YAxis dataKey="wti" name="WTI Price" tick={{ fill: '#888', fontSize: 10 }} label={{ value: 'WTI $/bbl', fill: '#888', fontSize: 10, angle: -90, position: 'insideLeft' }} />
                                <Tooltip contentStyle={{ background: '#0D0D0D', border: '1px solid #1A1A1A', color: '#FFF', fontSize: 10 }} />
                                <Scatter data={CORRELATION_DATA} fill="#FF6600" opacity={0.7} />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Port Congestion */}
                <div style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '11px', color: '#FF6600', fontFamily: 'IBM Plex Mono', marginBottom: '8px' }}>
                        PORT CONGESTION INDEX (vessels at anchor)
                    </div>
                    <div style={{ flex: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={PORT_CONGESTION} layout="vertical">
                                <CartesianGrid strokeDasharray="2 2" stroke="#1A1A1A" horizontal={false} />
                                <XAxis type="number" tick={{ fill: '#888', fontSize: 10 }} />
                                <YAxis dataKey="port" type="category" tick={{ fill: '#888', fontSize: 9 }} width={70} />
                                <Tooltip contentStyle={{ background: '#0D0D0D', border: '1px solid #1A1A1A', color: '#FFF', fontSize: 10 }} />
                                <Bar dataKey="waiting" name="Waiting" fill="#FF6600" opacity={0.8} />
                                <Bar dataKey="baseline" name="30d Avg" fill="#1A1A1A" opacity={0.9} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Auto-insights */}
            <div style={{ width: '240px', background: '#0D0D0D', borderLeft: '1px solid #1A1A1A', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                <div style={{ padding: '6px 10px', borderBottom: '1px solid #1A1A1A', fontSize: '11px', color: '#FF6600' }}>GEO → COMMODITY SIGNALS</div>
                {[
                    { msg: '17 LNG tankers near Ras Laffan — bullish LNG futures', sev: '#00FF41', time: '12:04' },
                    { msg: 'Hormuz tanker count 28% above 90d avg — crude supply risk', sev: '#FF6600', time: '11:48' },
                    { msg: 'Black Sea grain exports down 22% — wheat signal BULLISH', sev: '#FFCC00', time: '11:22' },
                    { msg: 'Shanghai congestion at 47 vessels — freight rate pressure', sev: '#FF2244', time: '10:55' },
                    { msg: 'Baltic Dry Index up 2.1% — global trade expansion signal', sev: '#00FF41', time: '09:30' },
                ].map((sig, i) => (
                    <div key={i} style={{ padding: '10px', borderBottom: '1px solid #111', fontFamily: 'IBM Plex Mono', fontSize: '10px' }}>
                        <div style={{ color: '#888', marginBottom: '4px' }}>{sig.time}</div>
                        <div style={{ color: sig.sev, lineHeight: '1.5' }}>{sig.msg}</div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default FleetModule;
