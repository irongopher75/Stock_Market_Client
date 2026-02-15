import React, { useState, useEffect } from 'react';
import { getPrediction, getMe, getMyHistory } from '../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [symbol, setSymbol] = useState('NIFTY');
    const [data, setData] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        refreshHistory();
    }, []);

    const refreshHistory = async () => {
        try {
            const res = await getMyHistory();
            setHistory(res.data);
        } catch (err) {
            console.error("Failed to load history", err);
        }
    };

    const handlePredict = async () => {
        setLoading(true);
        try {
            const res = await getPrediction(symbol);
            setData(res.data);
            refreshHistory();
        } catch (err) {
            alert("Failed to fetch prediction");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <header className="flex justify-between items-center mb-10">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">Stock Market Dashboard</h1>
                <button onClick={() => { localStorage.removeItem('token'); navigate('/') }} className="text-gray-400 hover:text-white">Logout</button>
            </header>

            <div className="flex gap-4 mb-8">
                <input
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="p-3 bg-gray-800 rounded border border-gray-700 text-white"
                    placeholder="Enter Symbol (e.g. NIFTY)"
                />
                <button onClick={handlePredict} disabled={loading} className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded font-bold">
                    {loading ? 'Analyzing...' : 'Run Prediction'}
                </button>
            </div>

            {data && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Prediction Card */}
                    <div className="glass p-6 rounded-xl">
                        <h2 className="text-xl text-gray-400 mb-2">Market Sentiment</h2>
                        <div className={`text-4xl font-bold mb-4 ${data.prediction === 'BULLISH' ? 'text-green-400' : data.prediction === 'BEARISH' ? 'text-red-400' : 'text-yellow-400'}`}>
                            {data.prediction}
                        </div>
                        <div className="flex justify-between text-sm text-gray-300">
                            <span>Confidence: {(data.confidence * 100).toFixed(0)}%</span>
                            <span>RSI: {data.rsi.toFixed(2)}</span>
                        </div>
                        <div className="mt-6 p-4 bg-gray-800 rounded border border-gray-700">
                            <h3 className="text-lg font-semibold mb-2 text-blue-300">Strategy</h3>
                            <p>{data.strategy}</p>
                            {data.strike && <p className="text-sm text-gray-400 mt-1">Suggested Strike: {data.strike} {data.option_type}</p>}
                        </div>
                    </div>

                    {/* Payoff Graph */}
                    <div className="glass p-6 rounded-xl h-80">
                        <h3 className="text-lg mb-4 text-gray-300">Payoff Diagram</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.payoff_graph}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="spot" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                                <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    )
}

{/* History Section */ }
<div className="mt-12">
    <h2 className="text-xl font-bold mb-4 text-gray-300">Your Recent Predictions</h2>
    <div className="glass p-6 rounded-xl overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-400">
            <thead>
                <tr className="border-b border-gray-700">
                    <th className="p-3">Time</th>
                    <th className="p-3">Symbol</th>
                    <th className="p-3">Prediction</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Strategy</th>
                </tr>
            </thead>
            <tbody>
                {history.map((h, i) => (
                    <tr key={i} className="border-b border-gray-800 hover:bg-gray-800 transition">
                        <td className="p-3">{new Date(h.timestamp).toLocaleString()}</td>
                        <td className="p-3 font-bold text-white">{h.symbol}</td>
                        <td className={`p-3 ${h.predicted_direction === 'BULLISH' ? 'text-green-400' : h.predicted_direction === 'BEARISH' ? 'text-red-400' : 'text-yellow-400'}`}>
                            {h.predicted_direction}
                        </td>
                        <td className="p-3">{h.current_price.toFixed(2)}</td>
                        <td className="p-3">{h.suggested_strategy}</td>
                    </tr>
                ))}
                {history.length === 0 && (
                    <tr>
                        <td colSpan="5" className="p-4 text-center">No history found.</td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
</div>
        </div >
    );
};

export default Dashboard;
