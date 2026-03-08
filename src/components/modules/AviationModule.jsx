import React, { useState, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { IconLayer, ScatterplotLayer } from '@deck.gl/layers';
import { Map } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import useTerminalStore from '../../store/useTerminalStore';

const TYPE_COLOR = {
    CARGO: [255, 102, 0],
    PAX: [0, 204, 255],
    default: [136, 136, 136]
};

const INITIAL_VIEW_STATE = {
    longitude: 15,
    latitude: 30,
    zoom: 2,
    pitch: 0,
    bearing: 0
};

const AviationModule = () => {
    const { aircraft } = useTerminalStore();
    const [filter, setFilter] = useState('ALL');
    const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
    const [selected, setSelected] = useState(null);

    const displayFlights = useMemo(() => {
        const active = (aircraft || []).filter(f => f.lat && f.lon);
        return filter === 'ALL' ? active : active.filter(f => f.type === filter);
    }, [aircraft, filter]);

    const sidebarFlights = displayFlights.slice(0, 30);

    const layers = [
        new ScatterplotLayer({
            id: 'aircraft-layer',
            data: displayFlights,
            getPosition: d => [d.lon, d.lat],
            getFillColor: d => TYPE_COLOR[d.type] || TYPE_COLOR.default,
            getRadius: d => (selected?.icao24 === d.icao24 ? 30000 : 15000),
            pickable: true,
            onClick: ({ object }) => setSelected(object),
            updateTriggers: {
                getRadius: [selected?.icao24],
                getFillColor: [selected?.icao24]
            }
        })
    ];

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000', position: 'relative' }}>
            {/* Status bar */}
            <div style={{ padding: '5px 12px', background: '#0D0D0D', borderBottom: '1px solid #1A1A1A', display: 'flex', gap: '20px', fontSize: '11px', fontFamily: 'IBM Plex Mono', flexShrink: 0, alignItems: 'center', zIndex: 10 }}>
                <span style={{ color: '#FF6600' }}>▸ AVIATION / ADS-B</span>
                <span style={{ color: '#888' }}>ACTIVE: <span style={{ color: '#00CCFF' }}>{displayFlights.length.toLocaleString()}</span></span>
                <span style={{ color: '#888' }}>|</span>
                <span style={{ color: '#888' }}>ENGINE: <span style={{ color: '#FF6600' }}>DECK.GL (GPU)</span></span>

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

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
                {/* DECK.GL MAP */}
                <div style={{ flex: 1, position: 'relative' }}>
                    <DeckGL
                        viewState={viewState}
                        onViewStateChange={e => setViewState(e.viewState)}
                        controller={true}
                        layers={layers}
                        getTooltip={({ object }) => object && (
                            `FLIGHT: ${object.callsign}\nALT: ${object.altitude_ft.toLocaleString()}ft\nSPD: ${object.speed_kts}kts\nHDG: ${object.heading}°`
                        )}
                        style={{ background: '#000' }}
                    >
                        <Map
                            mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                            reuseMaps
                        />
                    </DeckGL>

                    {/* Selected Info Card */}
                    {selected && (
                        <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(13,13,13,0.95)', border: '1px solid #FF6600', padding: '12px', minWidth: '220px', zIndex: 5, fontFamily: 'IBM Plex Mono', pointerEvents: 'none' }}>
                            <div style={{ color: '#FF6600', fontWeight: 'bold', fontSize: '12px', marginBottom: '8px', letterSpacing: '1px' }}>{selected.callsign}</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '10px' }}>
                                <div style={{ color: '#444' }}>ICAO24</div><div style={{ color: '#FFF' }}>{selected.icao24}</div>
                                <div style={{ color: '#444' }}>COUNTRY</div><div style={{ color: '#FFF' }}>{selected.country}</div>
                                <div style={{ color: '#444' }}>ALTITUDE</div><div style={{ color: '#00CCFF' }}>{selected.altitude_ft.toLocaleString()} FT</div>
                                <div style={{ color: '#444' }}>SPEED</div><div style={{ color: '#FFF' }}>{selected.speed_kts} KTS</div>
                                <div style={{ color: '#444' }}>HEADING</div><div style={{ color: '#FFF' }}>{selected.heading}°</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* SIDEBAR */}
                <div style={{ width: '280px', background: '#0D0D0D', borderLeft: '1px solid #1A1A1A', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0, zIndex: 10 }}>
                    <div style={{ padding: '6px 10px', borderBottom: '1px solid #1A1A1A', fontSize: '11px', color: '#FF6600' }}>
                        ADS-B FEED
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {displayFlights.length === 0 && (
                            <div style={{ padding: '20px', color: '#333', fontFamily: 'IBM Plex Mono', fontSize: '10px', textAlign: 'center' }}>
                                WAITING FOR ADS-B DIFFS...
                            </div>
                        )}
                        {sidebarFlights.map((f, i) => (
                            <div key={f.icao24 || i}
                                onClick={() => {
                                    setSelected(f);
                                    setViewState({ ...viewState, longitude: f.lon, latitude: f.lat, zoom: 6, transitionDuration: 1000 });
                                }}
                                style={{ padding: '7px 10px', borderBottom: '1px solid #111', fontFamily: 'IBM Plex Mono', fontSize: '10px', cursor: 'pointer', background: selected?.icao24 === f.icao24 ? 'rgba(255,102,0,0.05)' : 'transparent' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                    <span style={{ color: `rgb(${TYPE_COLOR[f.type]?.join(',') || TYPE_COLOR.default.join(',')})` }}>{f.callsign}</span>
                                    <span style={{ color: '#444' }}>{f.type}</span>
                                </div>
                                <div style={{ color: '#555' }}>
                                    {f.country} · {f.altitude_ft.toLocaleString()}ft · {f.speed_kts}kts
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AviationModule;
