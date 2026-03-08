# AXIOM Terminal: Frontend (Client)

The **AXIOM Client** is a high-fidelity React-based terminal interface designed for low-latency financial monitoring.

## 🚀 Tech Stack
- **Framework**: React 18 + Vite
- **State Management**: Zustand (Centralized WebSocket and UI state)
- **Mapping**: Leaflet + React-Leaflet
- **Styling**: Vanilla CSS (AXIOM Design System)
- **Data Fetching**: Axios (Centralized API configuration)

## 📦 Key Components
- **GlobalIntelFeed**: Real-time news scraper with parallel processing indicators.
- **SatelliteModule**: High-performance AIS vessel tracking.
- **AviationModule**: ADS-B aircraft flight map with live stats.
- **MainChart**: Candlestick charting with real-time technical overlays.

## 🛠️ Configuration
Required environment variables in `.env`:
```env
VITE_API_URL=http://your-backend-url:8000
```

## 🏃 Running Locally
```bash
npm install
npm run dev
```
