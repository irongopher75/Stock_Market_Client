import axios from 'axios';

// Use the environment variable if defined, otherwise derive it from window.location.
export const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000');

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getWsUrl = (clientId) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // If API_URL is absolute, replace protocol. If it's relative, use current host.
    if (API_URL.startsWith('http')) {
        const url = new URL(API_URL);
        return `${protocol}//${url.host}/ws/terminal/${clientId}`;
    }
    return `${protocol}//${window.location.host}${API_URL}/ws/terminal/${clientId}`;
};

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
    return await api.get(`/api/v1/predict/${symbol}`, {
        params: { interval, period }
    });
}

export const getMyHistory = async () => {
    return await api.get('/api/v1/predict/history/me');
}

export const getSymbols = async (exchange) => {
    return await api.get(`/api/v1/predict/symbols/${exchange}`);
}

// --- Backtesting API ---
export const runBacktest = async (symbol, period = '1y', interval = '1d', initial_capital = 100000) => {
    return await api.post('/api/v1/backtest/run', null, {
        params: { symbol, period, interval, initial_capital }
    });
}

export const getBacktestHistory = async () => {
    return await api.get('/api/v1/backtest/history');
}

export const getBacktestResult = async (runId) => {
    return await api.get(`/api/v1/backtest/${runId}`);
}

export const getPendingUsers = async () => {
    return await api.get('/api/v1/admin/pending-users');
}

export const approveUser = async (user_id) => {
    return await api.post(`/api/v1/admin/approve/${user_id}`);
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

export const getMacroYields = async () => {
    return await api.get('/api/v1/quotes/macro/yields');
}

export const getMacroFx = async () => {
    return await api.get('/api/v1/quotes/macro/fx');
}

export default api;
