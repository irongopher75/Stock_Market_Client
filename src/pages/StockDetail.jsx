import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, TrendingUp, TrendingDown, Target, Zap,
    Activity, ShieldCheck, Clock, Wallet, BarChart3,
    Maximize2, ChevronRight, Info
} from 'lucide-react';
import { getPrediction } from '../api';
import TradingTerminal from '../components/dashboard/TradingTerminal';
import TechnicalAuditModal from '../components/dashboard/TechnicalAuditModal';
import LoadingScreen from '../components/shared/LoadingScreen';

const getExchangeInfo = (symbol) => {
    if (symbol?.endsWith('.BO')) return { label: 'BSE', currency: '₹' };
    if (symbol?.endsWith('.T')) return { label: 'TYO', currency: '¥' };
    if (symbol?.endsWith('.L')) return { label: 'LSE', currency: '£' };
    if (symbol?.includes('.') || (symbol?.length > 0 && !symbol.includes('.'))) {
        // Fallback or US (no suffix)
        if (!symbol.includes('.')) return { label: 'NASDAQ/NYSE', currency: '$' };
        if (symbol.endsWith('.NS')) return { label: 'NSE', currency: '₹' };
    }
    return { label: 'STOCK', currency: '₹' };
};

const StockDetail = () => {
    const { symbol } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuditOpen, setIsAuditOpen] = useState(false);
    const [interval, setInterval] = useState('1h');

    const fetchStockData = async () => {
        setLoading(true);
        try {
            const res = await getPrediction(symbol || 'RELIANCE', interval);
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStockData();
    }, [symbol, interval]);

    if (loading && !data) return <LoadingScreen />;

    return (
        <div className="min-h-screen bg-transparent p-4 md:p-8 animate-in fade-in duration-700">
            {/* Context Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 hover:bg-white/5 rounded-2xl border border-white/5 transition-all text-gray-400 hover:text-white"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-[3px] mb-1">
                            <Activity size={12} />
                            Institutional Vector
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
                            {symbol} <span className="text-blue-500/50">/ {getExchangeInfo(symbol).label}</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white/5 p-1 rounded-2xl border border-white/5">
                    {['15m', '1h', '4h', '1d'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setInterval(t)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${interval === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Main Stats Segment - Span 8 */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                    {/* Live Snapshot Card */}
                    <div className="glass-panel rounded-[2.5rem] p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden animate-slide-up">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />

                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[4px] mb-2">Current Market Price</p>
                            <div className="text-6xl font-mono font-bold text-white tracking-tighter mb-2">
                                {getExchangeInfo(symbol).currency}{data?.current_price?.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1 text-sm font-bold text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
                                    <TrendingUp size={14} /> +{data?.vol_ratio}%
                                </span>
                                <span className="text-xs text-gray-500 font-medium">vs Prev Close</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 relative z-10 min-w-[240px]">
                            <div>
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Neural Consensus</p>
                                <p className={`text-xl font-bold uppercase tracking-tight italic ${data?.prediction === 'BULLISH' ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    {data?.prediction}
                                </p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Inference Conf.</p>
                                <p className="text-xl font-mono font-bold text-blue-400">
                                    {(data?.confidence * 100).toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Integrated Analytics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up stagger-1">
                        <div className="glass-card rounded-[2rem] p-8 border-white/5">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <Zap size={16} className="text-blue-400" />
                                    Momentum Scan
                                </h3>
                                <div className="text-[10px] font-bold text-gray-500 bg-white/5 px-3 py-1 rounded-full">RSI: {data?.rsi}</div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                    <span>RSI Neutrality</span>
                                    <span className="text-white font-mono">{data?.rsi}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                                        style={{ width: `${data?.rsi}%` }}
                                    />
                                </div>
                                <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                                    Asset is currently trading in a {data?.rsi > 70 ? 'Overbought' : data?.rsi < 30 ? 'Oversold' : 'Balanced'} zone.
                                    Institutional POC detected at <span className="text-white font-mono">{getExchangeInfo(symbol).currency}{data?.poc}</span>.
                                </p>
                            </div>
                        </div>

                        <div className="glass-card rounded-[2rem] p-8 border-white/5">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-8">
                                <ShieldCheck size={16} className="text-green-400" />
                                Support & Resistance
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'Upper Band', val: data?.bb_upper, color: 'text-red-400' },
                                    { label: 'Pivot Mean', val: data?.sma_20, color: 'text-white' },
                                    { label: 'Lower Band', val: data?.bb_lower, color: 'text-green-400' }
                                ].map((band, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{band.label}</span>
                                        <span className={`text-xs font-mono font-bold ${band.color}`}>{getExchangeInfo(symbol).currency}{band.val?.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsAuditOpen(true)}
                        className="w-full py-6 glass-panel rounded-[2rem] border-blue-500/20 hover:border-blue-500/40 transition-all flex items-center justify-between px-10 group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Maximize2 size={20} className="text-white" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-black text-white uppercase tracking-widest">Full Technical Audit Report</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Access all 12+ Institutional Indicators</p>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-600 group-hover:text-blue-500 transition-colors" />
                    </button>
                </div>

                {/* Trading Sidebar - Span 4 */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 animate-slide-up stagger-2">
                    <TradingTerminal
                        symbol={symbol}
                        currentPrice={data?.current_price}
                        onTradeSuccess={() => console.log('Trade success from detail page')}
                    />

                    <div className="glass-card rounded-[2rem] p-8 border-white/5 flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                                <Target size={16} />
                            </div>
                            <h4 className="text-xs font-black text-white uppercase tracking-widest">Execution Edge</h4>
                        </div>
                        <p className="text-xl font-bold text-white font-mono leading-tight">
                            {data?.strategy}
                        </p>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-4">
                            <Info size={20} className="text-blue-400 shrink-0" />
                            <p className="text-[11px] text-gray-400 leading-relaxed italic">
                                "{data?.reasoning}"
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <TechnicalAuditModal
                isOpen={isAuditOpen}
                onClose={() => setIsAuditOpen(false)}
                data={data}
                symbol={symbol}
            />
        </div>
    );
};

export default StockDetail;
