import React, { useEffect, useState } from 'react';
import { getPendingUsers, approveUser } from '../api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        refreshUsers();
    }, []);

    const refreshUsers = () => {
        getPendingUsers().then(res => setUsers(res.data));
    };

    const handleApprove = async (id) => {
        await approveUser(id);
        refreshUsers();
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 w-full">
            <h1 className="text-3xl font-bold mb-8 text-purple-400">Admin Dashboard</h1>
            <div className="glass p-6 rounded-xl">
                <h2 className="text-xl mb-4">Pending Approvals</h2>
                {users.length === 0 ? <p className="text-gray-500">No pending requests.</p> : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-700 text-gray-400">
                                <th className="p-3">Email</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="border-b border-gray-800">
                                    <td className="p-3">{u.email}</td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => handleApprove(u.id)}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-bold"
                                        >
                                            Approve
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <button onClick={() => navigate('/dashboard')} className="mt-8 text-blue-400 hover:underline">Go to Market Dashboard</button>
        </div>
    );
};

export default AdminDashboard;
