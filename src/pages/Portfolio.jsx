import React from 'react';
import { closeTrade } from '../api/index';
import { useData } from '../context/DataContext';
import { Briefcase, TrendingUp, TrendingDown, Target, Zap, AlertCircle } from 'lucide-react';
import LoadingScreen from '../components/shared/LoadingScreen';

const Portfolio = () => {
    const { activeTrades, performance, loading, refreshData } = useData();

    const handleCloseTrade = async (tradeId) => {
        try {
            await closeTrade(tradeId);
            refreshData();
        } catch (err) {
            alert("Failed to close trade: " + (err.response?.data?.detail || err.message));
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <div className="min-h-screen pt-32 pb-20 px-10 animate-fade-in">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex justify-between items-end mb-16">
                    <div>
                        <h1 className="text-6xl font-black text-white tracking-tighter mb-4">LIVE <span className="text-blue-500">PORTFOLIO</span></h1>
                        <p className="text-gray-500 font-bold uppercase tracking-[4px] text-xs">Sector-Weighted Institutional Exposure</p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-3 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Market Connected</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Last Sync: {performance?.server_time || '--:--:--'}</p>
                            <button onClick={refreshData} className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/5 text-[9px] font-black text-gray-400 uppercase tracking-widest transition-all">
                                Refund
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    <div className="glass-card rounded-3xl p-6 border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Briefcase size={64} className="text-blue-400" />
                        </div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Exposure</p>
                        <h2 className="text-3xl font-black font-mono text-white tracking-tighter">
                            ₹{Math.round(performance?.active_exposure || 0).toLocaleString()}
                        </h2>
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <Zap size={12} className={performance?.active_exposure > 0 ? "text-yellow-500" : "text-gray-600"} />
                            <span>{performance?.active_exposure > 0 ? "Risk utilization active" : "Risk engine standby"}</span>
                        </div>
                    </div>

                    <div className="glass-card rounded-3xl p-6 border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp size={64} className="text-green-400" />
                        </div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Unrealized P&L</p>
                        <h2 className={`text-3xl font-black font-mono tracking-tighter ${(performance?.unrealized_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {(performance?.unrealized_pnl || 0) >= 0 ? '+' : ''}₹{Math.round(performance?.unrealized_pnl || 0).toLocaleString()}
                        </h2>
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-green-400/80 uppercase tracking-widest">
                            <TrendingUp size={12} />
                            <span>{Math.abs(performance?.unrealized_pnl || 0) > 0 ? "Drift Analysis Active" : "Zero Variance State"}</span>
                        </div>
                    </div>

                    <div className="glass-card rounded-3xl p-6 border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Target size={64} className="text-purple-400" />
                        </div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Active Clusters</p>
                        <h2 className="text-3xl font-black font-mono text-white tracking-tighter">
                            {performance?.active_units || 0} Units
                        </h2>
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-purple-400/80 uppercase tracking-widest">
                            <AlertCircle size={12} />
                            <span>{performance?.active_units > 0 ? "Sector clusters diversified" : "No active clusters"}</span>
                        </div>
                    </div>
                </div>

                <div className="glass-panel rounded-[2.5rem] overflow-hidden border-white/5 p-1">
                    <div className="bg-gray-950/50 p-8 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-xl font-bold tracking-tight">Open Infrastructure</h3>
                        <div className="flex items-center gap-4">
                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest font-mono">Last Sync: {performance?.server_time || '--:--:--'}</span>
                        </div>
                    </div>
                    <table className="w-full">
                        <thead className="bg-white/[0.02]">
                            <tr>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">Instrument</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">Strategy</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">Side</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">Quantity</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">Avg Price</th>
                                <th className="px-8 py-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">Mkt Value</th>
                                <th className="px-8 py-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {activeTrades.length > 0 ? (
                                activeTrades.map((trade, idx) => (
                                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                                                    <span className="text-[10px] font-black text-blue-400">{trade.symbol.substring(0, 2)}</span>
                                                </div>
                                                <span className="font-black text-white tracking-tight">{trade.symbol}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-[10px] font-bold px-2 py-1 rounded bg-white/5 text-gray-400 uppercase tracking-wider">
                                                {trade.strategy}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded ${trade.side === 'BUY' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                                                {trade.side}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 font-mono text-sm font-bold text-gray-300">{trade.quantity}</td>
                                        <td className="px-8 py-5 font-mono text-sm font-bold text-gray-300">₹{(trade.current_price || trade.entry_price).toLocaleString()}</td>
                                        <td className="px-8 py-5 text-right font-mono text-sm font-bold text-white">
                                            ₹{((trade.current_price || trade.entry_price) * trade.quantity).toLocaleString()}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(`Are you sure you want to close ${trade.symbol}?`)) {
                                                        const tid = trade.id || trade._id;
                                                        if (!tid) {
                                                            alert("Critical Error: Trade ID missing from UI data");
                                                            return;
                                                        }
                                                        handleCloseTrade(tid);
                                                    }
                                                }}
                                                className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-lg text-[10px] font-black transition-all"
                                            >
                                                CLOSE
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-4 bg-white/5 rounded-full text-gray-700">
                                                <Briefcase size={32} />
                                            </div>
                                            <p className="text-sm font-bold text-gray-600 uppercase tracking-widest">No Active Vectors Detected</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
};

export default Portfolio;
