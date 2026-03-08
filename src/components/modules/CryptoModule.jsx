import React from 'react';

const CRYPTOS = [
    { name: 'Bitcoin', sym: 'BTC', price: '67,432.10', chg: '-1.12%', mktcap: '1.32T', up: false },
    { name: 'Ethereum', sym: 'ETH', price: '3,842.15', chg: '+0.24%', mktcap: '462B', up: true },
    { name: 'BNB', sym: 'BNB', price: '421.80', chg: '+1.44%', mktcap: '62B', up: true },
    { name: 'Solana', sym: 'SOL', price: '184.22', chg: '+3.21%', mktcap: '80B', up: true },
    { name: 'XRP', sym: 'XRP', price: '0.6142', chg: '-0.88%', mktcap: '35B', up: false },
    { name: 'Cardano', sym: 'ADA', price: '0.5911', chg: '+0.55%', mktcap: '21B', up: true },
    { name: 'Avalanche', sym: 'AVAX', price: '38.44', chg: '-2.11%', mktcap: '16B', up: false },
    { name: 'Chainlink', sym: 'LINK', price: '21.34', chg: '+4.12%', mktcap: '13B', up: true },
    { name: 'Polygon', sym: 'MATIC', price: '1.02', chg: '-1.42%', mktcap: '10B', up: false },
    { name: 'Uniswap', sym: 'UNI', price: '10.45', chg: '+0.77%', mktcap: '8B', up: true },
    { name: 'Polkadot', sym: 'DOT', price: '9.34', chg: '-0.21%', mktcap: '12B', up: false },
    { name: 'Cosmos', sym: 'ATOM', price: '10.82', chg: '+1.98%', mktcap: '4B', up: true },
];

const CryptoModule = () => (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000', overflow: 'hidden' }}>
        <div style={{ padding: '5px 12px', background: '#0D0D0D', borderBottom: '1px solid #1A1A1A', fontSize: '11px', fontFamily: 'IBM Plex Mono', color: '#888', flexShrink: 0 }}>
            CRYPTO / F5 · TOTAL MKTCAP: <span style={{ color: '#00FF41' }}>$2.48T</span> · BTC DOM: <span style={{ color: '#FF6600' }}>53.2%</span> · FEAR & GREED: <span style={{ color: '#FFCC00' }}>52 NEUTRAL</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', gap: '1px', padding: '1px', overflow: 'auto', background: '#111' }}>
            {CRYPTOS.map(c => (
                <div key={c.sym} style={{
                    width: 'calc(25% - 1px)', padding: '14px',
                    background: c.up ? 'rgba(0,255,65,0.04)' : 'rgba(255,34,68,0.04)',
                    borderBottom: `2px solid ${c.up ? '#00FF41' : '#FF2244'}`,
                    fontFamily: 'IBM Plex Mono'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: '#888', fontSize: '10px' }}>{c.sym}/USD</span>
                        <span style={{ color: '#444', fontSize: '9px' }}>{c.mktcap}</span>
                    </div>
                    <div style={{ color: '#FFF', fontSize: '12px', marginBottom: '6px' }}>{c.name}</div>
                    <div style={{ color: '#FFF', fontSize: '18px', marginBottom: '4px' }}>${c.price}</div>
                    <div style={{ color: c.up ? '#00FF41' : '#FF2244', fontSize: '12px' }}>{c.chg}</div>
                </div>
            ))}
        </div>
    </div>
);

export default CryptoModule;
