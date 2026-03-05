import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Zap, Globe, Cpu, Save, RefreshCcw, Sliders, AlertTriangle } from 'lucide-react';

const Settings = () => {
    const [hftConfig, setHftConfig] = useState({
        simulationMode: true,
        slippage: 0.01,
        maxLeverage: 5,
        emergencyHalt: false,
        apiLatency: 45
    });

    const [riskParams, setRiskParams] = useState({
        dailyLossLimit: 20000,
        maxExposurePerVector: 50000,
        volatilityFilter: true
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
                    Vector <span className="text-blue-500">Control</span>
                </h1>
                <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-1">
                    HFT Core Configuration & Governance
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Settings - Span 8 */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    {/* Execution Engine */}
                    <div className="glass-card rounded-[2.5rem] p-8 border-white/5">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                <Cpu size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Execution Engine (SOR)</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Simulation Mode</label>
                                    <button
                                        onClick={() => setHftConfig({ ...hftConfig, simulationMode: !hftConfig.simulationMode })}
                                        className={`w-12 h-6 rounded-full transition-all relative ${hftConfig.simulationMode ? 'bg-blue-500 shadow-lg shadow-blue-500/30' : 'bg-white/10'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${hftConfig.simulationMode ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-600 leading-relaxed font-mono uppercase tracking-tighter">
                                    Bypass live exchange routing and execute using internal liquidity models.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Slippage Tolerance</label>
                                    <span className="font-mono text-xs font-bold text-blue-400">{hftConfig.slippage}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.01" max="1.0" step="0.01"
                                    value={hftConfig.slippage}
                                    onChange={(e) => setHftConfig({ ...hftConfig, slippage: parseFloat(e.target.value) })}
                                    className="w-full accent-blue-500 bg-white/5"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Risk Governance */}
                    <div className="glass-card rounded-[2.5rem] p-8 border-white/5">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
                                <Shield size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Risk Governance</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Daily Loss Cap</label>
                                    <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/5 rounded-xl font-mono text-sm font-bold text-white">
                                        ₹ <input type="number" value={riskParams.dailyLossLimit} onChange={(e) => setRiskParams({ ...riskParams, dailyLossLimit: e.target.value })} className="bg-transparent focus:outline-none w-full" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Max Vector Exposure</label>
                                    <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/5 rounded-xl font-mono text-sm font-bold text-white">
                                        ₹ <input type="number" value={riskParams.maxExposurePerVector} onChange={(e) => setRiskParams({ ...riskParams, maxExposurePerVector: e.target.value })} className="bg-transparent focus:outline-none w-full" />
                                    </div>
                                </div>
                                <div className="flex flex-col justify-end pb-1">
                                    <button className="w-full py-3 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                        Emergency Kill Switch
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Span 4 */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    <div className="glass-card rounded-[2.5rem] p-8 border-white/5 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
                        <h3 className="text-lg font-bold text-white uppercase tracking-tighter mb-6">System Integrity</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500 font-bold uppercase tracking-widest">Core Latency</span>
                                <span className="text-green-400 font-mono font-bold">45ms</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500 font-bold uppercase tracking-widest">Heartbeat Status</span>
                                <span className="text-green-400 font-bold uppercase">Nominal</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500 font-bold uppercase tracking-widest">ML Drift</span>
                                <span className="text-yellow-500 font-mono font-bold">0.02%</span>
                            </div>
                            <button className="w-full mt-4 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-200 transition-all shadow-xl shadow-white/5">
                                <Save size={14} />
                                Synchronize Config
                            </button>
                        </div>
                    </div>

                    <div className="p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] flex items-start gap-4">
                        <AlertTriangle className="text-yellow-500 shrink-0" size={24} />
                        <div>
                            <h4 className="text-xs font-black text-white uppercase tracking-tighter mb-1">Audit Mode Required</h4>
                            <p className="text-[10px] text-gray-500 leading-relaxed font-medium">All configuration changes are logged for institutional compliance (Algo 13.1).</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
