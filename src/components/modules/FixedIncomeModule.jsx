import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BONDS = [
    { name: 'US 2Y', yield: '4.62%', chg: '+0.03', up: true, duration: '2y' },
    { name: 'US 10Y', yield: '4.30%', chg: '-0.02', up: false, duration: '10y' },
    { name: 'US 30Y', yield: '4.48%', chg: '+0.01', up: true, duration: '30y' },
    { name: 'INDIA 10Y', yield: '7.12%', chg: '+0.05', up: true, duration: '10y' },
    { name: 'GERMANY 10Y', yield: '2.58%', chg: '-0.04', up: false, duration: '10y' },
    { name: 'JAPAN 10Y', yield: '0.74%', chg: '+0.02', up: true, duration: '10y' },
];

const SPREAD_DATA = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    us2y: 4.2 + Math.sin(i * 0.3) * 0.3,
    us10y: 3.9 + Math.cos(i * 0.2) * 0.2,
    india: 7.0 + Math.random() * 0.2,
}));

const FixedIncomeModule = () => (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000', overflow: 'hidden' }}>
        <div style={{ padding: '5px 12px', background: '#0D0D0D', borderBottom: '1px solid #1A1A1A', fontSize: '11px', fontFamily: 'IBM Plex Mono', color: '#888', flexShrink: 0 }}>
            FIXED INCOME / F2 · US 2s10s SPREAD: <span style={{ color: '#FF2244' }}>-32bps (INVERTED)</span>
        </div>
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            <div style={{ width: '240px', background: '#0D0D0D', borderRight: '1px solid #1A1A1A', overflow: 'auto', flexShrink: 0 }}>
                <div style={{ padding: '6px 10px', borderBottom: '1px solid #1A1A1A', fontSize: '11px', color: '#FF6600' }}>SOVEREIGN YIELDS</div>
                {BONDS.map(b => (
                    <div key={b.name} style={{ padding: '8px 10px', borderBottom: '1px solid #111', fontFamily: 'IBM Plex Mono', fontSize: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#FFF' }}>{b.name}</span>
                            <span style={{ color: b.up ? '#FF2244' : '#00FF41' }}>{b.chg}</span>
                        </div>
                        <div style={{ color: '#00CCFF', marginTop: '2px' }}>{b.yield}</div>
                    </div>
                ))}
            </div>
            <div style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '11px', color: '#FF6600', fontFamily: 'IBM Plex Mono', marginBottom: '8px' }}>MULTI-MARKET YIELD COMPARISON (30d)</div>
                <div style={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={SPREAD_DATA}>
                            <CartesianGrid strokeDasharray="2 2" stroke="#1A1A1A" />
                            <XAxis dataKey="day" tick={{ fill: '#888', fontSize: 10 }} />
                            <YAxis tick={{ fill: '#888', fontSize: 10 }} tickFormatter={v => `${v}%`} />
                            <Tooltip contentStyle={{ background: '#0D0D0D', border: '1px solid #1A1A1A', color: '#FFF', fontSize: 10 }} />
                            <Line type="monotone" dataKey="us2y" stroke="#00FF41" strokeWidth={2} dot={false} name="US 2Y" />
                            <Line type="monotone" dataKey="us10y" stroke="#FF6600" strokeWidth={2} dot={false} name="US 10Y" />
                            <Line type="monotone" dataKey="india" stroke="#00CCFF" strokeWidth={2} dot={false} name="INDIA 10Y" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    </div>
);

export default FixedIncomeModule;
