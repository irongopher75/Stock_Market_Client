import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AxiomTerminal from './components/terminal/AxiomTerminal';
import Auth from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';
import { getMe } from './api';

// ─── Auth State Helper ────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem('token');

// ─── Protected Route Guard ────────────────────────────────────────────────────
// Redirects to /login if no token. Checks if account is active via /users/me.
const ProtectedRoute = ({ children }) => {
    const [status, setStatus] = useState('checking'); // 'checking' | 'ok' | 'denied'

    useEffect(() => {
        if (!getToken()) {
            setStatus('denied');
            return;
        }
        getMe()
            .then(res => {
                // User must be active AND approved by admin
                if (res.data?.is_active && res.data?.is_approved) setStatus('ok');
                else setStatus('denied');
            })
            .catch(() => {
                localStorage.removeItem('token');
                setStatus('denied');
            });
    }, []);

    if (status === 'checking') {
        return (
            <div style={{ height: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'IBM Plex Mono', color: '#FF6600', fontSize: '13px', letterSpacing: '0.1em' }}>
                VERIFYING SESSION...
            </div>
        );
    }
    if (status === 'denied') {
        // Optional: add a query param to show "Pending Approval" message if they are active but not approved
        return <Navigate to="/login" replace />;
    }
    return children;
};

// ─── Admin Route Guard ─────────────────────────────────────────────────────────
// Only allows users with is_superuser: true.
const AdminRoute = ({ children }) => {
    const [status, setStatus] = useState('checking');

    useEffect(() => {
        if (!getToken()) { setStatus('denied'); return; }
        getMe()
            .then(res => {
                if (res.data?.is_superuser && res.data?.is_active) setStatus('ok');
                else setStatus('denied');
            })
            .catch(() => setStatus('denied'));
    }, []);

    if (status === 'checking') {
        return (
            <div style={{ height: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'IBM Plex Mono', color: '#FF6600', fontSize: '13px', letterSpacing: '0.1em' }}>
                VERIFYING ADMIN ACCESS...
            </div>
        );
    }
    if (status === 'denied') return <Navigate to="/terminal" replace />;
    return children;
};

// ─── App Router ───────────────────────────────────────────────────────────────
function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Landing page = Login */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Auth />} />

                {/* AXIOM Terminal — requires active account */}
                <Route
                    path="/terminal"
                    element={
                        <ProtectedRoute>
                            <AxiomTerminal />
                        </ProtectedRoute>
                    }
                />

                {/* Admin dashboard — requires is_admin flag */}
                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    }
                />

                {/* Legacy /dashboard redirect */}
                <Route path="/dashboard" element={<Navigate to="/terminal" replace />} />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
