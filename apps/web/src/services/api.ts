import axios from 'axios';

// Use localhost em desenvolvimento, Render em produção
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api' 
    : 'https://thesimplefund.onrender.com/api');

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth service
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (email: string, password: string, role: string) => {
    const response = await api.post('/auth/register', { email, password, role });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getCurrentUserData: async () => {
    const response = await api.get('/auth/me');
    // Update localStorage with fresh data
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  updateStellarKey: async (publicKey: string, secretKey?: string) => {
    const response = await api.post('/auth/stellar-key', { publicKey, secretKey });
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  }
};

// User service
export const userService = {
  getConsultores: async () => {
    const response = await api.get('/users/consultores');
    return response.data.consultores || [];
  },

  getInvestidores: async () => {
    const response = await api.get('/users/investidores');
    return response.data.investidores || [];
  },

  approveUser: async (id: string, action: 'approve' | 'reject') => {
    const response = await api.patch(`/users/${id}/approval`, {
      status: action === 'approve' ? 'APPROVED' : 'REJECTED'
    });
    return response.data;
  }
};

// Cedente service
export const cedenteService = {
  create: async (data: any) => {
    const response = await api.post('/cedentes', data);
    return response.data;
  },

  list: async () => {
    const response = await api.get('/cedentes');
    return response.data.cedentes || [];
  },

  listByFund: async (fundId: string) => {
    const response = await api.get(`/cedentes/fund/${fundId}`);
    return response.data.cedentes || [];
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/cedentes/${id}/status`, { status });
    return response.data;
  }
};

// Sacado service
export const sacadoService = {
  create: async (data: any) => {
    const response = await api.post('/sacados', data);
    return response.data;
  },

  list: async () => {
    const response = await api.get('/sacados');
    return response.data.sacados || [];
  },

  listByFund: async (fundId: string) => {
    const response = await api.get(`/sacados/fund/${fundId}`);
    return response.data.sacados || [];
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/sacados/${id}/status`, { status });
    return response.data;
  }
};

// Fund service
export const fundService = {
  create: async (data: any) => {
    const response = await api.post('/funds', data);
    return response.data;
  },

  list: async () => {
    const response = await api.get('/funds');
    return response.data.funds || [];
  },

  getById: async (id: string) => {
    const response = await api.get(`/funds/${id}`);
    return response.data;
  },

  updateContract: async (id: string, contractAddress: string) => {
    const response = await api.patch(`/funds/${id}/contract`, { contractAddress });
    return response.data;
  },

  issueQuotas: async (id: string, amount: number) => {
    const response = await api.post(`/funds/${id}/issue`, { amount });
    return response.data;
  },

  deactivate: async (id: string) => {
    const response = await api.patch(`/funds/${id}/deactivate`);
    return response.data;
  },

  approve: async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const response = await api.patch(`/funds/${id}/approval`, { status });
    return response.data;
  }
};

// Receivable service
export const receivableService = {
  create: async (data: any) => {
    const response = await api.post('/receivables', data);
    return response.data;
  },

  list: async () => {
    const response = await api.get('/receivables');
    return response.data.receivables || [];
  },

  markPaid: async (id: string, paidValue: number) => {
    const response = await api.patch(`/receivables/${id}/mark-paid`, { paidValue });
    return response.data;
  },

  distribute: async (id: string) => {
    const response = await api.post(`/receivables/${id}/distribute`);
    return response.data;
  }
};

// Order service
export const orderService = {
  create: async (data: any) => {
    const response = await api.post('/orders', data);
    return response.data;
  },

  list: async () => {
    const response = await api.get('/orders');
    return response.data.orders || [];
  },

  complete: async (id: string, txHash: string) => {
    const response = await api.patch(`/orders/${id}/complete`, { txHash });
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await api.patch(`/orders/${id}/cancel`);
    return response.data;
  }
};

// Stellar service
export const stellarService = {
  generateKeys: async () => {
    const response = await api.post('/stellar/generate-keys');
    return response.data;
  },

  getBalance: async (publicKey: string) => {
    const response = await api.post('/stellar/balance', { publicKey });
    return response.data;
  },

  createTrustline: async (secretKey: string, assetCode: string, assetIssuer: string) => {
    const response = await api.post('/stellar/trustline', { secretKey, assetCode, assetIssuer });
    return response.data;
  },

  transfer: async (secretKey: string, destination: string, assetCode: string, assetIssuer: string, amount: string) => {
    const response = await api.post('/stellar/transfer', { secretKey, destination, assetCode, assetIssuer, amount });
    return response.data;
  },

  fundAccount: async (publicKey: string) => {
    const response = await api.post('/stellar/fund-account', { publicKey });
    return response.data;
  },

  getTransaction: async (hash: string) => {
    const response = await api.get(`/stellar/transaction/${hash}`);
    return response.data;
  },

  // Soroban contract functions
  deployContract: async (secretKey: string, contractType: 'fund-token' | 'receivable-vault') => {
    const response = await api.post('/stellar/deploy-contract', {
      secretKey,
      wasmHash: 'mock_hash',
      contractType
    });
    return response.data;
  },

  initializeFundToken: async (secretKey: string, contractId: string, tokenSymbol: string, initialSupply: number) => {
    const response = await api.post('/stellar/initialize-fund-token', {
      secretKey,
      contractId,
      tokenSymbol,
      initialSupply
    });
    return response.data;
  },

  mintTokens: async (adminSecretKey: string, contractId: string, recipientPublicKey: string, amount: number) => {
    const response = await api.post('/stellar/mint-tokens', {
      adminSecretKey,
      contractId,
      recipientPublicKey,
      amount
    });
    return response.data;
  },

  addToWhitelist: async (adminSecretKey: string, contractId: string, userPublicKey: string) => {
    const response = await api.post('/stellar/add-to-whitelist', {
      adminSecretKey,
      contractId,
      userPublicKey
    });
    return response.data;
  },

  getContractBalance: async (contractId: string, accountPublicKey: string) => {
    const response = await api.post('/stellar/contract-balance', {
      contractId,
      accountPublicKey
    });
    return response.data;
  },

  registerReceivable: async (adminSecretKey: string, contractId: string, receivableId: string, amount: number, dueDate: string) => {
    const response = await api.post('/stellar/register-receivable', {
      adminSecretKey,
      contractId,
      receivableId,
      amount,
      dueDate
    });
    return response.data;
  },

  markReceivablePaid: async (adminSecretKey: string, contractId: string, receivableId: string, paidAmount: number) => {
    const response = await api.post('/stellar/mark-receivable-paid', {
      adminSecretKey,
      contractId,
      receivableId,
      paidAmount
    });
    return response.data;
  },

  distributePayments: async (adminSecretKey: string, contractId: string, totalAmount: number) => {
    const response = await api.post('/stellar/distribute-payments', {
      adminSecretKey,
      contractId,
      totalAmount
    });
    return response.data;
  }
};

export default api;