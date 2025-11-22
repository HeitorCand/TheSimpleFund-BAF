import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/useAuth';
import { WalletProvider } from './contexts/WalletContext';
import { Toaster } from 'react-hot-toast';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

// Gestor Pages
import ConsultorList from './pages/gestor/ConsultorList';
import InvestorList from './pages/gestor/InvestorList';
import FundList from './pages/gestor/FundList';
import InvestmentList from './pages/gestor/InvestmentList';
import AssignorList from './pages/gestor/AssignorList';
import DebtorList from './pages/gestor/DebtorList';
import PoolList from './pages/gestor/PoolList';
import FundCreate from './pages/gestor/FundCreate';
import AssignorCreate from './pages/gestor/AssignorCreate';
import DebtorCreate from './pages/gestor/DebtorCreate';

// Investor Pages
import Marketplace from './pages/investor/Marketplace';
import Portfolio from './pages/investor/Portfolio';
import OrderList from './pages/investor/OrderList';
import FundDetail from './pages/investor/FundDetail';


const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

const PublicRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" />;
};

const App: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="bottom-right" />
      <WalletProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Public routes */}
            <Route element={<PublicRoute />}>
              <Route element={<AuthLayout />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
              </Route>
            </Route>

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="dashboard" element={<DashboardPage />} />
                {/* Gestor/Consultor Routes */}
                <Route path="consultores" element={<ConsultorList />} />
                <Route path="investidores" element={<InvestorList />} />
                <Route path="fundos" element={<FundList />} />
                <Route path="fundos/new" element={<FundCreate />} />
                <Route path="investments" element={<InvestmentList />} />
                <Route path="assignors" element={<AssignorList />} />
                <Route path="assignors/new" element={<AssignorCreate />} />
                <Route path="debtors" element={<DebtorList />} />
                <Route path="pools" element={<PoolList />} />
                <Route path="debtors/new" element={<DebtorCreate />} />
                {/* Investor Routes */}
                <Route path="marketplace" element={<Marketplace />} />
                <Route path="marketplace/:fundId" element={<FundDetail />} />
                <Route path="portfolio" element={<Portfolio />} />
                <Route path="orders" element={<OrderList />} />
              </Route>
            </Route>
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </WalletProvider>
    </>
  );
};

export default App;
