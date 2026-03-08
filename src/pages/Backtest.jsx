import React, { useState, useEffect } from 'react';
import { runBacktest, getBacktestHistory } from '../api/index';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    Play, History, TrendingUp, AlertTriangle, Activity, Target,
    ArrowUpRight, ArrowDownRight, Zap
} from 'lucide-react';
import { useData } from '../context/DataContext';
import LoadingScreen from '../components/shared/LoadingScreen';

const Backtest = () => {
    const { activeSymbol: symbol, setActiveSymbol: setSymbol } = useData();
    const [period, setPeriod] = useState('1y');
    const [interval, setInterval] = useState('1d');
    const [capital, setCapital] = useState(100000);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await getBacktestHistory();
            setHistory(response.data);
        } catch (error) {
            console.error("Failed to fetch history:", error);
        }
    };

    const handleRunBacktest = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await runBacktest(symbol, period, interval, capital);
            setResults(response.data);
            fetchHistory(); // Refresh history
        } catch (error) {
            console.error("Backtest failed:", error);
            alert("Backtest failed. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    const stats = results ? [
        { label: 'Total Return', value: `${results.total_return}%`, icon: TrendingUp, color: 'text-green-400' },
        { label: 'Sharpe Ratio', value: results.sharpe_ratio, icon: Activity, color: 'text-blue-400' },
        { label: 'Sortino Ratio', value: results.sortino_ratio, icon: Zap, color: 'text-purple-400' },
        { label: 'Profit Factor', value: results.profit_factor, icon: Target, color: 'text-yellow-400' },
    ] : [];

    const equityData = results?.equity_curve ? results.equity_curve.map((val, idx) => ({
        index: idx,
        equity: val
    })) : [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
                        Strategy <span className="text-blue-500">Backtesting</span>
                    </h1>
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-1">
                        Vectorized Alpha Validation Engine
                    </p>
                </div>
                <div className="flex gap-2 mb-1">
                    <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                        Vectorized Engine Active
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Configuration Panel */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="glass-card rounded-[2rem] p-8 border-white/5 h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <Play size={20} className="text-blue-400" />
                            <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Parameters</h3>
                        </div>

                        <form onSubmit={handleRunBacktest} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Ticker Symbol</label>
                                <input
                                    type="text"
                                    value={symbol}
                                    onChange={(e) => setSymbol(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:border-blue-500/50 transition-all outline-none"
                                    placeholder="e.g. RELIANCE.NS"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Period</label>
                                    <select
                                        value={period}
                                        onChange={(e) => setPeriod(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:border-blue-500/50 transition-all outline-none appearance-none"
                                    >
                                        <option value="1mo" className="bg-[#0a0a0b]">1 Month</option>
                                        <option value="6mo" className="bg-[#0a0a0b]">6 Months</option>
                                        <option value="1y" className="bg-[#0a0a0b]">1 Year</option>
                                        <option value="2y" className="bg-[#0a0a0b]">2 Years</option>
                                        <option value="max" className="bg-[#0a0a0b]">Maximum</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Interval</label>
                                    <select
                                        value={interval}
                                        onChange={(e) => setInterval(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:border-blue-500/50 transition-all outline-none appearance-none"
                                    >
                                        <option value="15m" className="bg-[#0a0a0b]">15 Minutes</option>
                                        <option value="1h" className="bg-[#0a0a0b]">1 Hour</option>
                                        <option value="1d" className="bg-[#0a0a0b]">1 Day</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Initial Capital</label>
                                <input
                                    type="number"
                                    value={capital}
                                    onChange={(e) => setCapital(Number(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:border-blue-500/50 transition-all outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-premium flex items-center justify-center gap-3 mt-4 hover-scale ${loading
                                    ? 'bg-blue-500/20 text-blue-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] shadow-lg shadow-blue-500/20'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                        Processing Vector Data...
                                    </>
                                ) : (
                                    <>
                                        <Play size={16} fill="white" />
                                        Launch Simulation
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Results Panel */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    {/* Performance Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {(stats.length > 0 ? stats : [
                            { label: 'Total Return', value: '--', icon: TrendingUp, color: 'text-gray-600' },
                            { label: 'Sharpe Ratio', value: '--', icon: Activity, color: 'text-gray-600' },
                            { label: 'Sortino Ratio', value: '--', icon: Zap, color: 'text-gray-600' },
                            { label: 'Profit Factor', value: '--', icon: Target, color: 'text-gray-600' },
                        ]).map((stat, idx) => (
                            <div key={idx} className="glass-card rounded-3xl p-6 border-white/5 group transition-all">
                                <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 ${stat.color} w-fit mb-4`}>
                                    <stat.icon size={20} />
                                </div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                                <h2 className="text-2xl font-black font-mono text-white tracking-tighter mt-1">{stat.value}</h2>
                            </div>
                        ))}
                    </div>

                    {/* Equity Chart */}
                    <div className="glass-card rounded-[2.5rem] p-8 border-white/5 min-h-[400px] flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Simulation Equity Curve</h3>
                                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Growth Attribution Breakdown</p>
                            </div>
                            {results && (
                                <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[9px] font-black text-green-400 uppercase tracking-widest">
                                    Max DD: {results.max_drawdown}%
                                </div>
                            )}
                        </div>

                        <div className="flex-1 w-full min-h-[300px]">
                            {loading ? (
                                <div className="h-full w-full flex flex-col items-center justify-center opacity-50">
                                    <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest animate-pulse">Running Neural Simulation...</span>
                                </div>
                            ) : results ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={equityData}>
                                        <defs>
                                            <linearGradient id="backtestGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                        <XAxis hide dataKey="index" />
                                        <YAxis hide domain={['auto', 'auto']} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                            labelStyle={{ display: 'none' }}
                                            formatter={(value) => [`₹${value.toLocaleString()}`, "Equity"]}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="equity"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#backtestGradient)"
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full w-full flex flex-col items-center justify-center opacity-20 border-2 border-dashed border-white/10 rounded-3xl">
                                    <Activity size={48} className="text-gray-500 mb-4" />
                                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest">No Active Simulation Results</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="glass-card rounded-[2.5rem] p-8 border-white/5">
                <div className="flex items-center gap-3 mb-8">
                    <History size={20} className="text-purple-400" />
                    <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Previous Simulations</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">
                                <th className="pb-4">Timestamp</th>
                                <th className="pb-4">Symbol</th>
                                <th className="pb-4">Period</th>
                                <th className="pb-4">Return</th>
                                <th className="pb-4">Sharpe</th>
                                <th className="pb-4">Max DD</th>
                                <th className="pb-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {history.length > 0 ? history.map((run, idx) => (
                                <tr key={idx} className="group hover:bg-white/2 transition-all">
                                    <td className="py-4 font-mono text-xs text-gray-400">
                                        {new Date(run.timestamp).toLocaleString()}
                                    </td>
                                    <td className="py-4">
                                        <span className="text-sm font-black text-white">{run.symbol}</span>
                                    </td>
                                    <td className="py-4">
                                        <span className="text-[10px] px-2 py-1 bg-white/5 rounded text-gray-400 font-bold uppercase tracking-widest">{run.period} | {run.interval}</span>
                                    </td>
                                    <td className={`py-4 font-black ${run.metrics.total_return > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {run.metrics.total_return > 0 ? '+' : ''}{run.metrics.total_return}%
                                    </td>
                                    <td className="py-4 text-sm font-bold text-gray-300 font-mono">
                                        {run.metrics.sharpe_ratio}
                                    </td>
                                    <td className="py-4 text-sm font-bold text-red-400/70 font-mono">
                                        {run.metrics.max_drawdown}%
                                    </td>
                                    <td className="py-4 text-right">
                                        <button
                                            onClick={() => setResults(run.metrics)}
                                            className="text-[10px] font-black text-blue-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:text-blue-300"
                                        >
                                            View Report
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center opacity-30 text-xs font-bold uppercase tracking-widest">
                                        No simulation history found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Backtest;
