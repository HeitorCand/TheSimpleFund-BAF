import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { fundService } from '../../services/api';
import { useWallet } from '../../contexts/WalletContext';
import { FiSearch } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import InvestmentModal from '../../components/InvestmentModal';
import FiatWithXlmValue from '../../components/FiatWithXlmValue';

interface Fund {
  id: string;
  name: string;
  symbol: string;
  description: string;
  status: string;
  totalIssued: number;
  maxSupply: number;
  price: number;
  fundWalletPublicKey?: string;
  consultor?: {
    publicKey?: string;
  };
}

const Marketplace: React.FC = () => {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { isConnected } = useWallet();

  const loadFunds = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fundService.list();
      setFunds(response.funds.filter((f: Fund) => f.status === 'APPROVED') || []);
    } catch (error) {
      toast.error('Failed to load marketplace.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFunds();
  }, [loadFunds]);

  const filteredFunds = useMemo(() => {
    if (!searchQuery) return funds;
    return funds.filter(
      (fund) =>
        fund.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fund.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [funds, searchQuery]);

  if (loading) return <div className="text-center p-8">Loading Marketplace...</div>;

  return (
    <>
      {selectedFund && (
        <InvestmentModal fund={selectedFund} onClose={() => setSelectedFund(null)} onConfirm={loadFunds} />
      )}
      <div className="bg-white/[0.04] border border-white/[0.12] backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
        {!isConnected && (
          <div className="mb-6 bg-white/[0.04] border border-white/[0.12] backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
            <p className="text-yellow-800 text-sm">
              💡 <strong>Connect your wallet</strong> in the header to invest and make payments via Stellar Testnet.
            </p>
          </div>
        )}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Marketplace</h2>
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search funds..."
              className="w-full rounded-lg px-3 pl-10 py-2 bg-white/5 border border-white/15 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#169976] focus:border-transparent transition"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFunds.map((fund) => (
            <div
              key={fund.id}
              className="bg-white/[0.04] border border-white/[0.12] backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.45)] flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-bold">
                  {fund.name} ({fund.symbol})
                </h3>
                <p className="text-sm text-gray-600 mt-2 h-20 overflow-hidden">{fund.description}</p>
              </div>
              <div className="text-sm space-y-2 mt-4">
                <p>
                  <strong>Price:</strong> <FiatWithXlmValue amountUsd={fund.price} />
                </p>
                <p>
                  <strong>Available:</strong> {(fund.maxSupply - fund.totalIssued).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col gap-2 mt-6">
                <button
                  onClick={() => setSelectedFund(fund)}
                  className="w-full px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary/90"
                >
                  Invest Now
                </button>
                <Link
                  to={`/marketplace/${fund.id}`}
                  className="w-full px-4 py-2 text-center text-primary border border-primary rounded-lg hover:bg-primary/10"
                >
                  View details
                </Link>
              </div>
            </div>
          ))}
        </div>
        {filteredFunds.length === 0 && !loading && (
          <div className="text-center text-gray-400 py-8">
            <p>No funds available that match your search.</p>
          </div>
        )}
      </div>
    </>
  );
};


export default Marketplace;
