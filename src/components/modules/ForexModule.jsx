import React from 'react';

const FX_PAIRS = [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'NZD/USD',
    'USD/CAD', 'USD/INR', 'USD/SGD', 'USD/HKD', 'EUR/GBP', 'EUR/JPY',
    'GBP/JPY', 'AUD/JPY', 'USD/CNH', 'USD/KRW', 'USD/BRL', 'USD/MXN',
];

const genRate = (pair) => {
    const rates = {
        'EUR/USD': 1.0874, 'GBP/USD': 1.2734, 'USD/JPY': 149.21,
        'USD/CHF': 0.8874, 'AUD/USD': 0.6521, 'NZD/USD': 0.6012,
        'USD/CAD': 1.3571, 'USD/INR': 83.42, 'USD/SGD': 1.3421,
        'USD/HKD': 7.8231, 'EUR/GBP': 0.8541, 'EUR/JPY': 162.34,
        'GBP/JPY': 189.12, 'AUD/JPY': 97.24, 'USD/CNH': 7.1987,
        'USD/KRW': 1326.5, 'USD/BRL': 4.9712, 'USD/MXN': 17.15,
    };
    return rates[pair] || 1.0000;
};

const ForexModule = () => {
    const pairs = FX_PAIRS.map(pair => {
        const chgPct = ((Math.random() - 0.5) * 0.8).toFixed(2);
        return { pair, rate: genRate(pair).toFixed(4), chgPct: `${chgPct > 0 ? '+' : ''}${chgPct}%`, up: parseFloat(chgPct) >= 0 };
    });

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000', overflow: 'hidden' }}>
            <div style={{ padding: '5px 12px', background: '#0D0D0D', borderBottom: '1px solid #1A1A1A', fontSize: '11px', fontFamily: 'IBM Plex Mono', color: '#888', flexShrink: 0 }}>
                FOREX / F3 · DXY (USD INDEX): <span style={{ color: '#FF6600' }}>103.42 ▲ +0.21%</span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', gap: '1px', padding: '1px', overflow: 'auto', background: '#111' }}>
                {pairs.map(p => (
                    <div key={p.pair} style={{
                        width: 'calc(25% - 1px)', padding: '12px',
                        background: p.up ? 'rgba(0,255,65,0.04)' : 'rgba(255,34,68,0.04)',
                        borderBottom: `2px solid ${p.up ? '#00FF41' : '#FF2244'}`,
                        fontFamily: 'IBM Plex Mono'
                    }}>
                        <div style={{ color: '#888', fontSize: '10px', marginBottom: '4px' }}>{p.pair}</div>
                        <div style={{ color: '#FFFFFF', fontSize: '16px', marginBottom: '2px' }}>{p.rate}</div>
                        <div style={{ color: p.up ? '#00FF41' : '#FF2244', fontSize: '11px' }}>{p.chgPct}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ForexModule;
