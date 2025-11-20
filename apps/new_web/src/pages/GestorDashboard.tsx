import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiUsers, FiBox, FiUserCheck, FiDollarSign } from 'react-icons/fi';
import { cedenteService, fundService, sacadoService, userService } from '../services/api';

// --- Type Definitions ---
interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

interface Fund {
  id: string;
  name: string;
  symbol: string;
  status: string;
  totalIssued: number;
}

interface Cedente {
  id: string;
  name: string;
  document: string;
  status: string;
}

interface Sacado {
    id: string;
    name: string;
    document: string;
    status: string;
  }

type Tab = 'consultores' | 'investidores' | 'fundos' | 'cedentes' | 'sacados';

import SampleChart from '../components/charts/SampleChart';

// --- Main Component ---
const GestorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('consultores');
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [consultores, setConsultores] = useState<User[]>([]);
  const [investidores, setInvestidores] = useState<User[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [cedentes, setCedentes] = useState<Cedente[]>([]);
  const [sacados, setSacados] = useState<Sacado[]>([]);

  // --- Data Loading ---
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      switch (activeTab) {
        case 'consultores':
          response = await userService.getConsultores();
          setConsultores(response?.consultores || []);
          break;
        case 'investidores':
          response = await userService.getInvestidores();
          setInvestidores(response?.investidores || []);
          break;
        case 'fundos':
          response = await fundService.list();
          setFunds(response?.funds || []);
          break;
        case 'cedentes':
            response = await cedenteService.list();
            setCedentes(response?.cedentes || []);
            break;
        case 'sacados':
            response = await sacadoService.list();
            setSacados(response?.sacados || []);
            break;
      }
    } catch (error) {
      toast.error(`Error loading ${activeTab}.`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);


  // --- Action Handlers ---
  const handleApprove = async (id: string, type: 'user' | 'fund' | 'cedente' | 'sacado', action: 'approve' | 'reject') => {
    const originalStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
    toast.loading(`Processing ${action}...`);
    try {
        switch (type) {
            case 'user':
                await userService.approveUser(id, action);
                break;
            case 'fund':
                await fundService.approve(id, originalStatus);
                break;
            case 'cedente':
                await cedenteService.updateStatus(id, action === 'approve' ? 'approved' : 'rejected');
                break;
            case 'sacado':
                await sacadoService.updateStatus(id, action === 'approve' ? 'approved' : 'rejected');
                break;
        }
      toast.dismiss();
      toast.success(`Item ${action}d successfully!`);
      loadData(); // Refresh data for the current tab
    } catch {
      toast.dismiss();
      toast.error('Error processing approval.');
    }
  };


  // --- Render Methods ---
  const renderContent = () => {
    if (loading) {
      return <div className="text-center p-8">Loading...</div>;
    }

    const dataMap = {
      consultores: consultores,
      investidores: investidores,
      fundos: funds,
      cedentes: cedentes,
      sacados: sacados,
    };
    
    const currentData = dataMap[activeTab];

    if (!currentData || currentData.length === 0) {
      return <div className="text-center p-8 text-gray-500">No items found.</div>;
    }
    
    return (
      <div className="space-y-4">
        {currentData.map((item: any) => (
          <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
            <div>
              <p className="font-semibold">{item.name || item.email}</p>
              <p className="text-sm text-gray-500">{item.document || `Status: ${item.status}`}</p>
            </div>
            {item.status === 'PENDING' && (
              <div className="flex space-x-2">
                <button onClick={() => handleApprove(item.id, activeTab === 'fundos' ? 'fund' : 'user', 'approve')} className="px-3 py-1 text-sm text-white bg-green-500 rounded-md hover:bg-green-600">Approve</button>
                <button onClick={() => handleApprove(item.id, activeTab === 'fundos' ? 'fund' : 'user', 'reject')} className="px-3 py-1 text-sm text-white bg-red-500 rounded-md hover:bg-red-600">Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  const getPendingCount = (tab: Tab) => {
    const data = {
        consultores,
        investidores,
        fundos: funds,
        cedentes,
        sacados
    };
    const tabData = data[tab];
    if (!Array.isArray(tabData)) return 0;
    return tabData.filter(item => item.status === 'PENDING').length;
  }

  return (
    <div className="space-y-8">
      {/* Chart */}
      <SampleChart />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<FiUsers />} title="Pending Consultants" value={getPendingCount('consultores')} color="blue" />
        <StatCard icon={<FiUserCheck />} title="Pending Investors" value={getPendingCount('investidores')} color="green" />
        <StatCard icon={<FiBox />} title="Pending Funds" value={getPendingCount('fundos')} color="purple" />
        <StatCard icon={<FiDollarSign />} title="Total Issued" value={Array.isArray(funds) ? funds.reduce((acc, f) => acc + f.totalIssued, 0) : 0} color="yellow" />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {(['consultores', 'investidores', 'fundos', 'cedentes', 'sacados'] as Tab[]).map(tab => (
            <TabButton key={tab} name={tab} activeTab={activeTab} onClick={setActiveTab} pendingCount={getPendingCount(tab)} />
          ))}
        </nav>
      </div>

      {/* Content */}
      <div>
        {renderContent()}
      </div>
    </div>
  );
};

// --- Sub-components ---
const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: number | string; color: string }> = ({ icon, title, value, color }) => (
  <div className="p-6 bg-white rounded-lg shadow-soft flex items-center space-x-4">
    <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const TabButton: React.FC<{ name: string; activeTab: string; onClick: (tab: any) => void; pendingCount: number }> = ({ name, activeTab, onClick, pendingCount }) => (
  <button
    onClick={() => onClick(name)}
    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
      activeTab === name
        ? 'border-primary text-primary'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
  >
    <span className="capitalize">{name}</span>
    {pendingCount > 0 && <span className="ml-2 px-2 py-0.5 text-xs font-bold text-white bg-primary rounded-full">{pendingCount}</span>}
  </button>
);


export default GestorDashboard;