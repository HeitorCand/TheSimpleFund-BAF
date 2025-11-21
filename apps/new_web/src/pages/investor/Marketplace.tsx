import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { fundService, orderService } from '../../services/api';
import { FiSearch } from 'react-icons/fi';

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

// --- Main Component ---
const Marketplace: React.FC = () => {
    const [funds, setFunds] = useState<Fund[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const loadFunds = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fundService.list();
            setFunds(response.funds.filter((f: Fund) => f.status === 'APPROVED') || []);
        } catch (error) {
            toast.error(`Failed to load marketplace.`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFunds();
    }, [loadFunds]);

    const filteredFunds = useMemo(() => {
        if (!searchQuery) return funds;
        return funds.filter(fund => 
            fund.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            fund.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [funds, searchQuery]);

    if (loading) return <div className="text-center p-8">Loading Marketplace...</div>;

    return (
        <>
            {selectedFund && <InvestmentModal fund={selectedFund} onClose={() => setSelectedFund(null)} onConfirm={loadFunds} />}
            <div className="bg-white p-6 rounded-lg shadow-soft">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Marketplace</h2>
                    <div className="relative w-full max-w-xs">
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search funds..."
                            className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFunds.map(fund => (
                        <div key={fund.id} className="border rounded-lg p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:scale-105">
                            <div>
                                <h3 className="text-xl font-bold">{fund.name} ({fund.symbol})</h3>
                                <p className="text-sm text-gray-600 mt-2 h-20 overflow-hidden">{fund.description}</p>
                            </div>
                            <div className="text-sm space-y-2 mt-4">
                                <p><strong>Price:</strong> ${fund.price.toLocaleString()}</p>
                                <p><strong>Available:</strong> {(fund.maxSupply - fund.totalIssued).toLocaleString()}</p>
                            </div>
                            <button onClick={() => setSelectedFund(fund)} className="w-full mt-6 px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary/90">
                                Invest Now
                            </button>
                        </div>
                    ))}
                </div>
                {filteredFunds.length === 0 && !loading && (
                    <div className="text-center text-gray-500 py-8">
                        <p>No funds available that match your search.</p>
                    </div>
                )}
            </div>
        </>
    );
};

// Re-using the InvestmentModal from the old InvestorDashboard
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
            toast.error('Investment failed.');
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

export default Marketplace;
