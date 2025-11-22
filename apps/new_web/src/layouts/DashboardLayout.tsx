import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { useWallet } from '../contexts/WalletContext';
import { FiMenu, FiLogOut, FiUsers, FiBox, FiUserCheck, FiHome, FiBriefcase, FiFilePlus, FiFileMinus, FiDollarSign, FiList, FiShoppingCart, FiTrendingUp } from 'react-icons/fi';
import { dashboardService, orderService } from '../services/api';

const gestorMenuItems = [
  { to: '/dashboard', icon: <FiHome />, name: 'Dashboard' },
  { to: '/consultores', icon: <FiUsers />, name: 'Consultants', countKey: 'consultores' },
  { to: '/investidores', icon: <FiUserCheck />, name: 'Investors', countKey: 'investidores' },
  { to: '/fundos', icon: <FiBox />, name: 'Funds', countKey: 'funds' },
  { to: '/pools', icon: <FiTrendingUp />, name: 'Yield Pools' },
  { to: '/investments', icon: <FiDollarSign />, name: 'Investments', countKey: 'investments' },
  { to: '/assignors', icon: <FiFilePlus />, name: 'Assignors', countKey: 'assignors' },
  { to: '/debtors', icon: <FiFileMinus />, name: 'Debtors', countKey: 'debtors' },
];

const consultorMenuItems = [
    { to: '/dashboard', icon: <FiHome />, name: 'My Funds' },
];

const investidorMenuItems = [
    { to: '/dashboard', icon: <FiHome />, name: 'Dashboard' },
    { to: '/marketplace', icon: <FiShoppingCart />, name: 'Marketplace' },
    { to: '/portfolio', icon: <FiBriefcase />, name: 'Portfolio' },
    { to: '/orders', icon: <FiList />, name: 'Orders' },
];

interface PendingCounts {
  consultores: number;
  investidores: number;
  funds: number;
  investments?: number;
  assignors: number;
  debtors: number;
}

const Sidebar: React.FC<{ isOpen: boolean; role: string; pendingCounts: PendingCounts | null }> = ({
  isOpen,
  role,
  pendingCounts,
}) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const isExpanded = isOpen || !isCollapsed;
  const sidebarWidth = isExpanded ? 'w-64' : 'w-20';
  const [showLabels, setShowLabels] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    if (isExpanded) {
      timer = window.setTimeout(() => setShowLabels(true), 120); // wait for width animation
    } else {
      setShowLabels(false);
    }
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [isExpanded]);

  let menuItems: typeof gestorMenuItems | typeof consultorMenuItems | typeof investidorMenuItems = [];
  if (role === 'GESTOR') menuItems = gestorMenuItems;
  else if (role === 'CONSULTOR') menuItems = consultorMenuItems;
  else if (role === 'INVESTIDOR') menuItems = investidorMenuItems;

  return (
    <aside
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
      className={`fixed top-0 left-0 h-full bg-dark shadow-lg transition-all duration-300 ease-in-out z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:relative md:translate-x-0 ${sidebarWidth} flex flex-col`}
    >
      <div className="flex items-center justify-center h-20 border-b border-gray-700 px-3">
        <Link to="/dashboard" className="flex items-center">
          <img src="/TSF.svg" alt="TheSimpleFund logo" className="h-10 w-auto" />
        </Link>
      </div>
      <nav className="flex-1 px-2 py-8 space-y-2">
        {menuItems.map((item) => {
          const count =
            'countKey' in item && pendingCounts ? (pendingCounts[item.countKey as keyof PendingCounts] ?? 0) : 0;
          const showBadge = role === 'GESTOR' && count > 0;
          const isActive =
            item.to === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

          return (
            <NavLink
              key={item.name}
              to={item.to}
              className={() =>
                `flex items-center ${isExpanded ? 'px-4 gap-3' : 'justify-center px-3'} py-3 transition-colors duration-200 rounded-lg ${
                  isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-300 hover:bg-primary/5'
                }`
              }
            >
              <div className={`flex items-center ${isExpanded ? 'gap-3' : 'justify-center w-full'}`}>
                <div className="relative flex items-center justify-center text-lg">
                  <span className="text-lg">{item.icon}</span>
                  {showBadge && !isExpanded && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
                      {count}
                    </span>
                  )}
                </div>
                {showLabels && <span className="ml-4 font-medium">{item.name}</span>}
                {showBadge && showLabels && (
                  <span className="ml-auto flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full">
                    {count}
                  </span>
                )}
              </div>
            </NavLink>
          );
        })}
      </nav>
      <div className="px-4 py-6 border-t border-gray-700">
        {/* Logout button moved to Header */}
      </div>
    </aside>
  );
};

const Header: React.FC<{ userEmail: string; userRole: string; onMenuClick: () => void; onLogout: () => void; }> = ({ userEmail, userRole, onMenuClick, onLogout }) => {
  const shouldShowWallet = userRole === 'INVESTIDOR' || userRole === 'GESTOR';
  const { publicKey, isConnected, connect, disconnect } = shouldShowWallet ? useWallet() : { publicKey: null, isConnected: false, connect: async () => {}, disconnect: () => {} };
  
  return (
    <header className="flex items-center justify-between h-20 px-6 bg-dark border-b border-gray-700 md:justify-end">
      <button onClick={onMenuClick} className="text-gray-300 md:hidden">
        <FiMenu className="w-6 h-6" />
      </button>
      <div className="flex items-center space-x-4">
        {shouldShowWallet && (
          <>
            {isConnected && publicKey ? (
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-lg">
                  {publicKey.slice(0, 4)}...{publicKey.slice(-4)}
                </span>
                <button
                  onClick={disconnect}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </>
        )}
        <span className="font-medium text-gray-200 text-sm">{userEmail}</span>
        <button onClick={onLogout} className="flex items-center p-2 text-gray-300 transition-colors duration-200 rounded-lg hover:bg-red-500/10 hover:text-red-500">
          <FiLogOut />
        </button>
      </div>
    </header>
  );
};

const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCounts, setPendingCounts] = useState<PendingCounts | null>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchPendingCounts = async () => {
      if (user?.role === 'GESTOR') {
        try {
          const response = await dashboardService.getPendingCounts();
          let counts = response.pendingCounts || null;

          // Also compute pending investments to surface notifications in sidebar
          try {
            const ordersResp = await orderService.list();
            const pendingInvestments = (ordersResp?.orders || []).filter(
              (order: { status?: string }) => order.status === 'PENDING'
            ).length;
            counts = counts ? { ...counts, investments: pendingInvestments } : { investments: pendingInvestments };
          } catch (orderErr) {
            console.error('Error fetching investments count:', orderErr);
          }

          setPendingCounts(counts);
        } catch (error) {
          console.error('Error fetching pending counts:', error);
        }
      }
    };

    fetchPendingCounts();
    
    // Refresh counts every 30 seconds
    const interval = setInterval(fetchPendingCounts, 30000);
    
    return () => clearInterval(interval);
  }, [user?.role]);

  if (!user) return null; // Should be handled by ProtectedRoute, but good practice

  return (
    <div className="flex h-screen bg-dark">
      <Sidebar isOpen={isSidebarOpen} role={user.role} pendingCounts={pendingCounts} />
      <div className="flex flex-col flex-1">
        {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-black opacity-50 md:hidden"></div>}
        <Header userEmail={user.email} userRole={user.role} onMenuClick={() => setSidebarOpen(pre => !pre)} onLogout={logout} />
        <main className="flex-1 p-4 overflow-y-auto md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
