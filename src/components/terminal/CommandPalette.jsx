import React, { useState } from 'react';
import useTerminalStore from '../../store/useTerminalStore';

const CommandPalette = ({ onClose }) => {
    const { setActiveSymbol, setActiveMode } = useTerminalStore();
    const [query, setQuery] = useState('');

    const MODES = {
        'EQUITIES': 'EQUITIES', 'BONDS': 'FIXED INCOME', 'FOREX': 'FOREX',
        'COMMODITIES': 'COMMODITIES', 'CRYPTO': 'CRYPTO', 'SAT': 'SATELLITE',
        'SATELLITE': 'SATELLITE', 'FLEET': 'FLEET', 'AVIATION': 'AVIATION', 'MACRO': 'MACRO',
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const q = query.toUpperCase().trim();
        if (MODES[q]) {
            setActiveMode(MODES[q]);
        } else {
            setActiveSymbol(q);
        }
        onClose();
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '100px' }}>
            <div style={{ width: '600px', background: '#0D0D0D', border: '1px solid #FF6600' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '12px', borderBottom: '1px solid #1A1A1A' }}>
                        <span style={{ color: '#FF6600', fontSize: '14px', fontFamily: 'IBM Plex Mono' }}>{'>'}</span>
                        <input
                            autoFocus
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Type symbol (AAPL), mode (MACRO), or command (VESSEL:EVER GIVEN)..."
                            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#FFFFFF', fontFamily: 'IBM Plex Mono', fontSize: '13px' }}
                        />
                    </div>
                </form>
                <div style={{ padding: '8px 16px', borderBottom: '1px solid #1A1A1A' }}>
                    <div style={{ color: '#888888', fontSize: '10px', marginBottom: '8px', letterSpacing: '0.1em' }}>MODES</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {['EQUITIES', 'FIXED INCOME', 'FOREX', 'COMMODITIES', 'CRYPTO', 'SATELLITE', 'FLEET', 'AVIATION', 'MACRO'].map(m => (
                            <span key={m} onClick={() => { setActiveMode(m); onClose(); }}
                                style={{ cursor: 'pointer', padding: '2px 8px', border: '1px solid #1A1A1A', color: '#888888', fontSize: '11px', fontFamily: 'IBM Plex Mono' }}>
                                {m}
                            </span>
                        ))}
                    </div>
                </div>
                <div style={{ padding: '8px 16px 12px', color: '#444', fontSize: '11px', fontFamily: 'IBM Plex Mono' }}>
                    ESC to close · ENTER to navigate
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
