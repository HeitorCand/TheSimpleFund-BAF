import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/useAuth';
import { Toaster } from 'react-hot-toast';

import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ConsultorList from './pages/gestor/ConsultorList';
import InvestorList from './pages/gestor/InvestorList';
import FundList from './pages/gestor/FundList';
import InvestmentList from './pages/gestor/InvestmentList';
import AssignorList from './pages/gestor/AssignorList';
import DebtorList from './pages/gestor/DebtorList';
import HomePage from './pages/lp/HomePage';

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
      <BrowserRouter>
        <Routes>
          {/* Landing Page - Completely public, no auth check */}
          <Route path="/home" element={<HomePage />} />
          
          {/* Root redirects to dashboard if logged in, or login if not */}
          <Route path="/" element={<Navigate to="/dashboard" />} />

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
              <Route path="dashboard">
                <Route index element={<DashboardPage />} />
                <Route path="consultores" element={<ConsultorList />} />
                <Route path="investidores" element={<InvestorList />} />
                <Route path="fundos" element={<FundList />} />
                <Route path="investments" element={<InvestmentList />} />
                <Route path="assignors" element={<AssignorList />} />
                <Route path="debtors" element={<DebtorList />} />
              </Route>
            </Route>
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;