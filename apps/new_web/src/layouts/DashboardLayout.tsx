import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FiMenu, FiX, FiHome, FiUsers, FiBox, FiTrendingUp, FiSettings, FiLogOut } from 'react-icons/fi';

const Sidebar: React.FC<{ isOpen: boolean; }> = ({ isOpen }) => {
  const menuItems = [
    { icon: <FiHome />, name: 'Dashboard' },
    { icon: <FiUsers />, name: 'Users' },
    { icon: <FiBox />, name: 'Funds' },
    { icon: <FiTrendingUp />, name: 'Investments' },
  ];

  return (
    <aside className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-transform duration-300 ease-in-out z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:w-64`}>
      <div className="flex items-center justify-center h-20 border-b">
        <h1 className="text-2xl font-bold text-primary">TheSimpleFund</h1>
      </div>
      <nav className="flex-1 px-4 py-8 space-y-2">
        {menuItems.map((item, index) => (
          <a
            key={index}
            href="#"
            className="flex items-center px-4 py-3 text-gray-600 transition-colors duration-200 rounded-lg hover:bg-primary/10 hover:text-primary"
          >
            <span className="text-lg">{item.icon}</span>
            <span className="ml-4 font-medium">{item.name}</span>
          </a>
        ))}
      </nav>
      <div className="px-4 py-6 border-t">
        <a href="#" className="flex items-center px-4 py-3 text-gray-600 transition-colors duration-200 rounded-lg hover:bg-red-500/10 hover:text-red-500">
          <FiLogOut className="text-lg" />
          <span className="ml-4 font-medium">Logout</span>
        </a>
      </div>
    </aside>
  );
};

const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => (
  <header className="flex items-center justify-between h-20 px-6 bg-white border-b md:justify-end">
    <button onClick={onMenuClick} className="text-gray-500 md:hidden">
      <FiMenu className="w-6 h-6" />
    </button>
    <div className="flex items-center space-x-4">
      <span className="font-medium text-gray-700">Heitor Candido</span>
      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
        HC
      </div>
    </div>
  </header>
);

const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex flex-col flex-1">
        {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-black opacity-50 md:hidden"></div>}
        <Header onMenuClick={() => setSidebarOpen(pre => !pre)} />
        <main className="flex-1 p-4 overflow-y-auto md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
