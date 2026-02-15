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

export const login = async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    const response = await api.post('/users/token', formData);
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

export const getPendingUsers = async () => {
    return await api.get('/admin/pending-users');
}

export const approveUser = async (user_id) => {
    return await api.post(`/admin/approve/${user_id}`);
}

export default api;
