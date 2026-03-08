import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, Activity, TrendingUp, AlertTriangle, Zap, Clock, Wallet, BarChart3, History, Maximize2, Globe } from 'lucide-react';
import { getPrediction, getMyHistory, closeTrade, getSymbols } from '../api';
import { useData } from '../context/DataContext';
import LoadingScreen from '../components/shared/LoadingScreen';
import TradingTerminal from '../components/dashboard/TradingTerminal';
import TechnicalAuditModal from '../components/dashboard/TechnicalAuditModal';

const Sparkline = ({ data, color }) => (
    <div className="h-12 w-24">
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.1} strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

const Dashboard = () => {
    const {
        performance,
        activeTrades,
        tradeHistory,
        refreshData,
        activeSymbol: symbol,
        setActiveSymbol: setSymbol,
        activeExchange: selectedExchange,
        setActiveExchange: setSelectedExchange
    } = useData();
    const [interval, setInterval] = useState('1h');
    const [data, setData] = useState(null);
    const [history, setHistory] = useState([]);

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isAuditOpen, setIsAuditOpen] = useState(false);
    const [latency, setLatency] = useState(0);
    const [marketOpen, setMarketOpen] = useState(true);
    const navigate = useNavigate();

    // Generate dynamic sparkline from history or fallback
    const sparklineData = history.length > 5
        ? history.slice(-10).map(h => ({ value: h.price || h.current_price }))
        : [];

    const displayData = data || {
        prediction: "-",
        reasoning: "Awaiting incoming vector streams...",
        confidence: 0,
        current_price: 0,
        rsi: 0,
        macd: 0,
        payoff_graph: [],
        hft_risk: {}
    };

    // Calculate P&L and derived metrics from performance snapshot
    const displayPnl = performance?.total_pnl ?? 0;
    const winRate = performance?.win_rate ?? '0.0%';
    const activeExposure = performance?.active_exposure ?? 0;
    const activeUnits = performance?.active_units ?? 0;
    const realizedPnl = performance?.realized_pnl ?? 0;
    const unrealizedPnl = performance?.unrealized_pnl ?? 0;

    // Market Status Check (IST: 9:15 - 15:30, Mon-Fri)
    useEffect(() => {
        const checkMarket = () => {
            const now = new Date();
            const options = { timeZone: 'Asia/Kolkata', hour12: false, hour: 'numeric', minute: 'numeric', weekday: 'short' };
            const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(now);
            const timeMap = Object.fromEntries(parts.map(p => [p.type, p.value]));

            const hour = parseInt(timeMap.hour);
            const minute = parseInt(timeMap.minute);
            const weekday = timeMap.weekday;

            const isWeekday = !['Sat', 'Sun'].includes(weekday);
            const totalMinutes = hour * 60 + minute;
            const openMinutes = 9 * 60 + 15;
            const closeMinutes = 15 * 60 + 30;

            setMarketOpen(isWeekday && totalMinutes >= openMinutes && totalMinutes <= closeMinutes);
        };
        checkMarket();
        const interval = setInterval(checkMarket, 60000);
        return () => clearInterval(interval);
    }, []);

    // Simple trend strength heuristic based on confidence
    const trendStrength = Math.min(
        100,
        Math.abs((displayData.confidence ?? 0.5) * 100 - 50) * 2
    );

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                // Fetch the full list of symbols
                const symbolsRes = await getSymbols(selectedExchange);
                const allSymbols = symbolsRes.data;

                if (allSymbols && allSymbols.length > 0) {
                    // Pick 5 random symbols for seeding (Dynamic Seeding)
                    const shuffled = [...allSymbols].sort(() => 0.5 - Math.random());
                    const uniqueBasket = [...new Set(shuffled.slice(0, 5).map(s => s.symbol))];

                    // Set default symbol based on exchange
                    let primeSymbol = uniqueBasket[0];
                    if (selectedExchange === 'nse') primeSymbol = 'NIFTY';
                    else if (selectedExchange === 'us') primeSymbol = 'AAPL';
                    else if (selectedExchange === 'japan') primeSymbol = '7203.T';
                    else if (selectedExchange === 'uk') primeSymbol = 'HSBA.L'; // HSBC
                    else if (selectedExchange === 'bse') primeSymbol = 'RELIANCE.BO';

                    setSymbol(primeSymbol);

                    // Fetch first one immediately for the main display
                    const startTime = performance.now();
                    const firstRes = await getPrediction(primeSymbol, '1h');
                    const endTime = performance.now();
                    setLatency(Math.round(endTime - startTime));
                    setData(firstRes.data);

                    // Background seed the rest
                    const seedRemaining = async () => {
                        for (const sym of uniqueBasket.slice(1)) {
                            await new Promise(resolve => setTimeout(resolve, 800));
                            try {
                                await getPrediction(sym, '1h');
                            } catch (e) {
                                console.warn(`Seed failed for ${sym}`, e);
                            }
                        }
                        refreshHistory();
                    };
                    seedRemaining();
                }
            } catch (e) {
                console.warn("Auto-predict failed:", e);
            }

            // Refresh history and trades
            await Promise.all([refreshHistory(), refreshData()]);
            setTimeout(() => {
                setInitialLoading(false);
                setLoading(false);
            }, 800);
        }
        init();
    }, [selectedExchange]);

    // Re-trigger prediction when global symbol changes from Header
    useEffect(() => {
        if (symbol && !initialLoading) {
            handlePredict();
        }
    }, [symbol]);

    const refreshHistory = async () => {
        try {
            const res = await getMyHistory();
            setHistory(res.data);
        } catch (err) {
            console.warn("Failed to load history (Backend offline?)");
        }
    };



    const handlePredict = async () => {
        setLoading(true);
        try {
            const startTime = performance.now();
            const res = await getPrediction(symbol, interval);
            const endTime = performance.now();
            setLatency(Math.round(endTime - startTime));
            setData(res.data);
            refreshHistory();
            refreshData();
        } catch (err) {
            console.error("Prediction failed, using mock data for UI");
        }
        setLoading(false);
    };

    const getSentimentColor = (sentiment) => {
        if (sentiment === 'BULLISH') return 'text-green-400 from-green-400 to-emerald-600';
        if (sentiment === 'BEARISH') return 'text-red-400 from-red-400 to-rose-600';
        return 'text-yellow-400 from-yellow-400 to-amber-600';
    };

    if (initialLoading) return <LoadingScreen message="Initializing real-time trade engines..." />;

    return (
        <div className="w-full pb-20 space-y-8 font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-4">
                        <p className="text-gray-400 text-sm">
                            Market is <span className={`${marketOpen ? 'text-green-500' : 'text-red-500'} font-bold`}>
                                {marketOpen ? 'OPEN' : 'CLOSED'}
                            </span>
                        </p>
                        <div className="w-1 h-1 rounded-full bg-gray-600" />
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Alpha Stream Live</span>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-1.5 rounded-2xl flex items-center gap-2">
                    <div className="relative group">
                        <select
                            value={selectedExchange}
                            onChange={(e) => setSelectedExchange(e.target.value)}
                            className="bg-transparent text-white px-3 py-2.5 rounded-xl border border-transparent focus:border-blue-500/50 outline-none text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-white/5 transition-colors appearance-none flex-shrink-0"
                        >
                            <option value="nse">NSE</option>
                            <option value="bse">BSE</option>
                            <option value="us">US</option>
                            <option value="japan">JAP</option>
                            <option value="uk">LSE</option>
                        </select>
                        <Globe className="w-3 h-3 absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>

                    <div className="relative group">
                        <input
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                            className="bg-gray-900/50 text-white pl-4 pr-12 py-2.5 rounded-xl border border-white/5 focus:border-blue-500/50 outline-none w-44 font-mono text-sm uppercase transition-all"
                            placeholder="SYMBOL"
                        />
                        <span className="absolute right-4 top-3 text-[10px] text-gray-500 font-black tracking-widest group-focus-within:text-blue-500 transition-colors uppercase">{selectedExchange}</span>
                    </div>

                    <select
                        value={interval}
                        onChange={(e) => setInterval(e.target.value)}
                        className="bg-gray-900/50 text-white px-4 py-2.5 rounded-xl border border-white/5 focus:border-blue-500/50 outline-none text-sm cursor-pointer hover:bg-gray-800 transition-colors appearance-none pr-8 relative"
                    >
                        <option value="15m">15m</option>
                        <option value="1h">1h</option>
                        <option value="1d">1D</option>
                        <option value="1wk">1W</option>
                    </select>

                    <button
                        onClick={handlePredict}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 hover-scale"
                    >
                        {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
                        {loading ? 'ANALYZING' : 'RUN'}
                    </button>
                </div>
            </div>

            {/* Premium Apple-Style Status Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 glass-panel rounded-3xl p-1 mb-10 overflow-hidden border-white/10 animate-slide-up">
                {[
                    {
                        label: 'Net P&L',
                        value: `₹${Math.round(performance?.total_pnl || 0).toLocaleString()}`,
                        change: performance ? `${((performance.total_pnl / performance.initial_balance) * 100).toFixed(2)}% ROI` : 'Calculated on load',
                        color: (performance?.total_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400',
                        chart: <Sparkline data={sparklineData} color={(performance?.total_pnl || 0) >= 0 ? "#4ade80" : "#f87171"} />
                    },
                    {
                        label: 'Win Rate',
                        value: performance?.win_rate || '0.0%',
                        change: performance?.total_trades > 0 ? `${performance.total_trades} Closed Trades` : 'Awaiting data',
                        color: 'text-white',
                        chart: <Sparkline data={sparklineData} color="#3b82f6" />
                    },
                    {
                        label: 'Active Exposure',
                        value: `₹${Math.round(performance?.active_exposure || 0).toLocaleString()}`,
                        change: `${performance?.active_units || 0} Open Units`,
                        color: 'text-white',
                        chart: <Sparkline data={sparklineData} color="#a855f7" />
                    }
                ].map((stat, i) => (
                    <div key={i} className={`p-8 flex flex-col items-center justify-center relative ${i < 2 ? 'border-r border-white/5' : ''}`}>
                        <span className="caption mb-3">{stat.label}</span>
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col items-center">
                                <h2 className={`text-3xl font-mono font-bold tracking-tighter ${stat.color}`}>{stat.value}</h2>
                                <span className="text-[10px] font-bold text-gray-500 mt-2 flex items-center gap-1.5">
                                    {stat.change}
                                </span>
                            </div>
                            <div className="hidden lg:block">
                                {stat.chart}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Neural Consensus Card - Premium Redesign */}
                <div className="col-span-12 lg:col-span-8 glass-panel rounded-[2.5rem] p-10 relative overflow-hidden flex flex-col justify-between min-h-[400px] animate-slide-up stagger-1">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-12 animate-slide-up">
                            <div>
                                <p className="text-blue-500 text-[10px] font-black uppercase tracking-[4px] mb-2">Neural Consensus Engine</p>
                                <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40">Alpha Inference</h1>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest mb-1">Confidence Score</p>
                                <p className="text-3xl font-mono font-bold text-white">{(displayData.confidence * 100).toFixed(1)}%</p>
                            </div>
                        </div>

                        {/* Horizontal Confidence Spectrum */}
                        <div className="space-y-6 mb-12">
                            <div className="h-12 w-full rounded-2xl bg-gradient-to-r from-red-500/40 via-yellow-500/40 to-green-500/40 p-[1px] relative">
                                <div className="absolute inset-0 bg-gray-950/40 rounded-2xl backdrop-blur-sm" />
                                <div className="absolute inset-0 flex items-center px-8 justify-between opacity-30">
                                    <span className="text-[9px] font-black text-white uppercase italic">Bearish</span>
                                    <span className="text-[9px] font-black text-white uppercase italic">Neutral Vector</span>
                                    <span className="text-[9px] font-black text-white uppercase italic">Bullish</span>
                                </div>

                                {/* Movement Indicator */}
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 w-1 h-16 bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)] z-20 transition-all duration-1000 ease-out flex items-center justify-center cursor-pointer group"
                                    style={{ left: `${(displayData.confidence * 100)}%` }}
                                >
                                    <div className="w-4 h-4 rounded-full bg-white shadow-xl shadow-white/20" />
                                    <div className="absolute -top-10 bg-white text-gray-950 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                        LTP Locked
                                    </div>
                                </div>
                            </div>

                            {/* Probability/Payoff Curve */}
                            <div className="h-48 w-full relative z-10 -mt-4 mb-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={displayData.payoff_graph || []}>
                                        <defs>
                                            <linearGradient id="payoffGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                                        <XAxis
                                            dataKey="spot"
                                            hide
                                        />
                                        <YAxis
                                            hide
                                            domain={['auto', 'auto']}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }}
                                            itemStyle={{ color: '#fff' }}
                                            labelStyle={{ display: 'none' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="profit"
                                            stroke="#3b82f6"
                                            fillOpacity={1}
                                            fill="url(#payoffGradient)"
                                            strokeWidth={3}
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="flex justify-between items-center">
                                <p className="text-xs text-gray-500 font-medium italic">
                                    "{displayData.reasoning || "Analyzing institutional sentiment for directional bias..."}"
                                </p>
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-blue-500 uppercase">Real-time Stream</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-6">
                            <div>
                                <p className="text-[9px] font-black text-gray-600 uppercase mb-0.5">Vector Status</p>
                                <p className={`text-xs font-bold ${data ? 'text-green-400' : 'text-gray-400'}`}>
                                    {data ? 'Stream Synchronized' : 'Initialization Mode'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-gray-600 uppercase mb-0.5">Latency</p>
                                <p className="text-xs font-bold text-blue-400 font-mono">{latency}ms</p>
                            </div>
                        </div>
                        <button
                            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-[10px] font-black text-white uppercase tracking-widest transition-all"
                            onClick={() => alert("Model Weights access restricted. (Enterprise Plan Required)")}
                        >
                            View Model Weights
                        </button>
                    </div>
                </div>

                {/* Radar Analysis Card - Refined */}
                <div className="col-span-12 lg:col-span-4 glass-panel rounded-[2.5rem] p-10 flex flex-col relative overflow-hidden animate-slide-up stagger-2">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <Activity size={20} />
                        </div>
                        <h3 className="headline">Radar Analysis</h3>
                    </div>

                    <div className="space-y-8 flex-1">
                        {[
                            { label: 'RSI (14)', value: displayData.rsi, type: 'progress', color: 'text-blue-400' },
                            { label: 'Volatility Ratio', value: displayData.vol_ratio, type: 'text', color: 'text-green-400' },
                            { label: 'MACD (Hist)', value: displayData.macd, type: 'text', color: 'text-white' },
                            { label: 'Trend Strength', value: trendStrength, type: 'progress', color: 'text-blue-400' }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col gap-3">
                                <div className="flex justify-between items-center caption">
                                    {item.label}
                                    {item.type !== 'progress' && <span className={`font-mono font-bold ${item.color}`}>{item.value}</span>}
                                </div>
                                {item.type === 'progress' && (
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative">
                                        <div
                                            className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                                            style={{ width: `${item.value}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => setIsAuditOpen(true)}
                        className="w-full py-4 mt-10 rounded-2xl bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] transition-all font-bold text-[10px] uppercase tracking-[2px] flex items-center justify-center gap-2 group hover-press"
                    >
                        <Maximize2 size={12} className="group-hover:rotate-12 transition-transform" />
                        Full Technical Audit
                    </button>
                </div>

                {/* Trading Terminal - Span 4 */}
                <div className="col-span-12 lg:col-span-4">
                    <TradingTerminal
                        symbol={symbol}
                        currentPrice={displayData.current_price}
                        onTradeSuccess={() => {
                            refreshData();
                            refreshHistory();
                        }}
                    />
                </div>

                {/* HFT Risk Engine - Full Width Enhanced (data-driven from hft_risk) */}
                <div className="col-span-12 glass-panel rounded-[3rem] p-1 items-center bg-gradient-to-r from-blue-500/20 via-purple-500/10 to-transparent animate-slide-up stagger-3">
                    <div className="bg-gray-950/40 backdrop-blur-xl rounded-[2.9rem] p-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                            <div>
                                <h1 className="text-4xl font-bold tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">HFT Risk Management</h1>
                                <p className="text-gray-500 font-medium">Auto-adaptive risk parameters synchronized with broker APIs.</p>
                            </div>
                            <div className="glass-panel px-6 py-3 rounded-2xl flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse" />
                                    <span className="text-xs font-black tracking-widest text-white uppercase">Engine Live</span>
                                </div>
                                <div className="w-px h-4 bg-white/10" />
                                <span className="text-xs font-mono font-bold text-blue-400 italic">Connected</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                {
                                    label: 'Kelly Position',
                                    value: `₹${Math.round(displayData?.hft_risk?.risk_amount || 0).toLocaleString()}`,
                                    desc: displayData.confidence > 0.6 ? 'Aggressive Allocation (Kelly+)' : 'Conserved Allocation (Kelly-)',
                                    color: 'text-blue-400'
                                },
                                {
                                    label: 'Risk Units',
                                    value: `${displayData?.hft_risk?.quantity || 0}`,
                                    desc: `Exposure adjusted for ${displayData.rsi < 30 ? 'Oversold' : displayData.rsi > 70 ? 'Overbought' : 'Neutral'} state`,
                                    color: 'text-white'
                                },
                                {
                                    label: 'Stop Loss',
                                    value: displayData?.hft_risk?.stop_loss ? `₹${displayData.hft_risk.stop_loss.toLocaleString()}` : 'N/A',
                                    desc: 'Dynamic ATR Protection',
                                    color: 'text-red-400'
                                },
                                {
                                    label: 'Take Profit',
                                    value: displayData?.hft_risk?.take_profit ? `₹${displayData.hft_risk.take_profit.toLocaleString()}` : 'N/A',
                                    desc: 'Smart Target Locked',
                                    color: 'text-green-400'
                                }
                            ].map((risk, i) => (
                                <div key={i} className="flex flex-col gap-2 p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{risk.label}</p>
                                    <div className={`text-3xl font-mono font-bold leading-none ${risk.color}`}>{risk.value}</div>
                                    <p className="text-[10px] text-gray-600 font-bold">{risk.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Open Positions Widget - Span 12 */}
                {activeTrades.length > 0 && (
                    <div className="col-span-12 glass-panel rounded-[2.5rem] p-10 border-white/5 mb-8">
                        <div className="flex justify-between items-end mb-10">
                            <div>
                                <h3 className="text-2xl font-bold mb-1">Active Vectors</h3>
                                <p className="text-gray-500 text-sm">Real-time exposure across selected markets.</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-[10px] font-black uppercase tracking-[2px] text-gray-600 border-b border-white/5">
                                        <th className="pb-6 pl-4">Instrument</th>
                                        <th className="pb-6">Strategy</th>
                                        <th className="pb-6">Side</th>
                                        <th className="pb-6">Entry</th>
                                        <th className="pb-6 text-right pr-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeTrades.map((trade, i) => (
                                        <tr key={i} className="group hover:bg-white/[0.02] transition-colors border-b border-white/5">
                                            <td className="py-6 pl-4">
                                                <div className="text-sm font-bold text-white uppercase tracking-tighter">{trade.symbol}</div>
                                                <div className="text-[10px] text-gray-500 font-bold tracking-widest font-mono uppercase">QUANTITY: {trade.quantity}</div>
                                            </td>
                                            <td className="py-6">
                                                <span className="text-[10px] font-black px-3 py-1 rounded-full bg-white/5 border border-white/5 text-gray-400 uppercase">
                                                    {trade.strategy || "MANUAL"}
                                                </span>
                                            </td>
                                            <td className="py-6">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${trade.side === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                                                    {trade.side}
                                                </span>
                                            </td>
                                            <td className="py-6">
                                                <div className="text-sm font-mono font-bold text-white">₹{trade.entry_price.toLocaleString()}</div>
                                            </td>
                                            <td className="py-6 text-right pr-4">
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm(`Are you sure you want to close ${trade.symbol}?`)) {
                                                            const tid = trade.id || trade._id;
                                                            if (!tid) {
                                                                alert("Critical Error: Trade ID missing");
                                                                return;
                                                            }
                                                            try {
                                                                await closeTrade(tid);
                                                                refreshData();
                                                            } catch (err) {
                                                                alert("Closure failed: " + (err.response?.data?.detail || err.message));
                                                            }
                                                        }
                                                    }}
                                                    className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-lg text-[10px] font-black transition-all"
                                                >
                                                    CLOSE
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Performance History - Span 12 */}
                <div className="col-span-12 glass-panel rounded-[2.5rem] p-10 border-white/5">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h3 className="text-2xl font-bold mb-1">Alpha Stream</h3>
                            <p className="text-gray-500 text-sm">Real-time execution log and performance attribution.</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate('/history')}
                                className="px-5 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all"
                            >
                                Journal Full Audit
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto mask-fade-right">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-[10px] font-black uppercase tracking-[2px] text-gray-600 border-b border-white/5 transition-premium">
                                    <th className="pb-6 pl-4">Timestamp</th>
                                    <th className="pb-6">Instrument</th>
                                    <th className="pb-6">Strategy</th>
                                    <th className="pb-6">Side</th>
                                    <th className="pb-6 text-right pr-4">P&L Attribution</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tradeHistory.length > 0 ? tradeHistory.slice(0, 5).map((trade, i) => (
                                    <tr key={i} className="group hover:bg-white/[0.02] transition-colors border-b border-white/5">
                                        <td className="py-6 pl-4">
                                            <div className="text-xs font-mono font-bold text-gray-400">
                                                {new Date(trade.exit_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="text-[9px] text-gray-600 font-bold">
                                                {new Date(trade.exit_timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="py-6">
                                            <div className="text-sm font-bold text-white uppercase tracking-tighter">{trade.symbol}</div>
                                            <div className="text-[10px] text-gray-500 font-bold tracking-widest font-mono uppercase">{trade.status}</div>
                                        </td>
                                        <td className="py-6">
                                            <span className="text-[10px] font-black px-3 py-1 rounded-full bg-white/5 border border-white/5 text-gray-400 uppercase">
                                                {trade.strategy}
                                            </span>
                                        </td>
                                        <td className="py-6">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${trade.side === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                                                {trade.side}
                                            </span>
                                        </td>
                                        <td className="py-6 text-right pr-4">
                                            <div className={`text-sm font-mono font-bold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {trade.pnl >= 0 ? '+' : '-'}₹{Math.abs(trade.pnl).toLocaleString()}
                                            </div>
                                            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">REALIZED ALPHA</div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center text-gray-600 font-mono text-[10px] uppercase tracking-widest opacity-50">
                                            Awaiting Vector Stream Initialization...
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <footer className="text-center pt-20">
                <p className="text-[10px] text-gray-700 font-black uppercase tracking-[5px]">
                    TradeX Intelligence System • Powered by Quantum Strategy Group
                </p>
            </footer>

            <TechnicalAuditModal
                isOpen={isAuditOpen}
                onClose={() => setIsAuditOpen(false)}
                data={displayData}
                symbol={symbol}
            />
        </div>
    );
};

export default Dashboard;
