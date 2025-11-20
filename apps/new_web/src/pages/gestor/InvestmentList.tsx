import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { orderService } from '../../services/api';
import { getErrorMessage } from '../../utils/errorHandler';

interface Investment {
  id: string;
  quantity: number;
  price: number;
  total: number;
  status: string;
  createdAt: string;
  investor: {
    id: string;
    email: string;
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

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleApprove = async (id: string, action: 'approve' | 'reject') => {
        toast.loading('Processing...');
        try {
            const status = action === 'approve' ? 'COMPLETED' : 'FAILED';
            await orderService.updateStatus(id, status);
            toast.dismiss();
            toast.success(`Investment ${action}d successfully!`);
            loadData();
        } catch (error) {
            toast.dismiss();
            toast.error(getErrorMessage(error));
        }
    };

    if (loading) return <div className="text-center p-8">Loading investments...</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-soft">
            <h2 className="text-xl font-semibold mb-4">Manage Investments</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Investor</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Fund</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {investments.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-8 text-gray-500">
                                    No investments found.
                                </td>
                            </tr>
                        ) : (
                            investments.map((item) => (
                                <tr key={item.id} className="border-b hover:bg-gray-50">
                                    <td className="py-4 px-6">
                                        <p className="font-medium">{item.investor.email}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="font-medium">{item.fund.name}</p>
                                        <p className="text-sm text-gray-500">{item.fund.symbol}</p>
                                    </td>
                                    <td className="py-4 px-6">{item.quantity.toLocaleString()}</td>
                                    <td className="py-4 px-6">${item.total.toLocaleString()}</td>
                                    <td className="py-4 px-6 text-sm text-gray-500">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            item.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                            item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex space-x-2">
                                            {item.status === 'PENDING' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleApprove(item.id, 'approve')} 
                                                        className="px-3 py-1 text-sm text-white bg-green-500 rounded-md hover:bg-green-600"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => handleApprove(item.id, 'reject')} 
                                                        className="px-3 py-1 text-sm text-white bg-red-500 rounded-md hover:bg-red-600"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InvestmentList;
