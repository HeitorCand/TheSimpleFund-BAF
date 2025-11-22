import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/useAuth';
import { WalletProvider } from './contexts/WalletContext';
import { Toaster } from 'react-hot-toast';

// Layouts (sempre carregados)
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages - Login e Register carregados imediatamente
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
  </div>
);

// Lazy load dashboard pages
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

// Gestor Pages - Lazy loaded
const ConsultorList = lazy(() => import('./pages/gestor/ConsultorList'));
const InvestorList = lazy(() => import('./pages/gestor/InvestorList'));
const FundList = lazy(() => import('./pages/gestor/FundList'));
const InvestmentList = lazy(() => import('./pages/gestor/InvestmentList'));
const AssignorList = lazy(() => import('./pages/gestor/AssignorList'));
const DebtorList = lazy(() => import('./pages/gestor/DebtorList'));
const PoolList = lazy(() => import('./pages/gestor/PoolList'));
const FundCreate = lazy(() => import('./pages/gestor/FundCreate'));
const AssignorCreate = lazy(() => import('./pages/gestor/AssignorCreate'));
const DebtorCreate = lazy(() => import('./pages/gestor/DebtorCreate'));

// Investor Pages - Lazy loaded
const Marketplace = lazy(() => import('./pages/investor/Marketplace'));
const Portfolio = lazy(() => import('./pages/investor/Portfolio'));
const OrderList = lazy(() => import('./pages/investor/OrderList'));
const FundDetail = lazy(() => import('./pages/investor/FundDetail'));


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
                <Route path="dashboard" element={
                  <Suspense fallback={<PageLoader />}>
                    <DashboardPage />
                  </Suspense>
                } />
                {/* Gestor/Consultor Routes */}
                <Route path="consultores" element={
                  <Suspense fallback={<PageLoader />}>
                    <ConsultorList />
                  </Suspense>
                } />
                <Route path="investidores" element={
                  <Suspense fallback={<PageLoader />}>
                    <InvestorList />
                  </Suspense>
                } />
                <Route path="fundos" element={
                  <Suspense fallback={<PageLoader />}>
                    <FundList />
                  </Suspense>
                } />
                <Route path="fundos/new" element={
                  <Suspense fallback={<PageLoader />}>
                    <FundCreate />
                  </Suspense>
                } />
                <Route path="investments" element={
                  <Suspense fallback={<PageLoader />}>
                    <InvestmentList />
                  </Suspense>
                } />
                <Route path="assignors" element={
                  <Suspense fallback={<PageLoader />}>
                    <AssignorList />
                  </Suspense>
                } />
                <Route path="assignors/new" element={
                  <Suspense fallback={<PageLoader />}>
                    <AssignorCreate />
                  </Suspense>
                } />
                <Route path="debtors" element={
                  <Suspense fallback={<PageLoader />}>
                    <DebtorList />
                  </Suspense>
                } />
                <Route path="pools" element={
                  <Suspense fallback={<PageLoader />}>
                    <PoolList />
                  </Suspense>
                } />
                <Route path="debtors/new" element={
                  <Suspense fallback={<PageLoader />}>
                    <DebtorCreate />
                  </Suspense>
                } />
                <Route path="fundos/:fundId" element={
                  <Suspense fallback={<PageLoader />}>
                    <FundDetail />
                  </Suspense>
                } />
                {/* Investor Routes */}
                <Route path="marketplace" element={
                  <Suspense fallback={<PageLoader />}>
                    <Marketplace />
                  </Suspense>
                } />
                <Route path="marketplace/:fundId" element={
                  <Suspense fallback={<PageLoader />}>
                    <FundDetail />
                  </Suspense>
                } />
                <Route path="portfolio" element={
                  <Suspense fallback={<PageLoader />}>
                    <Portfolio />
                  </Suspense>
                } />
                <Route path="orders" element={
                  <Suspense fallback={<PageLoader />}>
                    <OrderList />
                  </Suspense>
                } />
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
