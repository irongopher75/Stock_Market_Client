import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyHistory } from '../api/index';
import { Zap, TrendingUp, TrendingDown, Clock, BarChart2, ShieldCheck, ExternalLink } from 'lucide-react';
import LoadingScreen from '../components/shared/LoadingScreen';

const Signals = () => {
    const navigate = useNavigate();
    const [signals, setSignals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        const fetchSignals = async () => {
            try {
                const res = await getMyHistory();

                // Deduplicate signals: Keep only the freshest signal per symbol
                // This handles legacy duplicate data in the DB gracefully.
                const uniqueMap = new Map();
                res.data.forEach(item => {
                    const symbol = item.symbol.toUpperCase();
                    // Since history is sorted by timestamp DESC, the first one we find is the freshest
                    if (!uniqueMap.has(symbol)) {
                        uniqueMap.set(symbol, {
                            ...item,
                            prediction: item.prediction || item.predicted_direction,
                            confidence: item.confidence !== undefined ? item.confidence : item.confidence_score,
                            strategy: item.strategy || item.suggested_strategy,
                            reasoning: item.reasoning || item.suggested_strategy,
                            interval: item.interval || '1h'
                        });
                    }
                });

                setSignals(Array.from(uniqueMap.values()));
            } catch (err) {
                console.error("Failed to fetch signals:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSignals();
    }, []);

    const filteredSignals = filter === 'ALL'
        ? signals
        : signals.filter(s => s.prediction === filter);

    if (loading) return <LoadingScreen message="Decrypting institutional signal stream..." />;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Signals Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
                        Live <span className="text-yellow-500">Signals</span>
                    </h1>
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-1">
                        Ultra-Low Latency Predictive Vectors
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
                    {['ALL', 'BULLISH', 'BEARISH', 'NEUTRAL'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f
                                ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                                : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Signal Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredSignals.length > 0 ? (
                    filteredSignals.map((signal, idx) => (
                        <div key={idx} className="glass-card rounded-[2rem] p-8 border-white/5 relative overflow-hidden group hover:border-yellow-500/30 transition-all duration-500">
                            {/* Visual Glow */}
                            <div className={`absolute -top-24 -right-24 w-48 h-48 blur-[80px] opacity-10 transition-opacity group-hover:opacity-20 ${signal.prediction === 'BULLISH' ? 'bg-green-500' :
                                signal.prediction === 'BEARISH' ? 'bg-red-500' : 'bg-blue-500'
                                }`} />

                            <div className="flex justify-between items-start relative z-10">
                                <div className="flex gap-4 items-center">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${signal.prediction === 'BULLISH' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                        signal.prediction === 'BEARISH' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                            'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                        }`}>
                                        <Zap size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">{signal.symbol}</h3>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                                            <Clock size={10} />
                                            <span>{new Date(signal.timestamp).toLocaleString()}</span>
                                            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 ml-2">{signal.interval}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-xs font-black uppercase tracking-widest mb-1 ${signal.prediction === 'BULLISH' ? 'text-green-400' :
                                        signal.prediction === 'BEARISH' ? 'text-red-400' : 'text-blue-400'
                                        }`}>
                                        {signal.prediction}
                                    </div>
                                    <div className="text-2xl font-black font-mono text-white tracking-tighter">
                                        {(signal.confidence * 100).toFixed(1)}% <span className="text-[10px] text-gray-500 uppercase tracking-widest">Conf.</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 space-y-4 relative z-10">
                                <p className="text-gray-400 text-sm italic leading-relaxed">
                                    "{signal.reasoning}"
                                </p>

                                <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Strike Recommendation</span>
                                        <span className="text-xs font-bold text-white uppercase">{signal.strike || 'ATM'} {signal.option_type || 'N/A'}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 items-end">
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Verification Status</span>
                                        <div className="flex items-center gap-1.5 text-green-400 text-[10px] font-black">
                                            <ShieldCheck size={12} />
                                            <span className="tracking-widest uppercase">CONSOLIDATED</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/stock/${signal.symbol}`)}
                                className="w-full mt-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 hover:border-white/20 transition-all group-hover:translate-y-0 translate-y-2 opacity-0 group-hover:opacity-100 duration-300">
                                <ExternalLink size={12} />
                                View Technical Chart
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-32 text-center">
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-gray-700 animate-pulse">
                                <Zap size={40} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Awaiting Alpha Vectors</h3>
                                <p className="text-gray-600 font-mono text-xs uppercase mt-2">No signals currently traversing the network.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Signals;
