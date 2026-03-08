import React, { useEffect, useState } from 'react';
import { getPendingUsers, approveUser, getMe } from '../api/index';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [adminEmail, setAdminEmail] = useState('');
    const [tick, setTick] = useState(new Date().toLocaleTimeString('en-IN', { hour12: false }));
    const navigate = useNavigate();

    useEffect(() => {
        refreshUsers();
        getMe().then(r => setAdminEmail(r.data?.email || ''));
        const t = setInterval(() => setTick(new Date().toLocaleTimeString('en-IN', { hour12: false })), 1000);
        return () => clearInterval(t);
    }, []);

    const refreshUsers = () => {
        getPendingUsers()
            .then(res => setUsers(res.data))
            .catch(() => setUsers([]));
    };

    const handleApprove = async (id) => {
        await approveUser(id);
        refreshUsers();
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const mono = { fontFamily: 'IBM Plex Mono, monospace' };

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#FFF', ...mono }}>
            {/* Header */}
            <div style={{ background: '#0D0D0D', borderBottom: '1px solid #1A1A1A', padding: '0 24px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ color: '#FF6600', fontSize: '13px', letterSpacing: '3px' }}>AXIOM</span>
                    <span style={{ color: '#333', fontSize: '10px' }}>/ ADMIN CONSOLE</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ color: '#444', fontSize: '10px' }}>{adminEmail}</span>
                    <span style={{ color: '#333', fontSize: '10px' }}>{tick}</span>
                    <button onClick={() => navigate('/terminal')} style={{ background: 'transparent', border: '1px solid #1A1A1A', color: '#555', padding: '3px 10px', fontSize: '10px', cursor: 'pointer', ...mono }}>↗ TERMINAL</button>
                    <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #FF244433', color: '#FF2244', padding: '3px 10px', fontSize: '10px', cursor: 'pointer', ...mono }}>LOGOUT</button>
                </div>
            </div>

            <div style={{ padding: '32px 40px' }}>
                {/* Title */}
                <div style={{ marginBottom: '28px' }}>
                    <div style={{ fontSize: '18px', color: '#FF6600', letterSpacing: '2px', marginBottom: '4px' }}>PENDING APPROVALS</div>
                    <div style={{ fontSize: '10px', color: '#333' }}>Users awaiting access to the AXIOM terminal</div>
                </div>

                {/* Table */}
                <div style={{ border: '1px solid #1A1A1A', background: '#0D0D0D' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 120px', borderBottom: '1px solid #1A1A1A', padding: '8px 16px' }}>
                        <span style={{ color: '#444', fontSize: '9px', letterSpacing: '1px' }}>EMAIL</span>
                        <span style={{ color: '#444', fontSize: '9px', letterSpacing: '1px' }}>REGISTERED</span>
                        <span style={{ color: '#444', fontSize: '9px', letterSpacing: '1px' }}>ACTION</span>
                    </div>
                    {users.length === 0 ? (
                        <div style={{ padding: '24px 16px', color: '#333', fontSize: '11px' }}>
                            NO PENDING REQUESTS
                        </div>
                    ) : (
                        users.map(u => (
                            <div key={u.id || u.email} style={{ display: 'grid', gridTemplateColumns: '1fr 160px 120px', padding: '12px 16px', borderBottom: '1px solid #111', alignItems: 'center' }}>
                                <span style={{ color: '#CCC', fontSize: '12px' }}>{u.email}</span>
                                <span style={{ color: '#444', fontSize: '10px' }}>
                                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                                </span>
                                <button
                                    onClick={() => handleApprove(u.id)}
                                    style={{ background: 'rgba(0,255,65,0.06)', border: '1px solid #00FF4133', color: '#00FF41', padding: '4px 14px', fontSize: '10px', cursor: 'pointer', letterSpacing: '1px', ...mono }}
                                >
                                    APPROVE
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Stats */}
                <div style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
                    <div style={{ border: '1px solid #1A1A1A', padding: '12px 20px', background: '#0D0D0D' }}>
                        <div style={{ color: '#444', fontSize: '9px', letterSpacing: '1px' }}>PENDING</div>
                        <div style={{ color: '#FF6600', fontSize: '22px', marginTop: '4px' }}>{users.length}</div>
                    </div>
                    <button onClick={refreshUsers}
                        style={{ border: '1px solid #1A1A1A', padding: '12px 20px', background: 'transparent', color: '#555', fontSize: '10px', cursor: 'pointer', ...mono, letterSpacing: '1px' }}>
                        ↺ REFRESH
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
