import React, { useState, useEffect } from 'react';

const CRYPTOS = [];

const CryptoModule = () => {
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
            CRYPTO / F5 · TOTAL MKTCAP: <span style={{ color: '#00FF41' }}>$2.48T</span> · BTC DOM: <span style={{ color: '#FF6600' }}>53.2%</span> · FEAR & GREED: <span style={{ color: '#FFCC00' }}>52 NEUTRAL</span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignContent: 'flex-start', padding: '1px', overflow: 'auto', background: '#111' }}>
            {loading ? (
                <div style={{ padding: '20px', color: '#888', fontSize: '11px', fontFamily: 'IBM Plex Mono' }}>FETCHING CRYPTO PRICES...</div>
            ) : renderErrorState()}
        </div>
    </div>
    );
};

export default CryptoModule;
