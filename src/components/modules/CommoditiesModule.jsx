import React from 'react';

const COMMODITIES = [
    { name: 'WTI CRUDE OIL', code: 'CL=F', price: '82.35', chg: '+1.24%', unit: '/bbl', up: true },
    { name: 'BRENT CRUDE', code: 'BZ=F', price: '86.10', chg: '+0.98%', unit: '/bbl', up: true },
    { name: 'NATURAL GAS', code: 'NG=F', price: '1.876', chg: '-2.10%', unit: '/MMBtu', up: false },
    { name: 'GOLD', code: 'GC=F', price: '2183.40', chg: '+0.33%', unit: '/oz', up: true },
    { name: 'SILVER', code: 'SI=F', price: '24.71', chg: '-0.55%', unit: '/oz', up: false },
    { name: 'COPPER', code: 'HG=F', price: '3.89', chg: '+0.72%', unit: '/lb', up: true },
    { name: 'WHEAT', code: 'ZW=F', price: '543.25', chg: '+2.44%', unit: '/bu', up: true },
    { name: 'CORN', code: 'ZC=F', price: '432.50', chg: '-0.88%', unit: '/bu', up: false },
    { name: 'SOYBEANS', code: 'ZS=F', price: '1187.25', chg: '+0.27%', unit: '/bu', up: true },
    { name: 'COTTON', code: 'CT=F', price: '80.12', chg: '+1.12%', unit: '/lb', up: true },
    { name: 'COFFEE', code: 'KC=F', price: '196.40', chg: '-0.34%', unit: '/lb', up: false },
    { name: 'SUGAR', code: 'SB=F', price: '23.41', chg: '+0.88%', unit: '/lb', up: true },
];

const CommoditiesModule = () => (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000', overflow: 'hidden' }}>
        <div style={{ padding: '5px 12px', background: '#0D0D0D', borderBottom: '1px solid #1A1A1A', fontSize: '11px', fontFamily: 'IBM Plex Mono', color: '#888', flexShrink: 0 }}>
            COMMODITIES / F4 · CRB INDEX: <span style={{ color: '#00FF41' }}>278.42 ▲ +0.54%</span> · BALTIC DRY: <span style={{ color: '#00FF41' }}>1,842 ▲</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', gap: '1px', padding: '1px', overflow: 'auto', background: '#111' }}>
            {COMMODITIES.map(c => (
                <div key={c.code} style={{
                    width: 'calc(33.33% - 1px)', padding: '14px',
                    background: c.up ? 'rgba(0,255,65,0.04)' : 'rgba(255,34,68,0.04)',
                    borderBottom: `2px solid ${c.up ? '#00FF41' : '#FF2244'}`,
                    fontFamily: 'IBM Plex Mono'
                }}>
                    <div style={{ color: '#888', fontSize: '9px', marginBottom: '4px' }}>{c.code}</div>
                    <div style={{ color: '#FFF', fontSize: '12px', marginBottom: '2px' }}>{c.name}</div>
                    <div style={{ color: '#FFF', fontSize: '20px', margin: '4px 0' }}>${c.price}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: c.up ? '#00FF41' : '#FF2244', fontSize: '12px' }}>{c.chg}</span>
                        <span style={{ color: '#888', fontSize: '10px' }}>{c.unit}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default CommoditiesModule;
