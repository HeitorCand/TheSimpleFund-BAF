import axios from 'axios';

console.log('API URL:', import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Auth Service ---
export const authService = {
  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// --- Dashboard Service ---
export const dashboardService = {
  getPendingCounts: async () => {
    const response = await api.get('/dashboard/pending-counts');
    return response.data;
  },
};

// --- User Service ---
export const userService = {
  getConsultores: async () => {
    const response = await api.get('/users/consultores');
    return response.data;
  },
  getInvestidores: async () => {
    const response = await api.get('/users/investidores');
    return response.data;
  },
  approveUser: async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const response = await api.patch(`/users/${id}/approval`, { status });
    return response.data;
  },
};

// --- Fund Service ---
export const fundService = {
  list: async () => {
    const response = await api.get('/funds');
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/funds', data);
    return response.data;
  },
  approve: async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const response = await api.patch(`/funds/${id}/approval`, { status });
    return response.data;
  },
  deactivate: async (id: string) => {
    const response = await api.patch(`/funds/${id}/deactivate`);
    return response.data;
  },
  issueQuotas: async (id: string, amount: number) => {
    const response = await api.post(`/funds/${id}/issue`, { amount });
    return response.data;
  },
};

// --- Cedente Service ---
export const cedenteService = {
  list: async () => {
    const response = await api.get('/cedentes');
    return response.data;
  },
  updateStatus: async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const response = await api.patch(`/cedentes/${id}/status`, { status });
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/cedentes', data);
    return response.data;
  },
  listByFund: async (fundId: string) => {
    const response = await api.get(`/cedentes/fund/${fundId}`);
    return response.data;
  }
};

// --- Sacado Service ---
export const sacadoService = {
  list: async () => {
    const response = await api.get('/sacados');
    return response.data;
  },
  updateStatus: async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const response = await api.patch(`/sacados/${id}/status`, { status });
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/sacados', data);
    return response.data;
  },
  listByFund: async (fundId: string) => {
    const response = await api.get(`/sacados/fund/${fundId}`);
    return response.data;
  }
};

// --- Order Service ---
export const orderService = {
  list: async () => {
    const response = await api.get('/orders');
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/orders', data);
    return response.data;
  },
  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  }
};

// --- Stellar Service ---
export const stellarService = {
  generateKeys: async () => {
    const response = await api.get('/stellar/generate-keys');
    return response.data;
  },
  fundAccount: async (publicKey: string) => {
    const response = await api.post('/stellar/fund-account', { publicKey });
    return response.data;
  },
  getBalance: async (publicKey: string) => {
    const response = await api.post('/stellar/balance', { publicKey });
    return response.data;
  },
};


export default api;
