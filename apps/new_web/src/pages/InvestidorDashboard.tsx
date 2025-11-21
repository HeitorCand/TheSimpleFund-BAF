import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/useAuth';
import { fundService, orderService, stellarService } from '../services/api';
import toast from 'react-hot-toast';
import { FiHome, FiBriefcase, FiPlus, FiAlertTriangle } from 'react-icons/fi';
import { getErrorMessage } from '../utils/errorHandler';

// --- Type Definitions ---
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
interface Order {
    id: string;
    fund: { name: string; symbol: string; };
    quantity: number;
    total: number;
    status: string;
    createdAt: string;
}

// --- Main Component ---
const InvestidorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'marketplace' | 'portfolio'>('marketplace');
  const [funds, setFunds] = useState<Fund[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [stellarPublicKey, setStellarPublicKey] = useState(user?.stellar_public_key);
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);

  // Data Loading
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'marketplace') {
        const response = await fundService.list();
        const allFunds = response?.funds || [];
        setFunds(allFunds.filter((f: Fund) => f.status === 'APPROVED'));
      } else {
        const response = await orderService.list();
        setOrders(response?.orders || []);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (user?.status === 'APPROVED') {
      loadData();
    }
  }, [loadData, user?.status]);

  const handleGenerateKeys = async () => {
    toast.loading('Generating Stellar keys...');
    try {
      const { publicKey } = await stellarService.generateKeys();
      setStellarPublicKey(publicKey);
      // In a real app, we'd call useAuth.updateUser to persist this
      toast.dismiss();
      toast.success('Stellar keys generated!');
    } catch (error) {
      toast.dismiss();
      toast.error(getErrorMessage(error));
    }
  };

  // Render blocking modal if user is not approved
  if (user?.status !== 'APPROVED') {
    return <ApprovalGate status={user?.status || 'PENDING'} />;
  }

  return (
    <>
      {selectedFund && <InvestmentModal fund={selectedFund} onClose={() => setSelectedFund(null)} onConfirm={loadData} />}
      <div className="space-y-8">
        {!stellarPublicKey && <WalletSetup onGenerate={handleGenerateKeys} />}
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6">
            <TabButton name="Marketplace" icon={<FiHome />} active={activeTab === 'marketplace'} onClick={() => setActiveTab('marketplace')} />
            <TabButton name="Portfolio" icon={<FiBriefcase />} active={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')} />
            </nav>
        </div>

        {/* Content */}
        {loading ? <div className="text-center p-8">Loading...</div> : (
            activeTab === 'marketplace' ? <Marketplace funds={funds} onInvest={setSelectedFund} /> : <Portfolio orders={orders} />
        )}
      </div>
    </>
  );
};


// --- Sub-components ---

const ApprovalGate: React.FC<{ status: string }> = ({ status }) => (
    <div className="bg-white p-8 rounded-lg shadow-soft text-center">
        <FiAlertTriangle className="mx-auto text-yellow-500 text-5xl mb-4" />
        <h2 className="text-2xl font-bold mb-2">Awaiting Approval</h2>
        <p className="text-gray-600 mb-4">Your account is currently <span className="font-semibold">{status}</span>. You'll get access once approved by an administrator.</p>
    </div>
);

const WalletSetup: React.FC<{ onGenerate: () => void }> = ({ onGenerate }) => (
    <div className="bg-yellow-50 p-6 rounded-lg flex items-center justify-between">
        <div>
            <h3 className="font-bold text-yellow-800">Set Up Your Wallet</h3>
            <p className="text-sm text-yellow-700">A Stellar wallet is required to invest. Generate your keys to continue.</p>
        </div>
        <button onClick={onGenerate} className="flex items-center px-4 py-2 text-sm text-white bg-yellow-600 rounded-lg hover:bg-yellow-700">
            <FiPlus className="mr-2" />
            Generate Keys
        </button>
    </div>
);

const TabButton: React.FC<{ name: string, icon: React.ReactNode, active: boolean, onClick: () => void }> = ({ name, icon, active, onClick }) => (
    <button onClick={onClick} className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${active ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
        <span className="mr-2">{icon}</span>
        {name}
    </button>
);

const Marketplace: React.FC<{ funds: Fund[], onInvest: (fund: Fund) => void }> = ({ funds, onInvest }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {funds.map(fund => (
            <div key={fund.id} className="bg-white border rounded-lg p-6 flex flex-col justify-between">
                <div>
                    <h3 className="text-xl font-bold">{fund.name} ({fund.symbol})</h3>
                    <p className="text-sm text-gray-600 mt-2 h-20 overflow-hidden">{fund.description}</p>
                </div>
                <div className="text-sm space-y-2 mt-4">
                    <p><strong>Price:</strong> ${fund.price.toLocaleString()}</p>
                    <p><strong>Available:</strong> {(fund.maxSupply - fund.totalIssued).toLocaleString()}</p>
                </div>
                <button onClick={() => onInvest(fund)} className="w-full mt-6 px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary/90">
                    Invest Now
                </button>
            </div>
        ))}
    </div>
);

const Portfolio: React.FC<{ orders: Order[] }> = ({ orders }) => (
    <div className="bg-white p-6 rounded-lg shadow-soft">
        <h2 className="text-xl font-semibold mb-4">My Investments</h2>
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Fund</th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Total Invested</th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id} className="border-b">
                            <td className="py-4 px-6 font-medium">{order.fund.name} ({order.fund.symbol})</td>
                            <td className="py-4 px-6">{order.quantity.toLocaleString()}</td>
                            <td className="py-4 px-6">${order.total.toLocaleString()}</td>
                            <td className="py-4 px-6 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="py-4 px-6">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {order.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {orders.length === 0 && <p className="text-center text-gray-500 py-8">You have no investments yet.</p>}
    </div>
);

const InvestmentModal: React.FC<{ fund: Fund, onClose: () => void, onConfirm: () => void }> = ({ fund, onClose, onConfirm }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInvest = async () => {
        setLoading(true);
        try {
            await orderService.create({
                fundId: fund.id,
                quantity: parseFloat(amount) / fund.price,
                total: parseFloat(amount)
            });
            toast.success('Investment successful!');
            onConfirm();
            onClose();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 m-4">
                <h2 className="text-2xl font-bold mb-4">Invest in {fund.name}</h2>
                <div className="space-y-4">
                    <p>Price per token: ${fund.price}</p>
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)} 
                        placeholder="Amount to invest (BRL)" 
                        className="w-full p-3 border rounded-lg"
                    />
                    {amount && <p className="text-sm">You will receive approx. {Math.floor(parseFloat(amount) / fund.price)} {fund.symbol} tokens.</p>}
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={onClose} className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button onClick={handleInvest} disabled={loading || !amount} className="px-6 py-2 text-white bg-primary rounded-lg hover:bg-primary/90 disabled:bg-primary/50">
                        {loading ? 'Processing...' : 'Confirm Investment'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default InvestidorDashboard;
