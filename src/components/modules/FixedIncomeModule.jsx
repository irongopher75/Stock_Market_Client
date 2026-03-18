import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const FixedIncomeModule = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
            setError(true);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const renderErrorState = () => (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF2244', fontSize: '11px', fontFamily: 'IBM Plex Mono', letterSpacing: '1px' }}>
            UNABLE TO FETCH INFO
        </div>
    );

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000', overflow: 'hidden' }}>
            <div style={{ padding: '5px 12px', background: '#0D0D0D', borderBottom: '1px solid #1A1A1A', fontSize: '11px', fontFamily: 'IBM Plex Mono', color: '#888', flexShrink: 0 }}>
                FIXED INCOME / F2 · US 2s10s SPREAD: <span style={{ color: '#FF2244' }}>-32bps (INVERTED)</span>
            </div>
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <div style={{ width: '240px', background: '#0D0D0D', borderRight: '1px solid #1A1A1A', overflow: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '6px 10px', borderBottom: '1px solid #1A1A1A', fontSize: '11px', color: '#FF6600', flexShrink: 0 }}>SOVEREIGN YIELDS</div>
                    <div style={{ flex: 1, padding: '10px' }}>
                        {loading ? <div style={{color:'#888', fontFamily:'IBM Plex Mono', fontSize:'11px'}}>FETCHING YIELDS...</div> : renderErrorState()}
                    </div>
                </div>
                <div style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '11px', color: '#FF6600', fontFamily: 'IBM Plex Mono', marginBottom: '8px', flexShrink: 0 }}>MULTI-MARKET YIELD COMPARISON (30d)</div>
                    <div style={{ flex: 1 }}>
                        {loading ? <div style={{color:'#888', padding:'20px', fontFamily:'IBM Plex Mono', fontSize:'11px'}}>FETCHING YIELD CURVES...</div> : renderErrorState()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FixedIncomeModule;
