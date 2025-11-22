import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { fundService } from '../../services/api';
import { getErrorMessage } from '../../utils/errorHandler';
import { useWallet } from '../../contexts/WalletContext';
import { useAuth } from '../../contexts/useAuth';
import { Link, Navigate } from 'react-router-dom';

interface Fund {
  id: string;
  name: string;
  symbol: string;
  status: string;
  maxSupply: number;
  totalIssued: number;
  price: number;
}

const FundList: React.FC = () => {
    const { publicKey, isConnected, connect } = useWallet();
    const { user } = useAuth();
    const role = user?.role as string | undefined;
    const [funds, setFunds] = useState<Fund[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
    const [showIssueModal, setShowIssueModal] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fundService.list();
            setFunds(response?.funds || []);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (user?.role === 'CONSULTOR') {
        return <Navigate to="/dashboard" replace />;
    }
    if (user && user.role !== 'GESTOR') {
        return <p className="p-6 text-gray-600">Access restricted.</p>;
    }

    const handleApprove = async (id: string, action: 'approve' | 'reject') => {
        if (user?.role !== 'GESTOR') {
            toast.error('Only managers can approve or reject funds.');
            return;
        }
        if (action === 'approve') {
            // Check if wallet is connected
            if (!isConnected || !publicKey) {
                toast.error('Please connect your wallet first to approve the fund');
                try {
                    await connect();
                    // After connection, the user can try again
                    toast.success('Wallet connected! Click Approve again to use this wallet for the fund.');
                } catch (error) {
                    toast.error('Failed to connect wallet');
                }
                return;
            }

            // Use the connected wallet as the fund wallet
            const fundWalletPublicKey = publicKey;
            
            toast.loading('Processing...');
            try {
                const status = 'APPROVED';
                await fundService.approve(id, status, fundWalletPublicKey);
                toast.dismiss();
                toast.success(`Fund approved with wallet: ${fundWalletPublicKey.slice(0, 4)}...${fundWalletPublicKey.slice(-4)}`);
                loadData();
            } catch (error) {
                toast.dismiss();
                toast.error(getErrorMessage(error));
            }
        } else {
            toast.loading('Processing...');
            try {
                const status = 'REJECTED';
                await fundService.approve(id, status);
                toast.dismiss();
                toast.success('Fund rejected successfully!');
                loadData();
            } catch (error) {
                toast.dismiss();
                toast.error(getErrorMessage(error));
            }
        }
    };

    const handleDeactivate = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this fund?')) return;
        
        toast.loading('Deactivating fund...');
        try {
            await fundService.deactivate(id);
            toast.dismiss();
            toast.success('Fund deactivated successfully!');
            loadData();
        } catch (error) {
            toast.dismiss();
            toast.error(getErrorMessage(error));
        }
    };

    const handleIssueQuotas = (fund: Fund) => {
        setSelectedFund(fund);
        setShowIssueModal(true);
    };

    if (loading) return <div className="text-center p-8">Loading funds...</div>;

    return (
        <>
            {showIssueModal && selectedFund && (
                <IssueQuotasModal 
                    fund={selectedFund} 
                    onClose={() => {
                        setShowIssueModal(false);
                        setSelectedFund(null);
                    }}
                    onSuccess={loadData}
                />
            )}
            
            <div className="bg-white p-6 rounded-lg shadow-soft">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Manage Funds</h2>
                    {role === 'CONSULTOR' && (
                        <Link
                            to="/dashboard/fundos/new"
                            className="px-3 py-2 text-sm text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
                        >
                            + Create Fund
                        </Link>
                    )}
                </div>
                <div className="space-y-4">
                    {funds.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No funds found.</p>
                    ) : (
                        funds.map((item) => (
                            <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                                    <div className="flex-1">
                                        <p className="font-semibold text-lg">{item.name} ({item.symbol})</p>
                                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                            <p className="text-gray-600">
                                                <span className="font-medium">Status:</span>{' '}
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                    item.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                    item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    item.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </p>
                                            <p className="text-gray-600">
                                                <span className="font-medium">Issued:</span> {item.totalIssued.toLocaleString()} / {item.maxSupply.toLocaleString()}
                                            </p>
                                            <p className="text-gray-600">
                                                <span className="font-medium">Price:</span> ${item.price.toLocaleString()}
                                            </p>
                                            <p className="text-gray-600">
                                                <span className="font-medium">Available:</span> {(item.maxSupply - item.totalIssued).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {item.status === 'PENDING' && (
                                            <>
                                                <button 
                                                    onClick={() => handleApprove(item.id, 'approve')} 
                                                    className="px-3 py-1.5 text-sm text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors"
                                                >
                                                    Approve
                                                </button>
                                                <button 
                                                    onClick={() => handleApprove(item.id, 'reject')} 
                                                    className="px-3 py-1.5 text-sm text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {item.status === 'APPROVED' && (
                                            <>
                                                <button 
                                                    onClick={() => handleIssueQuotas(item)} 
                                                    className="px-3 py-1.5 text-sm text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
                                                    disabled={item.totalIssued >= item.maxSupply}
                                                >
                                                    Issue Quotas
                                                </button>
                                                <button 
                                                    onClick={() => handleDeactivate(item.id)} 
                                                    className="px-3 py-1.5 text-sm text-white bg-gray-500 rounded-md hover:bg-gray-600 transition-colors"
                                                >
                                                    Deactivate
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};

const IssueQuotasModal: React.FC<{ 
    fund: Fund; 
    onClose: () => void; 
    onSuccess: () => void;
}> = ({ fund, onClose, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const maxAvailable = fund.maxSupply - fund.totalIssued;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amountNum = parseInt(amount);
        
        if (amountNum <= 0 || amountNum > maxAvailable) {
            toast.error(`Amount must be between 1 and ${maxAvailable.toLocaleString()}`);
            return;
        }

        setLoading(true);
        try {
            await fundService.issueQuotas(fund.id, amountNum);
            toast.success(`Successfully issued ${amountNum.toLocaleString()} quotas!`);
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4">
                <h2 className="text-xl font-bold mb-4">Issue Quotas - {fund.name}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-600 mb-2">
                            Current: <span className="font-semibold">{fund.totalIssued.toLocaleString()}</span> / {fund.maxSupply.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 mb-4">
                            Available to issue: <span className="font-semibold text-blue-600">{maxAvailable.toLocaleString()}</span>
                        </p>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount to Issue
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            min="1"
                            max={maxAvailable}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !amount}
                            className="px-4 py-2 text-white bg-primary rounded-md hover:bg-primary/90 disabled:bg-primary/50 transition-colors"
                        >
                            {loading ? 'Issuing...' : 'Issue Quotas'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FundList;
