import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import useTerminalStore from '../../store/useTerminalStore';

const VESSEL_COLORS = {
    'Tanker': '#FF6600', 'VLCC': '#FF6600',
    'LNG Carrier': '#00CCFF', 'Container': '#00FF41',
    'Bulk Carrier': '#FFCC00', 'default': '#888888'
};

const CHOKEPOINTS = [
    { name: 'STRAIT OF HORMUZ', lat: 26.6, lon: 56.4, count: 23, baseline: 18, commodity: 'WTI/BRENT' },
    { name: 'SUEZ CANAL', lat: 30.5, lon: 32.3, count: 11, baseline: 14, commodity: 'CRUDE/GAS' },
    { name: 'STRAIT OF MALACCA', lat: 1.5, lon: 103.9, count: 47, baseline: 42, commodity: 'LNG/CRUDE' },
    { name: 'DANISH STRAITS', lat: 55.3, lon: 12.6, count: 8, baseline: 10, commodity: 'NAT GAS' },
];

const SatelliteModule = () => {
    const { vessels } = useTerminalStore();
    const [selected, setSelected] = useState(null);

    // Filter to vessels with valid coordinates
    const activeVessels = (vessels || []).filter(v => v.lat && v.lon);

    // Sidebar: show top 40 for performance
    const sidebarVessels = activeVessels.slice(0, 40);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000' }}>
            {/* Status Bar */}
            <div style={{ padding: '5px 12px', background: '#0D0D0D', borderBottom: '1px solid #1A1A1A', display: 'flex', gap: '24px', fontSize: '11px', fontFamily: 'IBM Plex Mono', flexShrink: 0 }}>
                <span style={{ color: '#888' }}>AIS VESSELS <span style={{ color: '#00FF41' }}>{activeVessels.length} TRACKED</span></span>
                <span style={{ color: '#888' }}>|</span>
                <span style={{ color: '#888' }}>MAP: <span style={{ color: '#00CCFF' }}>DARK MATTER</span></span>
                <span style={{ color: '#888' }}>|</span>
                <span style={{ color: '#888' }}>UPDATE: <span style={{ color: '#FFF' }}>REAL-TIME WS</span></span>
                <span style={{ color: '#888' }}>|</span>
                <span style={{ color: '#FF6600' }}>●</span><span style={{ color: '#888' }}>LIVE FEED</span>
            </div>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* MAP */}
                <div style={{ flex: 1 }}>
                    <MapContainer
                        center={[15, 40]}
                        zoom={2}
                        style={{ height: '100%', width: '100%', background: '#000' }}
                        zoomControl={false}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        />
                        {activeVessels.map(v => (
                            <CircleMarker
                                key={v.mmsi}
                                center={[v.lat, v.lon]}
                                radius={5}
                                pathOptions={{
                                    color: VESSEL_COLORS[v.type] || VESSEL_COLORS.default,
                                    fillColor: VESSEL_COLORS[v.type] || VESSEL_COLORS.default,
                                    fillOpacity: 0.9,
                                    weight: 1
                                }}
                                eventHandlers={{ click: () => setSelected(v) }}
                            >
                                <Popup>
                                    <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', background: '#0D0D0D', color: '#FFF', padding: '8px', minWidth: '180px' }}>
                                        <div style={{ color: '#FF6600', fontWeight: 'bold', marginBottom: '4px' }}>{v.name}</div>
                                        <div>TYPE: {v.type}</div>
                                        <div>DEST: {v.destination}</div>
                                        <div>SPEED: {v.speed} kts</div>
                                        <div>MMSI: {v.mmsi}</div>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        ))}
                        {CHOKEPOINTS.map(cp => (
                            <CircleMarker
                                key={cp.name}
                                center={[cp.lat, cp.lon]}
                                radius={12}
                                pathOptions={{ color: '#FFCC00', fillColor: 'rgba(255,204,0,0.05)', fillOpacity: 0.5, weight: 1, dashArray: '3' }}
                            >
                                <Popup>
                                    <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', background: '#0D0D0D', color: '#FFF', padding: '8px' }}>
                                        <div style={{ color: '#FFCC00', fontWeight: 'bold' }}>{cp.name}</div>
                                        <div>SIGNAL: {cp.commodity}</div>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        ))}
                    </MapContainer>
                </div>

                {/* SIDEBAR */}
                <div style={{ width: '280px', background: '#0D0D0D', borderLeft: '1px solid #1A1A1A', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
                    {/* Chokepoint Intelligence */}
                    <div style={{ borderBottom: '1px solid #1A1A1A', padding: '6px 10px', fontSize: '11px', color: '#FF6600' }}>CHOKEPOINT SIGNAL</div>
                    {CHOKEPOINTS.map(cp => (
                        <div key={cp.name} style={{ padding: '8px 10px', borderBottom: '1px solid #111', fontFamily: 'IBM Plex Mono', fontSize: '10px' }}>
                            <div style={{ color: '#FFCC00', marginBottom: '3px' }}>{cp.name}</div>
                            <div style={{ color: '#00CCFF', fontSize: '9px' }}>{cp.commodity} CHOKEPOINT</div>
                        </div>
                    ))}

                    {/* Active Vessels */}
                    <div style={{ borderBottom: '1px solid #1A1A1A', padding: '6px 10px', fontSize: '11px', color: '#FF6600', marginTop: '4px' }}>LIVE VESSEL FEED</div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {activeVessels.length === 0 && (
                            <div style={{ padding: '20px', color: '#333', textAlign: 'center', fontSize: '10px', fontFamily: 'IBM Plex Mono' }}>
                                WAITING FOR AIS STREAM...
                            </div>
                        )}
                        {sidebarVessels.map(v => (
                            <div key={v.mmsi}
                                onClick={() => setSelected(v)}
                                style={{ padding: '8px 10px', borderBottom: '1px solid #111', cursor: 'pointer', background: selected?.mmsi === v.mmsi ? 'rgba(255,102,0,0.05)' : 'transparent', fontFamily: 'IBM Plex Mono', fontSize: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                    <span style={{ color: selected?.mmsi === v.mmsi ? '#FF6600' : '#FFFFFF' }}>{v.name}</span>
                                    <span style={{ color: '#444' }}>{v.speed}kts</span>
                                </div>
                                <div style={{ color: VESSEL_COLORS[v.type] || VESSEL_COLORS.default, fontSize: '9px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {v.type} → {v.destination}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SatelliteModule;
