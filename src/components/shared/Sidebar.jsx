import React from 'react';
import {
    Activity,
    TrendingUp,
    ChevronRight
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
    { icon: Activity, label: 'Dashboard', path: '/dashboard' },
    { icon: Activity, label: 'Live Signals', path: '/signals', badge: 'LIVE' },
    { icon: Activity, label: 'Portfolio', path: '/portfolio' },
    { icon: Activity, label: 'Analytics', path: '/analytics' },
    { icon: Activity, label: 'Backtesting', path: '/backtest' },
    { icon: Activity, label: 'History', path: '/history' },
    { icon: Activity, label: 'Settings', path: '/settings' },
];

const Sidebar = ({ isOpen, closeSidebar }) => {
    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 glass-panel border-r-0 lg:border-r border-white/5
        transform transition-all duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-screen
      `}>
                {/* Logo Area */}
                <div className="p-6 flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">
                            TradeX<span className="text-blue-500">.AI</span>
                        </h1>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse box-shadow-glow"></span>
                            <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">Systems Online</span>
                        </div>
                    </div>
                </div>

                {/* Equity Card */}
                <div className="px-6 mb-8">
                    <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <p className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider relative z-10">Total Equity</p>
                        <h3 className="text-2xl font-bold text-white font-mono mb-2 relative z-10">₹10,12,450</h3>
                        <div className="flex items-center gap-2 relative z-10">
                            <div className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                +1.24%
                            </div>
                            <span className="text-xs text-gray-500">Today</span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Menu</p>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={closeSidebar}
                            className={({ isActive }) => `
                  group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                                    ? 'bg-blue-600 shadow-lg shadow-blue-500/25 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }
                `}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={`w-[18px] h-[18px] transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`} />
                                <span>{item.label}</span>
                            </div>
                            {item.badge && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${isActive
                                        ? 'bg-white/20 text-white border-transparent'
                                        : 'bg-red-500/20 text-red-400 border-red-500/20 animate-pulse'
                                    }`}>
                                    {item.badge}
                                </span>
                            )}
                            <ChevronRight className={`w-4 h-4 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-6 border-t border-white/5">
                    <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 w-full transition-all group">
                        <Activity className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
