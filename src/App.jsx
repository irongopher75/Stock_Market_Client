import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Signals from './pages/Signals';
import Portfolio from './pages/Portfolio';
import Analytics from './pages/Analytics';
import Backtest from './pages/Backtest';
import HistoryPage from './pages/History';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import StockDetail from './pages/StockDetail';
import { DataProvider } from './context/DataContext';

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
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<Auth />} />

                {/* Protected Routes with Layout */}
                <Route element={
                    <ProtectedRoute>
                        <DataProvider>
                            <DashboardLayout />
                        </DataProvider>
                    </ProtectedRoute>
                }>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/stock/:symbol" element={<StockDetail />} />
                    <Route path="/signals" element={<Signals />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/backtest" element={<Backtest />} />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="/settings" element={<Settings />} />
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
