import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

// Simulated yield curve data
const YIELD_CURVES = {
    'US': [
        { maturity: '3M', yield: 5.32 }, { maturity: '6M', yield: 5.28 }, { maturity: '1Y', yield: 5.04 },
        { maturity: '2Y', yield: 4.62 }, { maturity: '5Y', yield: 4.27 }, { maturity: '10Y', yield: 4.30 },
        { maturity: '30Y', yield: 4.48 }
    ],
    'IN': [
        { maturity: '3M', yield: 6.75 }, { maturity: '1Y', yield: 6.82 }, { maturity: '2Y', yield: 6.88 },
        { maturity: '5Y', yield: 6.98 }, { maturity: '10Y', yield: 7.12 }, { maturity: '30Y', yield: 7.35 }
    ],
};

const CENTRAL_BANKS = [
    { name: 'FED', rate: '5.25–5.50%', next: 'May 1', status: 'HOLD', color: '#FFCC00' },
    { name: 'RBI', rate: '6.50%', next: 'Apr 5', status: 'HOLD', color: '#FFCC00' },
    { name: 'ECB', rate: '4.50%', next: 'Apr 11', status: 'CUT', color: '#00FF41' },
    { name: 'BOJ', rate: '0.10%', next: 'Apr 26', status: 'HIKE', color: '#FF2244' },
    { name: 'BOE', rate: '5.25%', next: 'May 9', status: 'HOLD', color: '#FFCC00' },
];

const FX_PAIRS = [
    { pair: 'USD/INR', rate: '83.42', chg: '+0.12%', up: true },
    { pair: 'EUR/USD', rate: '1.0874', chg: '-0.08%', up: false },
    { pair: 'GBP/USD', rate: '1.2734', chg: '+0.21%', up: true },
    { pair: 'USD/JPY', rate: '149.21', chg: '+0.45%', up: true },
    { pair: 'AUD/USD', rate: '0.6521', chg: '-0.31%', up: false },
    { pair: 'USD/CHF', rate: '0.8874', chg: '+0.04%', up: true },
];

const ECONOMIC_CALENDAR = [
    { date: 'MAR 12', event: 'US CPI (Feb)', exp: '3.1%', prior: '3.1%', impact: 'HIGH' },
    { date: 'MAR 14', event: 'US PPI (Feb)', exp: '1.2%', prior: '0.9%', impact: 'MED' },
    { date: 'MAR 20', event: 'FOMC Rate Decision', exp: '5.50%', prior: '5.50%', impact: 'HIGH' },
    { date: 'MAR 22', event: 'US PCE Price Index', exp: '2.5%', prior: '2.4%', impact: 'HIGH' },
    { date: 'APR 5', event: 'US NFP (Mar)', exp: '200K', prior: '275K', impact: 'HIGH' },
];

const IMPACT_COLOR = { HIGH: '#FF2244', MED: '#FFCC00', LOW: '#888888' };

