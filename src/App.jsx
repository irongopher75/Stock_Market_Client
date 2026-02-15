import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Signals from './pages/Signals';
import Portfolio from './pages/Portfolio';
import Analytics from './pages/Analytics';
import Backtest from './pages/Backtest';
import History from './pages/History';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

const PlaceholderPage = ({ title }) => (
    <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <p className="text-gray-500">Coming soon in Phase 4...</p>
    </div>
);

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Auth />} />

                {/* Protected Routes with Layout - Temporarily Unprotected for UI Showoff */}
                <Route element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/signals" element={<PlaceholderPage title="Live Signals" />} />
                    <Route path="/portfolio" element={<PlaceholderPage title="Portfolio" />} />
                    <Route path="/analytics" element={<PlaceholderPage title="Analytics" />} />
                    <Route path="/backtest" element={<PlaceholderPage title="Backtesting" />} />
                    <Route path="/history" element={<PlaceholderPage title="History" />} />
                    <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
                </Route>

                <Route path="/admin" element={
                    <ProtectedRoute adminOnly={true}>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
