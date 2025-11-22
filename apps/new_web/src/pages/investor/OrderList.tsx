import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { orderService } from '../../services/api';
import { FiX } from 'react-icons/fi';
import { getErrorMessage } from '../../utils/errorHandler';
import FilterBar from '../../components/FilterBar';
import { StatusBadge } from '../../components/StatusBadge';
import { TransactionLinks } from '../../components/TransactionLinks';

interface Order {
    id: string;
    fund: { name: string; symbol: string; };
    quantity: number;
    total: number;
    status: string;
    approvalStatus: string;
    txHash?: string;
    refundTxHash?: string;
    tokenMintTxHash?: string;
    createdAt: string;
}

const OrderList: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterApproval, setFilterApproval] = useState('all');

    const loadOrders = useCallback(async () => {
        setLoading(true);
        try {
            const response = await orderService.list();
            setOrders(response.orders || []);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const handleCancelOrder = async (orderId: string) => {
        if (!confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        setCancellingId(orderId);
        try {
            await orderService.cancel(orderId);
            toast.success('Order cancelled successfully');
            loadOrders();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setCancellingId(null);
        }
    };

    // Filter logic
    const filteredOrders = orders.filter((order) => {
        const matchesSearch = order.fund.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.fund.symbol.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        const matchesApproval = filterApproval === 'all' || order.approvalStatus === filterApproval;
        return matchesSearch && matchesStatus && matchesApproval;
    });

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilterStatus('all');
        setFilterApproval('all');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-primary"></div>
            </div>
        );
    }

    return (
        <div className="bg-white/[0.04] border border-white/[0.12] backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
            <h2 className="text-xl font-semibold mb-4">My Investment Orders</h2>
            
            <FilterBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterStatus={filterStatus}
                onStatusChange={setFilterStatus}
                filterApproval={filterApproval}
                onApprovalChange={setFilterApproval}
                onClearFilters={handleClearFilters}
                searchPlaceholder="Search by fund name or symbol..."
            />

            <div className="text-sm text-gray-500 mb-4">
                Showing {filteredOrders.length} of {orders.length} orders
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-transparent">
                        <tr>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Fund</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Approval</th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(order => (
                            <tr key={order.id} className="border-b border-gray-700 hover:bg-white/[0.08]">
                                <td className="py-4 px-6">
                                    <div>
                                        <p className="font-medium">{order.fund.name}</p>
                                        <p className="text-sm text-gray-500">{order.fund.symbol}</p>
                                    </div>
                                </td>
                                <td className="py-4 px-6">{order.quantity.toLocaleString()}</td>
                                <td className="py-4 px-6 font-semibold">${order.total.toLocaleString()}</td>
                                <td className="py-4 px-6 text-sm text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-6">
                                    <StatusBadge status={order.status} type="payment" />
                                </td>
                                <td className="py-4 px-6">
                                    <StatusBadge status={order.approvalStatus} type="approval" />
                                </td>
                                <td className="py-4 px-6">
                                    <TransactionLinks
                                        txHash={order.txHash}
                                        refundTxHash={order.refundTxHash}
                                        tokenMintTxHash={order.tokenMintTxHash}
                                    />
                                    {order.status === 'PENDING' && (
                                        <button
                                            onClick={() => handleCancelOrder(order.id)}
                                            disabled={cancellingId === order.id}
                                            className="text-red-600 hover:text-red-800 flex items-center space-x-1 text-sm disabled:opacity-50"
                                        >
                                            <FiX />
                                            <span>{cancellingId === order.id ? 'Cancelling...' : 'Cancel'}</span>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {filteredOrders.map((order) => (
                    <div key={order.id} className="bg-white/[0.04] border border-white/[0.12] backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.45)] space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold text-lg">{order.fund.name}</p>
                                <p className="text-sm text-gray-500">{order.fund.symbol}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg">${order.total.toLocaleString()}</p>
                                <p className="text-sm text-gray-500">{order.quantity.toLocaleString()} units</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <StatusBadge status={order.status} type="payment" />
                            <StatusBadge status={order.approvalStatus} type="approval" />
                        </div>

                        <div className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                        </div>

                        <div className="flex flex-col gap-2 pt-2 border-t">
                            <TransactionLinks
                                txHash={order.txHash}
                                refundTxHash={order.refundTxHash}
                                tokenMintTxHash={order.tokenMintTxHash}
                            />
                            {order.status === 'PENDING' && (
                                <button
                                    onClick={() => handleCancelOrder(order.id)}
                                    disabled={cancellingId === order.id}
                                    className="text-red-600 hover:text-red-800 flex items-center space-x-1 text-sm disabled:opacity-50"
                                >
                                    <FiX />
                                    <span>{cancellingId === order.id ? 'Cancelling...' : 'Cancel'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredOrders.length === 0 && !loading && (
                <div className="text-center text-gray-400 py-12">
                    {orders.length === 0 ? (
                        <>
                            <p className="text-lg">You have no investment orders yet.</p>
                            <p className="text-sm mt-2">Start investing in the Marketplace!</p>
                        </>
                    ) : (
                        <p className="text-lg">No orders match your filters.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrderList;
