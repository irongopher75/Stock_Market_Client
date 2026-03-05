import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor to handle 401/403 (Unauthorized/Forbidden)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            const isAuthPage = window.location.pathname === '/' || window.location.pathname === '/login';
            if (!isAuthPage) {
                localStorage.removeItem('token');
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export const login = async (email, password) => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    const response = await api.post('/users/token', params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
};

export const register = async (email, password) => {
    return await api.post('/users/register', { email, password });
};

export const getMe = async () => {
    return await api.get('/users/me');
};

export const getPrediction = async (symbol, interval = '1h', period = '1mo') => {
    return await api.get(`/predict/${symbol}`, {
        params: { interval, period }
    });
}

export const getMyHistory = async () => {
    return await api.get('/predict/history/me');
}

export const getSymbols = async (exchange) => {
    return await api.get(`/predict/symbols/${exchange}`);
}

export const getPendingUsers = async () => {
    return await api.get('/admin/pending-users');
}

export const approveUser = async (user_id) => {
    return await api.post(`/admin/approve/${user_id}`);
}

export const getActiveTrades = async () => {
    return await api.get('/trades/active');
}

export const getTradeHistory = async () => {
    return await api.get('/trades/history');
}

export const getPerformance = async () => {
    return await api.get('/trades/performance');
}

export const executeManualTrade = async (symbol, side, quantity, price) => {
    return await api.post('/trades/execute', { symbol, side, quantity, price });
}

export const closeTrade = async (tradeId) => {
    return await api.post(`/trades/close/${tradeId}`);
}

export const getSystemConfig = async () => {
    return await api.get('/trades/config');
}

export default api;
