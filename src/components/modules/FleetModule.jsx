const COMMODITIES = [];
const CORRELATION_DATA = [];
const PORT_CONGESTION = [];

import React, { useState, useEffect } from 'react';
import { ScatterChart, Scatter, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const FleetModule = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        // Simulate fetch attempt that fails (no data source available yet)
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
            FLEET & COMMODITIES / F7 · Baltic Dry Index: <span style={{ color: '#00FF41' }}>1,842 ▲ +2.1%</span>
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Commodity Prices */}
            <div style={{ width: '260px', background: '#0D0D0D', borderRight: '1px solid #1A1A1A', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
                <div style={{ padding: '6px 10px', borderBottom: '1px solid #1A1A1A', fontSize: '11px', color: '#FF6600' }}>COMMODITY PRICES</div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {loading ? <div style={{color:'#888', padding:'20px', fontFamily:'IBM Plex Mono', fontSize:'11px'}}>FETCHING COMMODITIES...</div> : renderErrorState()}
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
                            {loading ? <div style={{color:'#888', padding:'20px', fontFamily:'IBM Plex Mono', fontSize:'11px'}}>FETCHING FLEET METRICS...</div> : renderErrorState()}
                        </div>
                    </div>

                    {/* Port Congestion */}
                    <div style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: '11px', color: '#FF6600', fontFamily: 'IBM Plex Mono', marginBottom: '8px' }}>
                            PORT CONGESTION INDEX (vessels at anchor)
                        </div>
                        <div style={{ flex: 1 }}>
                            {loading ? <div style={{color:'#888', padding:'20px', fontFamily:'IBM Plex Mono', fontSize:'11px'}}>FETCHING PORT METRICS...</div> : renderErrorState()}
                        </div>
                    </div>
                </div>

                {/* Auto-insights */}
                <div style={{ width: '240px', background: '#0D0D0D', borderLeft: '1px solid #1A1A1A', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                    <div style={{ padding: '6px 10px', borderBottom: '1px solid #1A1A1A', fontSize: '11px', color: '#FF6600' }}>GEO → COMMODITY SIGNALS</div>
                    {loading ? <div style={{color:'#888', padding:'20px', fontFamily:'IBM Plex Mono', fontSize:'11px'}}>FETCHING SIGNALS...</div> : renderErrorState()}
                </div>
            </div>
        </div>
    );
};

export default FleetModule;
