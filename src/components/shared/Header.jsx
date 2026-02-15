import React from 'react';
import { Bell, Search, Menu, Command } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
    return (
        <header className="glass-panel h-20 px-8 flex items-center justify-between sticky top-0 z-40 mb-6 border-b-0 border-white/5 mt-4 mx-6 rounded-2xl">
            <div className="flex items-center gap-4 lg:hidden">
                <button
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                >
                    <Menu className="w-5 h-5 text-gray-400" />
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white">TradeX</span>
                </div>
            </div>

            {/* Modern Search Bar */}
            <div className="hidden md:flex items-center relative group w-96">
                <Search className="w-4 h-4 absolute left-3.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                    type="text"
                    placeholder="Search markets, assets, or news..."
                    className="w-full pl-10 pr-12 py-2.5 glass-input text-gray-300 placeholder-gray-600 focus:placeholder-gray-500 focus:w-full transition-all"
                />
                <div className="absolute right-3 flex items-center gap-1 text-[10px] text-gray-600 border border-gray-700 rounded px-1.5 py-0.5">
                    <Command className="w-3 h-3" />
                    <span>K</span>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Notifications */}
                <div className="flex items-center gap-2">
                    <button className="p-2.5 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-all relative group">
                        <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-gray-900 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                    </button>
                </div>

                <div className="h-6 w-px bg-white/10 hidden md:block"></div>

                {/* Profile */}
                <div className="flex items-center gap-3 cursor-pointer group p-1.5 pr-3 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/5">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 p-[1px]">
                            <div className="w-full h-full rounded-[11px] bg-gray-900 flex items-center justify-center relative overflow-hidden">
                                {/* Avatar Placeholder */}
                                <span className="font-bold text-sm bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">VS</span>
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full border border-gray-900"></div>
                        </div>
                    </div>

                    <div className="hidden md:block">
                        <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">Vishnu P.</p>
                        <p className="text-[11px] text-gray-500 font-medium">Pro Plan</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
