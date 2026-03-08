import api, { getTradeHistory } from '../api/index';
import { Download, Search, Filter, History, ArrowUpRight, ArrowDownRight, Printer, Share2 } from 'lucide-react';
import LoadingScreen from '../components/shared/LoadingScreen';

const HistoryPage = () => {
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await getTradeHistory();
                setTrades(res.data);
            } catch (err) {
                console.error("Failed to fetch history:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const handleExport = async () => {
        try {
            const response = await api.get('/trades/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `alpha_stream_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Export failed:", err);
        }
    };

    const filteredTrades = trades.filter(trade =>
        (trade.symbol || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trade.strategy || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <LoadingScreen message="Reconstructing execution timeline..." />;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
                        Alpha <span className="text-blue-500">Stream</span>
                    </h1>
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-1">
                        Audited Institutional Execution Log
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="px-6 py-3 bg-blue-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/20"
                    >
                        <Download size={14} />
                        Export CSV
                    </button>
                    <button className="p-3 bg-white/5 border border-white/5 rounded-xl text-gray-400 hover:text-white transition-all">
                        <Printer size={16} />
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-blue-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="SEARCH BY VECTOR OR OPERATIONAL STRATEGY..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all font-mono uppercase tracking-widest"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="px-6 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 hover:text-white transition-all">
                        <Filter size={14} />
                        Filters
                    </button>
                </div>
            </div>

            {/* History Table */}
            <div className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/2">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Exit Timestamp</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Vector</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Framework</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Side</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Net Realized</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Metrics</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredTrades.length > 0 ? (
                                filteredTrades.map((trade, idx) => (
                                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-white font-mono text-sm font-bold tracking-tight">
                                                    {new Date(trade.exit_timestamp).toLocaleDateString()}
                                                </span>
                                                <span className="text-[10px] text-gray-500 font-mono">
                                                    {new Date(trade.exit_timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-blue-500/30 transition-all">
                                                    <span className="text-[10px] font-black text-blue-400">{trade.symbol.substring(0, 3)}</span>
                                                </div>
                                                <span className="font-black text-white/90 uppercase tracking-tighter">{trade.symbol}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-gray-400 uppercase tracking-widest border border-white/5">
                                                {trade.strategy}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`flex items-center gap-1.5 text-[10px] font-black ${trade.side === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                                                {trade.side === 'BUY' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                <span className="uppercase tracking-widest">{trade.side}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`font-mono text-sm font-black tracking-tighter ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {trade.pnl >= 0 ? '+' : '-'}₹{Math.abs(trade.pnl).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2 hover:bg-white/5 rounded-lg transition-all text-gray-600 hover:text-white">
                                                <Share2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-6 opacity-40">
                                            <History size={48} className="text-gray-400" />
                                            <p className="text-xs font-black text-gray-500 uppercase tracking-[0.3em]">No Historical Data Found in Stream</p>
                                        </div>
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

export default HistoryPage;
