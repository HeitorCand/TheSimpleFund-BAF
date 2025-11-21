import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { FiMenu, FiLogOut, FiUsers, FiBox, FiUserCheck, FiHome, FiBriefcase, FiFilePlus, FiFileMinus, FiDollarSign } from 'react-icons/fi';
import { dashboardService } from '../services/api';

const gestorMenuItems = [
    { to: '/dashboard', icon: <FiHome />, name: 'Dashboard' },
    { to: '/dashboard/consultores', icon: <FiUsers />, name: 'Consultants', countKey: 'consultores' },
    { to: '/dashboard/investidores', icon: <FiUserCheck />, name: 'Investors', countKey: 'investidores' },
    { to: '/dashboard/fundos', icon: <FiBox />, name: 'Funds', countKey: 'funds' },
    { to: '/dashboard/investments', icon: <FiDollarSign />, name: 'Investments' },
    { to: '/dashboard/assignors', icon: <FiFilePlus />, name: 'Assignors', countKey: 'assignors' },
    { to: '/dashboard/debtors', icon: <FiFileMinus />, name: 'Debtors', countKey: 'debtors' },
];

const consultorMenuItems = [
    { to: '/dashboard', icon: <FiHome />, name: 'My Funds' },
];

const investidorMenuItems = [
    { to: '/dashboard/marketplace', icon: <FiHome />, name: 'Marketplace' },
    { to: '/dashboard/portfolio', icon: <FiBriefcase />, name: 'Portfolio' },
];

interface PendingCounts {
  consultores: number;
  investidores: number;
  funds: number;
  assignors: number;
  debtors: number;
}

const Sidebar: React.FC<{ isOpen: boolean; role: string; pendingCounts: PendingCounts | null }> = ({
  isOpen,
  role,
  pendingCounts,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const isExpanded = isOpen || !isCollapsed;
  const sidebarWidth = isExpanded ? 'w-64' : 'w-20';

  let menuItems: typeof gestorMenuItems | typeof consultorMenuItems | typeof investidorMenuItems = [];
  if (role === 'GESTOR') menuItems = gestorMenuItems;
  else if (role === 'CONSULTOR') menuItems = consultorMenuItems;
  else if (role === 'INVESTIDOR') menuItems = investidorMenuItems;

  return (
    <aside
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
      className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 ease-in-out z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:relative md:translate-x-0 ${sidebarWidth} flex flex-col`}
    >
      <div className="flex items-center justify-center h-20 border-b px-3">
        <Link to="/dashboard" className="flex items-center">
          <img src="/TSF.svg" alt="TheSimpleFund logo" className="h-10 w-auto" />
        </Link>
      </div>
      <nav className="flex-1 px-2 py-8 space-y-2">
        {menuItems.map((item) => {
          const count = 'countKey' in item && pendingCounts ? pendingCounts[item.countKey as keyof PendingCounts] : 0;
          const showBadge = role === 'GESTOR' && count > 0;
          
          return (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center ${isExpanded ? 'px-4 gap-3' : 'justify-center px-3'} py-3 transition-colors duration-200 rounded-lg ${
                  isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-primary/5'
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
                {isExpanded && <span className="ml-4 font-medium">{item.name}</span>}
                {showBadge && isExpanded && (
                  <span className="ml-auto flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full">
                    {count}
                  </span>
                )}
              </div>
            </NavLink>
          );
        })}
      </nav>
      <div className="px-4 py-6 border-t">
        {/* Logout button moved to Header */}
      </div>
    </aside>
  );
};

const Header: React.FC<{ userEmail: string; onMenuClick: () => void; onLogout: () => void; }> = ({ userEmail, onMenuClick, onLogout }) => (
  <header className="flex items-center justify-between h-20 px-6 bg-white border-b md:justify-end">
    <button onClick={onMenuClick} className="text-gray-500 md:hidden">
      <FiMenu className="w-6 h-6" />
    </button>
    <div className="flex items-center space-x-4">
      <span className="font-medium text-gray-700 text-sm">{userEmail}</span>
      <button onClick={onLogout} className="flex items-center p-2 text-gray-600 transition-colors duration-200 rounded-lg hover:bg-red-500/10 hover:text-red-500">
        <FiLogOut />
      </button>
    </div>
  </header>
);

const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCounts, setPendingCounts] = useState<PendingCounts | null>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchPendingCounts = async () => {
      if (user?.role === 'GESTOR') {
        try {
          const response = await dashboardService.getPendingCounts();
          setPendingCounts(response.pendingCounts);
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
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} role={user.role} pendingCounts={pendingCounts} />
      <div className="flex flex-col flex-1">
        {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-black opacity-50 md:hidden"></div>}
        <Header userEmail={user.email} onMenuClick={() => setSidebarOpen(pre => !pre)} onLogout={logout} />
        <main className="flex-1 p-4 overflow-y-auto md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
