import { create } from 'zustand';
import api from '../api/index';
import wsClient from '../api/wsClient';

const useTerminalStore = create((set, get) => ({
    activeMode: 'EQUITIES',
    activeSymbol: 'AAPL',
    isLive: false,

    // LIVE DATA STREAMS
    equityPrices: {}, // { symbol: { price, volume, timestamp } }
    vessels: [],
    aircraft: [],
    intelFeed: [],

    // UI STATE
    panels: {
        watchlist: true,
        mainChart: true,
        orderFlow: true,
        intelligence: true,
        globalIntel: true,
    },

    // ACTIONS
    setActiveMode: (mode) => set({ activeMode: mode }),
    setActiveSymbol: (symbol) => set({ activeSymbol: symbol }),
    setLiveStatus: (status) => set({ isLive: status }),

    togglePanel: (panelName) => set((state) => ({
        panels: { ...state.panels, [panelName]: !state.panels[panelName] }
    })),

    // WEBSOCKET HUB CONNECTION
    connect: () => {
        if (get().isLive) return;

        // Step 1: Pre-seed with real last-close prices from yfinance
        const fetchLastKnownPrices = async () => {
            try {
                const res = await api.get('/api/v1/quotes/batch');
                const data = res.data;
                const priceMap = {};
                for (const [symbol, quote] of Object.entries(data)) {
                    priceMap[symbol] = {
                        price: quote.price,
                        volume: 0,
                        timestamp: Date.now(),
                        changePercent: quote.change_pct,
                        up: quote.up,
                        stale: quote.stale,
                    };
                }
                set({ equityPrices: priceMap });
                console.log(`[AXIOM] Pre-seeded ${Object.keys(priceMap).length} symbols`);
            } catch (e) {
                console.warn('[AXIOM] Last-known price fetch failed');
            }
        };
        fetchLastKnownPrices();

        // Step 2: Connect to live WebSocket hub via wsClient
        wsClient.connect();

        wsClient.on('connection_change', ({ status }) => {
            set({ isLive: status === 'CONNECTED' });
        });

        wsClient.on('EQUITY', (payload) => {
            set((state) => ({
                equityPrices: {
                    ...state.equityPrices,
                    [payload.symbol]: {
                        price: payload.price,
                        volume: payload.volume,
                        timestamp: payload.timestamp,
                        changePercent: payload.change_pct,
                        up: payload.up
                    }
                }
            }));
        });

        wsClient.on('VESSEL_DIFF', (payload) => {
            set((state) => {
                const newVessels = [...state.vessels];
                const { updated, removed } = payload;
                if (!updated && !removed) return state; // Handle legacy payload shape if any

                (updated || []).forEach(v => {
                    const idx = newVessels.findIndex(exist => exist.mmsi === v.mmsi);
                    if (idx !== -1) newVessels[idx] = { ...newVessels[idx], ...v };
                    else newVessels.push(v);
                });
                const finalVessels = newVessels.filter(v => !(removed || []).includes(v.mmsi));
                return { vessels: finalVessels };
            });
        });

        wsClient.on('AIRCRAFT_DIFF', (payload) => {
            set((state) => {
                const newAircraft = [...state.aircraft];
                const { updated, removed } = payload;
                if (!updated && !removed) return state;

                (updated || []).forEach(a => {
                    const idx = newAircraft.findIndex(exist => exist.icao24 === a.icao24);
                    if (idx !== -1) newAircraft[idx] = { ...newAircraft[idx], ...a };
                    else newAircraft.push(a);
                });
                const finalAircraft = newAircraft.filter(a => !(removed || []).includes(a.icao24));
                return { aircraft: finalAircraft };
            });
        });

        // News Intelligence Integration
        wsClient.on('NEWS', (payload) => {
            set((state) => {
                const newFeed = [payload, ...state.intelFeed].slice(0, 100);
                return { intelFeed: newFeed };
            });
        });
    },

    sendCmd: (type, payload) => {
        wsClient.send({ type, ...payload });
    }
}));

export default useTerminalStore;
