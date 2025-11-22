import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiBox, FiPlus, FiGrid } from 'react-icons/fi';
import { fundService } from '../services/api';
import { getErrorMessage } from '../utils/errorHandler';
import FundManagement from '../components/FundManagement';
import { useNavigate } from 'react-router-dom';

// Type Definitions
interface Fund {
  id: string;
  name: string;
  symbol: string;
  description: string;
  status: string;
  totalIssued: number;
  maxSupply: number;
  price: number;
}

// Main Component
const ConsultorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null); // State for selected fund

  // Data Loading
  const loadFunds = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fundService.list(); // In a real app, this should fetch only the consultant's funds
      setFunds(response?.funds || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFunds();
  }, [loadFunds]);

  const handleFundCreated = () => {
    loadFunds(); // Refresh the list after a new fund is created
  };
  
  // If a fund is selected, show the management view
  if (selectedFund) {
    return <FundManagement fund={selectedFund} onBack={() => setSelectedFund(null)} />;
  }

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">My Funds</h1>
            <button
              onClick={() => {
                navigate('/fundos/new');
                handleFundCreated();
              }}
              className="flex items-center px-4 py-2 text-white bg-primary rounded-lg shadow-sm hover:bg-primary/90"
            >
                <FiPlus className="mr-2" />
                Create Fund
            </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard icon={<FiGrid />} title="Total Funds" value={funds.length} color="blue" />
          <StatCard icon={<FiBox />} title="Pending Approval" value={funds.filter(f => f.status === 'PENDING').length} color="yellow" />
        </div>

        {/* Funds List */}
        <div className="bg-white p-6 rounded-lg shadow-soft">
            <h2 className="text-xl font-semibold mb-4">Fund Details</h2>
            {loading ? (
                <div className="text-center p-8">Loading funds...</div>
            ) : funds.length === 0 ? (
                <div className="text-center p-8 text-gray-500">No funds created yet.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {funds.map(fund => (
                    <FundCard key={fund.id} fund={fund} onManage={() => setSelectedFund(fund)} />
                ))}
                </div>
            )}
        </div>
      </div>
    </>
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

const FundCard: React.FC<{ fund: Fund; onManage: () => void; }> = ({ fund, onManage }) => {
    const getStatusClasses = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }
    return (
        <div className="border rounded-lg p-4 flex flex-col justify-between space-y-4">
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold">{fund.name} ({fund.symbol})</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClasses(fund.status)}`}>{fund.status}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{fund.description}</p>
            </div>
            <div className="text-sm space-y-2">
                <p><strong>Price:</strong> ${fund.price.toLocaleString()}</p>
                <p><strong>Max Supply:</strong> {fund.maxSupply.toLocaleString()}</p>
                <p><strong>Issued:</strong> {fund.totalIssued.toLocaleString()}</p>
            </div>
            <button onClick={onManage} className="w-full mt-4 px-4 py-2 text-sm text-white bg-gray-700 rounded-lg hover:bg-gray-800">
                Manage
            </button>
        </div>
    )
}

export default ConsultorDashboard;
