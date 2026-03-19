import React, { useState, useEffect } from 'react';
import api from '../../api/index';

const FixedIncomeModule = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchYields = async () => {
            try {
                const res = await api.get('/api/v1/quotes/macro/yields');
                if (res.data && res.data.US) {
                    setData(res.data.US);
                }
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch yields:", err);
                setError(true);
                setLoading(false);
            }
        };

        fetchYields();
        const poll = setInterval(fetchYields, 60000);
        return () => clearInterval(poll);
    }, []);

    const renderErrorState = () => (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF2244', fontSize: '11px', fontFamily: 'IBM Plex Mono', letterSpacing: '1px' }}>
            UNABLE TO FETCH INFO
        </div>
    );

    const mono = { fontFamily: 'IBM Plex Mono, monospace' };

    return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000', overflow: 'hidden' }}>
        <div style={{ padding: '5px 12px', background: '#0D0D0D', borderBottom: '1px solid #1A1A1A', fontSize: '11px', ...mono, color: '#888', flexShrink: 0, display: 'flex', justifyContent: 'space-between' }}>
            <span>FIXED INCOME / F2</span>
            <span>{loading && data.length > 0 ? "↻ UPDATING..." : "US TREASURY CURVE"}</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', overflowY: 'auto' }}>
            {loading && data.length === 0 ? (
                <div style={{ padding: '20px', color: '#888', fontSize: '11px', ...mono }}>FETCHING YIELDS...</div>
            ) : error ? (
                renderErrorState()
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', ...mono, textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#111', color: '#666', borderBottom: '1px solid #1A1A1A' }}>
                            <th style={{ padding: '8px 12px', fontWeight: 'normal' }}>MATURITY</th>
                            <th style={{ padding: '8px 12px', fontWeight: 'normal', textAlign: 'right' }}>YIELD</th>
                            <th style={{ padding: '8px 12px', fontWeight: 'normal', textAlign: 'right' }}>1D BPS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #1A1A1A' }}>
                                <td style={{ padding: '8px 12px', color: '#D4D4D4' }}>{item.maturity}</td>
                                <td style={{ padding: '8px 12px', color: '#FFF', textAlign: 'right' }}>
                                    {item.yield?.toFixed ? item.yield.toFixed(3) : '0.000'}%
                                </td>
                                <td style={{ padding: '8px 12px', color: item.up ? '#00FF41' : '#FF3B30', textAlign: 'right' }}>
                                    {item.up ? '+' : ''}{item.chg_bps?.toFixed ? item.chg_bps.toFixed(1) : '0.0'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    </div>
    );
};

export default FixedIncomeModule;