const MacroModule = () => {
    const [selectedCurve, setSelectedCurve] = React.useState('US');

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000', overflow: 'hidden' }}>
            <div style={{ padding: '5px 12px', background: '#0D0D0D', borderBottom: '1px solid #1A1A1A', fontSize: '11px', fontFamily: 'IBM Plex Mono', color: '#888', flexShrink: 0 }}>
                MACRO DASHBOARD / F9 · FEAR & GREED: <span style={{ color: '#FFCC00' }}>52 NEUTRAL</span> · VIX: <span style={{ color: '#00FF41' }}>13.24</span> · INTRADAY: <span style={{ color: '#00CCFF' }}>Mar 8, 2026</span>
            </div>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Left: Yield Curves */}
                <div style={{ flex: 1, borderRight: '1px solid #1A1A1A', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '6px 10px', borderBottom: '1px solid #1A1A1A', display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ color: '#FF6600', fontSize: '11px', fontFamily: 'IBM Plex Mono' }}>SOVEREIGN YIELD CURVES</span>
                        {Object.keys(YIELD_CURVES).map(c => (
                            <span key={c} onClick={() => setSelectedCurve(c)}
                                style={{ cursor: 'pointer', color: selectedCurve === c ? '#FF6600' : '#888', fontSize: '11px', fontFamily: 'IBM Plex Mono', borderBottom: selectedCurve === c ? '1px solid #FF6600' : 'none', paddingBottom: '2px' }}>
                                {c}
                            </span>
                        ))}
                    </div>
                    <div style={{ flex: 1, padding: '10px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={YIELD_CURVES[selectedCurve]}>
                                <CartesianGrid strokeDasharray="2 2" stroke="#1A1A1A" />
                                <XAxis dataKey="maturity" tick={{ fill: '#888', fontSize: 10 }} />
                                <YAxis tick={{ fill: '#888', fontSize: 10 }} domain={['auto', 'auto']} tickFormatter={v => `${v}%`} />
                                <Tooltip formatter={(v) => [`${v}%`, 'Yield']} contentStyle={{ background: '#0D0D0D', border: '1px solid #1A1A1A', color: '#FFF', fontSize: 10 }} />
                                <Line type="monotone" dataKey="yield" stroke="#00CCFF" strokeWidth={2} dot={{ fill: '#00CCFF', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* FX Heatmap row */}
                    <div style={{ borderTop: '1px solid #1A1A1A', padding: '8px 10px' }}>
                        <div style={{ fontSize: '11px', color: '#FF6600', fontFamily: 'IBM Plex Mono', marginBottom: '8px' }}>FX RATES</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {FX_PAIRS.map(fx => (
                                <div key={fx.pair} style={{ padding: '6px 10px', border: '1px solid #1A1A1A', background: fx.up ? 'rgba(0,255,65,0.05)' : 'rgba(255,34,68,0.05)', fontFamily: 'IBM Plex Mono', fontSize: '10px', minWidth: '110px' }}>
                                    <div style={{ color: '#888', fontSize: '9px' }}>{fx.pair}</div>
                                    <div style={{ color: '#FFF' }}>{fx.rate}</div>
                                    <div style={{ color: fx.up ? '#00FF41' : '#FF2244', fontSize: '9px' }}>{fx.chg}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Central Banks + Calendar */}
                <div style={{ width: '300px', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
                    <div style={{ padding: '6px 10px', borderBottom: '1px solid #1A1A1A', fontSize: '11px', color: '#FF6600', fontFamily: 'IBM Plex Mono' }}>CENTRAL BANKS</div>
                    {CENTRAL_BANKS.map(cb => (
                        <div key={cb.name} style={{ padding: '8px 12px', borderBottom: '1px solid #111', fontFamily: 'IBM Plex Mono', fontSize: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                <span style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{cb.name}</span>
                                <span style={{ color: cb.color, border: `1px solid ${cb.color}`, padding: '1px 6px', fontSize: '9px' }}>{cb.status}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#888' }}>RATE: <span style={{ color: '#FFF' }}>{cb.rate}</span></span>
                                <span style={{ color: '#888' }}>NEXT: {cb.next}</span>
                            </div>
                        </div>
                    ))}

                    <div style={{ padding: '6px 10px', borderBottom: '1px solid #1A1A1A', fontSize: '11px', color: '#FF6600', fontFamily: 'IBM Plex Mono', marginTop: '4px' }}>ECONOMIC CALENDAR (7d)</div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {ECONOMIC_CALENDAR.map((ev, i) => (
                            <div key={i} style={{ padding: '8px 12px', borderBottom: '1px solid #111', fontFamily: 'IBM Plex Mono', fontSize: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                    <span style={{ color: '#888' }}>{ev.date}</span>
                                    <span style={{ color: IMPACT_COLOR[ev.impact], fontSize: '9px', border: `1px solid ${IMPACT_COLOR[ev.impact]}`, padding: '1px 4px' }}>{ev.impact}</span>
                                </div>
                                <div style={{ color: '#FFF', marginBottom: '2px' }}>{ev.event}</div>
                                <div style={{ color: '#888' }}>EXP: <span style={{ color: '#FFCC00' }}>{ev.exp}</span> · PRIOR: {ev.prior}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MacroModule;
