import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../api';

const TYPE_COLOR = { CARGO: '#FF6600', PAX: '#00CCFF' };

const AviationModule = () => {
    const [flights, setFlights] = useState([]);
    const [stats, setStats] = useState(null);
    const [cargo, setCargo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [lastRefresh, setLastRefresh] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const [liveRes, statsRes] = await Promise.all([
                api.get('/api/v1/flights/live', { params: { limit: 500, min_altitude_ft: 3000 } }),
                api.get('/api/v1/flights/stats'),
            ]);

            setFlights(liveRes.data.flights || []);
            setLastRefresh(new Date().toLocaleTimeString('en-IN', { hour12: false }));
            setStats(statsRes.data);
        } catch (e) {
            console.warn('Aviation data fetch failed:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // refresh every 30s matching OpenSky cache
        return () => clearInterval(interval);
    }, [fetchData]);

    const displayFlights = filter === 'ALL'
        ? flights
        : flights.filter(f => f.type === filter);

    // Sidebar list: first 30 for performance
    const sidebarFlights = displayFlights.slice(0, 30);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000' }}>
            {/* Status bar */}
            <div style={{ padding: '5px 12px', background: '#0D0D0D', borderBottom: '1px solid #1A1A1A', display: 'flex', gap: '20px', fontSize: '11px', fontFamily: 'IBM Plex Mono', flexShrink: 0, alignItems: 'center' }}>
                <span style={{ color: '#FF6600' }}>▸ AVIATION / ADS-B</span>
                <span style={{ color: '#888' }}>SOURCE: <span style={{ color: '#FFF' }}>{stats?.source || 'OpenSky/FR24'}</span></span>
                {stats && (
                    <>
                        <span style={{ color: '#888' }}>AIRBORNE: <span style={{ color: '#00CCFF' }}>{stats.total_airborne.toLocaleString()}</span></span>
                        <span style={{ color: '#888' }}>CARGO: <span style={{ color: '#FF6600' }}>{stats.cargo}</span></span>
                        <span style={{ color: '#888' }}>PAX: <span style={{ color: '#00CCFF' }}>{stats.passenger.toLocaleString()}</span></span>
                    </>
                )}
                {lastRefresh && <span style={{ color: '#333' }}>Updated {lastRefresh}</span>}
                {loading && <span style={{ color: '#FFCC00' }}>FETCHING...</span>}

                {/* Type filter */}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                    {['ALL', 'CARGO', 'PAX'].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            style={{ padding: '1px 8px', border: `1px solid ${filter === f ? '#FF6600' : '#1A1A1A'}`, background: 'transparent', color: filter === f ? '#FF6600' : '#555', fontFamily: 'IBM Plex Mono', fontSize: '10px', cursor: 'pointer' }}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* MAP */}
                <div style={{ flex: 1 }}>
                    <MapContainer center={[30, 15]} zoom={2} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                        {displayFlights.map((f, i) => (
                            f.lat && f.lon ? (
                                <CircleMarker
                                    key={f.icao24 || i}
                                    center={[f.lat, f.lon]}
                                    radius={f.type === 'CARGO' ? 4 : 3}
                                    pathOptions={{ color: TYPE_COLOR[f.type] || '#888', fillColor: TYPE_COLOR[f.type] || '#888', fillOpacity: 0.85, weight: 0.5 }}
                                >
                                    <Popup>
                                        <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '11px', background: '#0D0D0D', color: '#FFF', padding: '8px', minWidth: '160px' }}>
                                            <div style={{ color: TYPE_COLOR[f.type], fontWeight: 'bold', marginBottom: '4px' }}>{f.callsign}</div>
                                            <div>TYPE: {f.type}</div>
                                            <div>COUNTRY: {f.country}</div>
                                            <div>ALT: {f.altitude_ft.toLocaleString()}ft</div>
                                            <div>SPD: {f.speed_kts}kts</div>
                                            <div>HDG: {f.heading}°</div>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            ) : null
                        ))}
                    </MapContainer>
                </div>

                {/* SIDEBAR */}
                <div style={{ width: '280px', background: '#0D0D0D', borderLeft: '1px solid #1A1A1A', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
                    <div style={{ padding: '6px 10px', borderBottom: '1px solid #1A1A1A', fontSize: '11px', color: '#FF6600' }}>
                        LIVE FLIGHTS ({displayFlights.length.toLocaleString()} tracked)
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {loading && (
                            <div style={{ padding: '20px', color: '#333', fontFamily: 'IBM Plex Mono', fontSize: '10px', textAlign: 'center' }}>
                                CONNECTING TO OPENSKY...
                            </div>
                        )}
                        {sidebarFlights.map((f, i) => (
                            <div key={f.icao24 || i} style={{ padding: '7px 10px', borderBottom: '1px solid #111', fontFamily: 'IBM Plex Mono', fontSize: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                    <span style={{ color: TYPE_COLOR[f.type] || '#888' }}>{f.callsign}</span>
                                    <span style={{ color: '#444' }}>{f.type}</span>
                                </div>
                                <div style={{ color: '#555' }}>
                                    {f.country} · {f.altitude_ft.toLocaleString()}ft · {f.speed_kts}kts
                                </div>
                            </div>
                        ))}
                        {displayFlights.length > 30 && (
                            <div style={{ padding: '8px', color: '#333', fontSize: '9px', fontFamily: 'IBM Plex Mono', textAlign: 'center' }}>
                                +{displayFlights.length - 30} more on map
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AviationModule;
