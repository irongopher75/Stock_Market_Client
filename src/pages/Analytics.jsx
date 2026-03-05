import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Award, Activity, PieChart as PieIcon, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import LoadingScreen from '../components/shared/LoadingScreen';

const Analytics = () => {
    const { performance, tradeHistory, loading, systemConfig } = useData();
    const [equityData, setEquityData] = useState([]);

    useEffect(() => {
        if (!tradeHistory || tradeHistory.length === 0) return;

        let currentEquity = systemConfig?.initial_balance || 100000;
        const equityCurve = [...tradeHistory].reverse().map((trade) => {
            currentEquity += trade.pnl;
            return {
                date: new Date(trade.exit_timestamp).toLocaleDateString(),
                equity: currentEquity,
                pnl: trade.pnl
            };
        });
        setEquityData(equityCurve);
    }, [tradeHistory, systemConfig]);

    if (loading) return <LoadingScreen message="Synthesizing performance matrices..." />;

    const trendPercentage = systemConfig?.initial_balance
        ? ((performance?.total_pnl / systemConfig.initial_balance) * 100).toFixed(2)
        : 0;

    const stats = [
        { label: 'Total Net P&L', value: `₹${performance?.total_pnl?.toLocaleString()}`, icon: TrendingUp, color: 'text-green-400', trend: `${trendPercentage > 0 ? '+' : ''}${trendPercentage}%` },
        { label: 'Win Rate', value: performance?.win_rate, icon: Award, color: 'text-blue-400', trend: 'Stable' },
        { label: 'Total Trades', value: performance?.total_trades, icon: Activity, color: 'text-purple-400', trend: "Total" },
        { label: 'Profit Factor', value: performance?.profit_factor || '1.0', icon: PieIcon, color: 'text-yellow-400', trend: 'Optimal' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
                    Performance <span className="text-purple-500">Analytics</span>
                </h1>
                <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-1">
                    Quantum Attribution & Risk Matrices
                </p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="glass-card rounded-3xl p-6 border-white/5 group hover:border-white/10 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                                {stat.trend}
                            </span>
                        </div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                        <h2 className="text-2xl font-black font-mono text-white tracking-tighter mt-1">{stat.value}</h2>
                    </div>
                ))}
            </div>

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Equity Curve - Span 8 */}
                <div className="col-span-12 lg:col-span-8 glass-card rounded-[2.5rem] p-8 border-white/5 min-h-[450px] flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Equity Growth Curve</h3>
                            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Compounded Alpha Generation</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[9px] font-black text-green-400 uppercase tracking-widest">
                                High Water Mark Hit
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={equityData}>
                                <defs>
                                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 700 }}
                                    dy={10}
                                />
                                <YAxis
                                    hide
                                    domain={['auto', 'auto']}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                    labelStyle={{ color: '#6b7280', fontSize: '10px', marginBottom: '4px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="equity"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#equityGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Strategy Weight - Span 4 */}
                <div className="col-span-12 lg:col-span-4 glass-card rounded-[2.5rem] p-8 border-white/5 flex flex-col items-center justify-center text-center">
                    <h3 className="text-lg font-bold text-white uppercase tracking-tighter mb-2">Strategy Attribution</h3>
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-8 text-center px-4">Portfolio composition by alpha source</p>

                    <div className="w-full aspect-square relative transition-transform hover:scale-105 duration-500">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={performance?.strategy_breakdown || []}
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {(performance?.strategy_breakdown || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} stroke="none" />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Primary</span>
                            <span className="text-2xl font-black text-white tracking-tighter uppercase italic">Alpha</span>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                        {(performance?.strategy_breakdown || []).slice(0, 4).map((strat, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][idx % 5] }} />
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider truncate" title={strat.name}>
                                    {strat.name.split(' ')[0]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Risk Attribution */}
            <div className="glass-card rounded-[2.5rem] p-8 border-white/5">
                <div className="flex items-center gap-3 mb-6">
                    <Info size={20} className="text-blue-400" />
                    <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Quantum Risk Intelligence</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-6 bg-white/2 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Max Drawdown</p>
                        <div className="text-2xl font-black font-mono text-white tracking-tighter">{performance?.max_drawdown_pct || 0}%</div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-red-400" style={{ width: `${Math.min(performance?.max_drawdown_pct || 0, 100)}%` }} />
                        </div>
                    </div>
                    <div className="p-6 bg-white/2 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Sharpe Ratio</p>
                        <div className="text-2xl font-black font-mono text-white tracking-tighter">{performance?.sharpe_ratio || 0}</div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-green-400" style={{ width: `${Math.min((performance?.sharpe_ratio || 0) * 20, 100)}%` }} />
                        </div>
                    </div>
                    <div className="p-6 bg-white/2 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Recovery Factor</p>
                        <div className="text-2xl font-black font-mono text-white tracking-tighter">{performance?.recovery_factor || 0}</div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-blue-400 w-[68%]" style={{ width: `${Math.min((performance?.recovery_factor || 0) * 10, 100)}%` }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
