import { create } from 'zustand';
import api, { getWsUrl } from '../api/index';

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

    socket: null,

    // ACTIONS
    setActiveMode: (mode) => set({ activeMode: mode }),
    setActiveSymbol: (symbol) => set({ activeSymbol: symbol }),
    setLiveStatus: (status) => set({ isLive: status }),

    togglePanel: (panelName) => set((state) => ({
        panels: { ...state.panels, [panelName]: !state.panels[panelName] }
    })),

    // WEBSOCKET HUB CONNECTION
    connect: () => {
        if (get().socket) return;

        // Step 1: Pre-seed with real last-close prices from yfinance
        const fetchLastKnownPrices = async () => {
            try {
                const res = await api.get('/api/v1/quotes/batch');
                const data = res.data;
                // data shape: { "AAPL": { price, prev_close, change_pct, up, stale } }
                const priceMap = {};
                for (const [symbol, quote] of Object.entries(data)) {
                    priceMap[symbol] = {
                        price: quote.price,
                        volume: 0,
                        timestamp: Date.now(),
                        changePercent: quote.change_pct,
                        up: quote.up,
                        stale: quote.stale,   // true = last close, not live tick
                    };
                }
                set({ equityPrices: priceMap });
                console.log(`[AXIOM] Pre-seeded ${Object.keys(priceMap).length} symbols from yfinance`);
            } catch (e) {
                console.warn('[AXIOM] Last-known price fetch failed:', e);
            }
        };
        fetchLastKnownPrices();

        // Step 2: Connect to live WebSocket hub
        const clientId = Math.random().toString(36).substring(7);
        const ws = new WebSocket(getWsUrl(clientId));

        ws.onopen = () => {
            console.log("Connected to Axiom Hub");
            set({ isLive: true, socket: ws });
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            const { type, data } = message;

            switch (type) {
                case 'EQUITY':
                    set((state) => ({
                        equityPrices: {
                            ...state.equityPrices,
                            [message.symbol]: {
                                price: message.price,
                                volume: message.volume,
                                timestamp: message.timestamp
                            }
                        }
                    }));
                    break;
                case 'VESSEL_DIFF':
                    set((state) => {
                        const newVessels = [...state.vessels];
                        const { updated, removed } = data;
                        updated.forEach(v => {
                            const idx = newVessels.findIndex(exist => exist.mmsi === v.mmsi);
                            if (idx !== -1) newVessels[idx] = { ...newVessels[idx], ...v };
                            else newVessels.push(v);
                        });
                        const finalVessels = newVessels.filter(v => !removed.includes(v.mmsi));
                        return { vessels: finalVessels };
                    });
                    break;
                case 'AIRCRAFT_DIFF':
                    set((state) => {
                        const newAircraft = [...state.aircraft];
                        const { updated, removed } = data;
                        updated.forEach(a => {
                            const idx = newAircraft.findIndex(exist => exist.icao24 === a.icao24);
                            if (idx !== -1) newAircraft[idx] = { ...newAircraft[idx], ...a };
                            else newAircraft.push(a);
                        });
                        const finalAircraft = newAircraft.filter(a => !removed.includes(a.icao24));
                        return { aircraft: finalAircraft };
                    });
                    break;
                default:
                    break;
            }
        };

        ws.onclose = () => {
            console.log("Disconnected from Axiom Hub. Reconnecting...");
            set({ isLive: false, socket: null });
            setTimeout(() => get().connect(), 5000);
        };

        ws.onerror = (err) => {
            console.error("WebSocket Hub error:", err);
            ws.close();
        };
    },

    sendCmd: (type, payload) => {
        const socket = get().socket;
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(json.dumps({ type, ...payload }));
        }
    }
}));

export default useTerminalStore;
