import React, { useState } from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { FiMenu, FiLogOut, FiUsers, FiBox, FiUserCheck, FiHome, FiBriefcase, FiFileText } from 'react-icons/fi';

const gestorMenuItems = [
    { to: '/dashboard/consultores', icon: <FiUsers />, name: 'Consultants' },
    { to: '/dashboard/investidores', icon: <FiUserCheck />, name: 'Investors' },
    { to: '/dashboard/fundos', icon: <FiBox />, name: 'Funds' },
    { to: '/dashboard/assignors', icon: <FiFileText />, name: 'Assignors' },
    { to: '/dashboard/debtors', icon: <FiFileText />, name: 'Debtors' },
];

const consultorMenuItems = [
    { to: '/dashboard', icon: <FiHome />, name: 'My Funds' },
];

const investidorMenuItems = [
    { to: '/dashboard/marketplace', icon: <FiHome />, name: 'Marketplace' },
    { to: '/dashboard/portfolio', icon: <FiBriefcase />, name: 'Portfolio' },
];

const Sidebar: React.FC<{ isOpen: boolean; role: string; }> = ({ isOpen, role }) => {
    let menuItems = [];
    if (role === 'GESTOR') menuItems = gestorMenuItems;
    else if (role === 'CONSULTOR') menuItems = consultorMenuItems;
    else if (role === 'INVESTIDOR') menuItems = investidorMenuItems;

  return (
    <aside className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-transform duration-300 ease-in-out z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:w-64 flex flex-col`}>
      <div className="flex items-center justify-center h-20 border-b">
        <Link to="/dashboard" className="text-2xl font-bold text-primary">TheSimpleFund</Link>
      </div>
      <nav className="flex-1 px-4 py-8 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 transition-colors duration-200 rounded-lg ${
                isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-primary/5'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span className="ml-4 font-medium">{item.name}</span>
          </NavLink>
        ))}
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
  const { user, logout } = useAuth();

  if (!user) return null; // Should be handled by ProtectedRoute, but good practice

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} role={user.role} />
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
