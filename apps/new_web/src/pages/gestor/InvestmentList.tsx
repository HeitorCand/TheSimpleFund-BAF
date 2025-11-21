import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { orderService } from '../../services/api';
import { getErrorMessage } from '../../utils/errorHandler';
import { useOrderApproval } from '../../hooks/useOrderApproval';
import FilterBar from '../../components/FilterBar';
import { StatusBadge } from '../../components/StatusBadge';
import { TransactionLinks } from '../../components/TransactionLinks';

interface Investment {
  id: string;
  quantity: number;
  price: number;
  total: number;
  status: string;
  approvalStatus: string;
  txHash?: string;
  refundTxHash?: string;
  tokenMintTxHash?: string;
  createdAt: string;
  investor: {
    id: string;
    email: string;
    publicKey?: string;
  };
  fund: {
    id: string;
    name: string;
    symbol: string;
  };
}

const InvestmentList: React.FC = () => {
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterApproval, setFilterApproval] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await orderService.list();
            setInvestments(response?.orders || []);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, []);

    const { processingId, handleApprove, handleReject } = useOrderApproval(loadData);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredInvestments = investments.filter((item) => {
        const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
        const matchesApproval = filterApproval === 'all' || item.approvalStatus === filterApproval;
        const matchesSearch = searchTerm === '' || 
            item.investor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.fund.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.fund.symbol.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesStatus && matchesApproval && matchesSearch;
    });

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilterStatus('all');
        setFilterApproval('all');
    };

    if (loading) return <div className="text-center p-8">Loading investments...</div>;

    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-soft">
            <h2 className="text-xl font-semibold mb-4">Manage Investments</h2>
            
            <FilterBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterStatus={filterStatus}
                onStatusChange={setFilterStatus}
                filterApproval={filterApproval}
                onApprovalChange={setFilterApproval}
                onClearFilters={handleClearFilters}
                searchPlaceholder="Search by investor, fund name or symbol..."
            />
            
            <div className="text-sm text-gray-600 mb-4">
                Showing {filteredInvestments.length} of {investments.length} investments
            </div>

            {filteredInvestments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    {investments.length === 0 ? 'No investments found.' : 'No investments match the selected filters.'}
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Investor</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Fund</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvestments.map((item) => (
                                    <tr key={item.id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <p className="font-medium text-sm">{item.investor.email}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="font-medium text-sm">{item.fund.name}</p>
                                            <p className="text-xs text-gray-500">{item.fund.symbol}</p>
                                        </td>
                                        <td className="py-3 px-4 text-sm">{item.quantity.toLocaleString()}</td>
                                        <td className="py-3 px-4 text-sm font-medium">${item.total.toLocaleString()}</td>
                                        <td className="py-3 px-4 text-xs text-gray-500">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full text-center ${
                                                    item.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                    item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {item.status}
                                                </span>
                                                {item.approvalStatus && (
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full text-center ${
                                                        item.approvalStatus === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                                                        item.approvalStatus === 'PENDING_APPROVAL' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {item.approvalStatus.replace('_', ' ')}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex flex-col gap-1.5">
                                                {item.status === 'COMPLETED' && item.approvalStatus === 'PENDING_APPROVAL' && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleApprove(item)} 
                                                            disabled={processingId === item.id}
                                                            className="px-2.5 py-1 text-xs text-white bg-green-500 rounded hover:bg-green-600 disabled:bg-green-300 whitespace-nowrap"
                                                        >
                                                            {processingId === item.id ? 'Processing...' : 'Approve'}
                                                        </button>
                                                        <button 
                                                            onClick={() => handleReject(item)} 
                                                            disabled={processingId === item.id}
                                                            className="px-2.5 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600 disabled:bg-red-300 whitespace-nowrap"
                                                        >
                                                            {processingId === item.id ? 'Processing...' : 'Reject'}
                                                        </button>
                                                    </>
                                                )}
                                                {item.txHash && (
                                                    <a 
                                                        href={`https://stellar.expert/explorer/testnet/tx/${item.txHash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-blue-600 hover:underline"
                                                    >
                                                        Payment Tx
                                                    </a>
                                                )}
                                                {item.refundTxHash && (
                                                    <a 
                                                        href={`https://stellar.expert/explorer/testnet/tx/${item.refundTxHash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-purple-600 hover:underline"
                                                    >
                                                        Refund Tx
                                                    </a>
                                                )}
                                                {item.tokenMintTxHash && (
                                                    <a 
                                                        href={`https://stellar.expert/explorer/testnet/tx/${item.tokenMintTxHash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-green-600 hover:underline"
                                                    >
                                                        Token Mint Tx
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {filteredInvestments.map((item) => (
                            <div key={item.id} className="border rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-gray-900">{item.investor.email}</p>
                                        <p className="text-sm text-gray-600">{item.fund.name} ({item.fund.symbol})</p>
                                    </div>
                                    <div className="flex flex-col gap-1 items-end">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            item.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                            item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {item.status}
                                        </span>
                                        {item.approvalStatus && (
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                item.approvalStatus === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                                                item.approvalStatus === 'PENDING_APPROVAL' ? 'bg-orange-100 text-orange-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {item.approvalStatus.replace('_', ' ')}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-gray-500">Quantity:</span>
                                        <p className="font-medium">{item.quantity.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Total:</span>
                                        <p className="font-medium">${item.total.toLocaleString()}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-gray-500">Date:</span>
                                        <p className="font-medium">{new Date(item.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 pt-2 border-t">
                                    {item.status === 'COMPLETED' && item.approvalStatus === 'PENDING_APPROVAL' && (
                                        <div className="grid grid-cols-2 gap-2">
                                            <button 
                                                onClick={() => handleApprove(item)} 
                                                disabled={processingId === item.id}
                                                className="px-3 py-2 text-sm text-white bg-green-500 rounded-md hover:bg-green-600 disabled:bg-green-300"
                                            >
                                                {processingId === item.id ? 'Processing...' : 'Approve'}
                                            </button>
                                            <button 
                                                onClick={() => handleReject(item)} 
                                                disabled={processingId === item.id}
                                                className="px-3 py-2 text-sm text-white bg-red-500 rounded-md hover:bg-red-600 disabled:bg-red-300"
                                            >
                                                {processingId === item.id ? 'Processing...' : 'Reject'}
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-1">
                                        {item.txHash && (
                                            <a 
                                                href={`https://stellar.expert/explorer/testnet/tx/${item.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-600 hover:underline"
                                            >
                                                View Payment Transaction
                                            </a>
                                        )}
                                        {item.refundTxHash && (
                                            <a 
                                                href={`https://stellar.expert/explorer/testnet/tx/${item.refundTxHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-purple-600 hover:underline"
                                            >
                                                View Refund Transaction
                                            </a>
                                        )}
                                        {item.tokenMintTxHash && (
                                            <a 
                                                href={`https://stellar.expert/explorer/testnet/tx/${item.tokenMintTxHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-green-600 hover:underline"
                                            >
                                                View Token Mint Transaction
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default InvestmentList;
