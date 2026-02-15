import React, { useState, useEffect } from 'react';
import { getPrediction, getMe, getMyHistory } from '../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, Activity, TrendingUp, AlertTriangle, Zap, Clock } from 'lucide-react';

const Dashboard = () => {
    const [symbol, setSymbol] = useState('NIFTY');
    const [interval, setInterval] = useState('1h');
    const [data, setData] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Mock Data for UI Dev / Fallback
    const mockData = {
        prediction: "NEUTRAL",
        reasoning: "Market data unavailable. Visualization mode enabled.",
        confidence: 0.00,
        current_price: 21543.50,
        rsi: 50,
        macd: 0.00,
        poc: 21540.00,
        sma_50: 21500.00,
        strike: "N/A",
        option_type: "-",
        payoff_graph: [
            { spot: 21400, profit: -100 },
            { spot: 21450, profit: -50 },
            { spot: 21500, profit: 0 },
            { spot: 21550, profit: 120 },
            { spot: 21600, profit: 250 }
        ],
        hft_risk: {
            risk_amount: 0,
            quantity: 0,
            stop_loss: 0,
            take_profit: 0
        }
    };

    const displayData = data || mockData;

    useEffect(() => {
        refreshHistory();
    }, []);

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
            const res = await getPrediction(symbol, interval);
            setData(res.data);
            refreshHistory();
        } catch (err) {
            console.error("Prediction failed, using mock data for UI");
        }
        setLoading(false);
    };

    // Helper for sentiment color
    const getSentimentColor = (sentiment) => {
        if (sentiment === 'BULLISH') return 'text-green-400 from-green-400 to-emerald-600';
        if (sentiment === 'BEARISH') return 'text-red-400 from-red-400 to-rose-600';
        return 'text-yellow-400 from-yellow-400 to-amber-600';
    };

    return (
        <div className="w-full pb-20 space-y-8">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome back, Vishnu 👋</h1>
                    <p className="text-gray-400">Market is <span className="text-green-400 font-medium">Open</span> • Volatility is <span className="text-yellow-400 font-medium">Moderate</span></p>
                </div>

                {/* Control Bar */}
                <div className="glass-panel p-2 rounded-xl flex items-center gap-2">
                    <div className="relative">
                        <input
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value)}
                            className="bg-gray-800/50 text-white pl-4 pr-12 py-2 rounded-lg border border-white/5 focus:border-blue-500/50 outline-none w-40 font-mono text-sm uppercase transition-all"
                            placeholder="SYMBOL"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-gray-500 font-bold">NSE</span>
                    </div>

                    <select
                        value={interval}
                        onChange={(e) => setInterval(e.target.value)}
                        className="bg-gray-800/50 text-white px-4 py-2 rounded-lg border border-white/5 focus:border-blue-500/50 outline-none text-sm appearance-none cursor-pointer hover:bg-gray-700/50 transition-colors"
                    >
                        <option value="15m">15m</option>
                        <option value="1h">1h</option>
                        <option value="1d">1D</option>
                        <option value="1wk">1W</option>
                    </select>

                    <button
                        onClick={handlePredict}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
                        {loading ? 'Analyzing...' : 'Run'}
                    </button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Market Sentiment Card */}
                <div className="glass-card p-0 rounded-2xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-30 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full opacity-50"></div>
                    <div className="p-6 relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full w-fit mb-4 backdrop-blur-sm border border-white/5">AI Sentiment</h3>
                                <div className={`text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${getSentimentColor(displayData.prediction)} tracking-tighter`}>
                                    {displayData.prediction}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Confidence</p>
                                <div className="text-3xl font-mono font-bold text-white">{(displayData.confidence * 100).toFixed(0)}%</div>
                            </div>
                        </div>

                        <div className="glass-panel p-4 rounded-xl border-l-4 border-blue-500/50">
                            <p className="text-sm text-gray-300 italic leading-relaxed">
                                "{displayData.reasoning || 'Analyzing market structure...'}"
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Technical Signals Card */}
                <div className="glass-card p-6 rounded-2xl relative">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-400" />
                            Technical Radar
                        </h3>
                        <span className="text-xs font-mono text-gray-500">{symbol} @ ₹{displayData.current_price.toLocaleString()}</span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-default group">
                            <span className="text-sm text-gray-400">RSI (14)</span>
                            <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${displayData.rsi > 70 ? 'bg-red-500' : displayData.rsi < 30 ? 'bg-green-500' : 'bg-blue-500'}`}
                                        style={{ width: `${displayData.rsi}%` }}
                                    ></div>
                                </div>
                                <span className="font-mono font-medium text-white min-w-[3ch]">{displayData.rsi}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-default">
                            <span className="text-sm text-gray-400">MACD</span>
                            <span className={`font-mono font-medium ${displayData.macd > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {displayData.macd > 0 ? '+' : ''}{displayData.macd}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-default">
                            <span className="text-sm text-gray-400">Trend (SMA 50)</span>
                            <span className={`text-sm font-medium flex items-center gap-1 ${displayData.current_price > displayData.sma_50 ? 'text-green-400' : 'text-red-400'}`}>
                                {displayData.current_price > displayData.sma_50 ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                                {displayData.current_price > displayData.sma_50 ? 'Bullish' : 'Bearish'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. Volatility / Payoff Chart */}
                <div className="glass-card p-6 rounded-2xl flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white">Payoff Projection</h3>
                        <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20 font-mono">
                            {displayData.strike} {displayData.option_type}
                        </span>
                    </div>
                    <div className="flex-1 min-h-[160px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={displayData.payoff_graph}>
                                <defs>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="spot" stroke="#6b7280" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis stroke="#6b7280" fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
                                <Line type="step" data={displayData.payoff_graph} dataKey={() => 0} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. HFT Risk Parameters - Full Width */}
                <div className="lg:col-span-3 glass-card rounded-2xl overflow-hidden border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)] relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>

                    <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <Zap className="w-6 h-6 text-yellow-500 fill-current animate-pulse" />
                                    HFT Risk Engine <span className="text-base font-normal text-gray-500 ml-2 font-mono">v3.0.1</span>
                                </h2>
                                <p className="text-gray-400 text-sm mt-1">Real-time position sizing and automated risk management</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-2 text-xs font-mono text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                    ACTIVE
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="bg-gray-900/50 p-6 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-colors group">
                                <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-2">Kelly Trade Size</p>
                                <div className="text-4xl font-mono font-bold text-white group-hover:text-blue-400 transition-colors">
                                    {(displayData.hft_risk?.risk_amount / 100).toFixed(1)}<span className="text-lg text-gray-500 ml-1">%</span>
                                </div>
                                <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                                    <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{ width: `${(displayData.hft_risk?.risk_amount / 100) * 10}%` }}></div>
                                    </div>
                                    of capital
                                </div>
                            </div>

                            <div className="bg-gray-900/50 p-6 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-colors">
                                <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-2">Positions</p>
                                <div className="text-4xl font-mono font-bold text-white">
                                    {displayData.hft_risk?.quantity}
                                </div>
                                <p className="mt-2 text-xs text-gray-400">Risk-weighted units</p>
                            </div>

                            <div className="bg-gray-900/50 p-6 rounded-2xl border border-white/5 hover:border-red-500/30 transition-colors relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 w-20 h-20 bg-red-500/10 blur-xl rounded-full"></div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3" />
                                    Stop Loss
                                </p>
                                <div className="text-3xl font-mono font-bold text-red-400">
                                    ₹{displayData.hft_risk?.stop_loss}
                                </div>
                                <p className="mt-2 text-xs text-gray-400">Dynamic ATR Trail</p>
                            </div>

                            <div className="bg-gray-900/50 p-6 rounded-2xl border border-white/5 hover:border-green-500/30 transition-colors relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 w-20 h-20 bg-green-500/10 blur-xl rounded-full"></div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
                                    <TrendingUp className="w-3 h-3" />
                                    Take Profit
                                </p>
                                <div className="text-3xl font-mono font-bold text-green-400">
                                    ₹{displayData.hft_risk?.take_profit}
                                </div>
                                <p className="mt-2 text-xs text-gray-400">Risk/Reward 1:1.5</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Signals Table */}
            <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    Recent Signals
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-700/50 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                                <th className="pb-4 pl-4">Time</th>
                                <th className="pb-4">Asset</th>
                                <th className="pb-4">Sentiment</th>
                                <th className="pb-4">Entry</th>
                                <th className="pb-4">Strategy</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {history.length > 0 ? history.map((h, i) => (
                                <tr key={i} className="group border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                                    <td className="py-4 pl-4 font-mono text-gray-400">
                                        {new Date(h.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="py-4 font-bold text-white group-hover:text-blue-400 transition-colors">{h.symbol}</td>
                                    <td className="py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wide ${h.predicted_direction === 'BULLISH' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                            {h.predicted_direction}
                                        </span>
                                    </td>
                                    <td className="py-4 font-mono text-white">₹{h.current_price.toFixed(2)}</td>
                                    <td className="py-4 text-gray-400">{h.suggested_strategy}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-gray-500 italic">
                                        No recent signals found. Market is quiet...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <footer className="text-center pt-8">
                <p className="text-[10px] text-gray-600 uppercase tracking-widest font-medium">
                    TradeX AI • HFT System v2.1 • Latency: 4ms
                </p>
            </footer>
        </div>
    );
};

export default Dashboard;
