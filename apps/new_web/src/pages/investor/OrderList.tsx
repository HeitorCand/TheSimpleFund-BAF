import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { orderService } from '../../services/api';
import { FiExternalLink, FiX, FiClock, FiCheckCircle, FiXCircle, FiFilter } from 'react-icons/fi';
import { getErrorMessage } from '../../utils/errorHandler';

interface Order {
    id: string;
    fund: { name: string; symbol: string; };
    quantity: number;
    total: number;
    status: string;
    approvalStatus: string;
    txHash?: string;
    refundTxHash?: string;
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

    const getStatusBadge = (status: string) => {
        switch (status.toUpperCase()) {
            case 'COMPLETED':
                return (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        <FiCheckCircle />
                        <span>Completed</span>
                    </span>
                );
            case 'PENDING':
                return (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        <FiClock />
                        <span>Pending</span>
                    </span>
                );
            case 'FAILED':
                return (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        <FiXCircle />
                        <span>Failed</span>
                    </span>
                );
            default:
                return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    const getApprovalBadge = (approvalStatus: string) => {
        switch (approvalStatus.toUpperCase()) {
            case 'APPROVED':
                return (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        <FiCheckCircle />
                        <span>Approved</span>
                    </span>
                );
            case 'PENDING_APPROVAL':
                return (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                        <FiClock />
                        <span>Awaiting Approval</span>
                    </span>
                );
            case 'REJECTED':
                return (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        <FiXCircle />
                        <span>Rejected</span>
                    </span>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-primary"></div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-soft">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h2 className="text-xl font-semibold mb-4 md:mb-0">My Investment Orders</h2>
                <div className="text-sm text-gray-500">
                    Showing {filteredOrders.length} of {orders.length} orders
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                    <FiFilter className="text-primary" />
                    <span className="font-medium">Filters</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Search by fund name or symbol..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        <option value="all">All Payment Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="FAILED">Failed</option>
                    </select>
                    <select
                        value={filterApproval}
                        onChange={(e) => setFilterApproval(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        <option value="all">All Approval Status</option>
                        <option value="PENDING_APPROVAL">Awaiting Approval</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                    <button
                        onClick={handleClearFilters}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
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
                            <tr key={order.id} className="border-b hover:bg-gray-50">
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
                                    {getStatusBadge(order.status)}
                                </td>
                                <td className="py-4 px-6">
                                    {getApprovalBadge(order.approvalStatus)}
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex flex-col gap-2">
                                        {order.txHash && (
                                            <a
                                                href={`https://stellar.expert/explorer/testnet/tx/${order.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 text-sm"
                                            >
                                                <span>View Payment TX</span>
                                                <FiExternalLink />
                                            </a>
                                        )}
                                        {order.refundTxHash && (
                                            <a
                                                href={`https://stellar.expert/explorer/testnet/tx/${order.refundTxHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-purple-600 hover:text-purple-800 flex items-center space-x-1 text-sm"
                                            >
                                                <span>View Refund TX</span>
                                                <FiExternalLink />
                                            </a>
                                        )}
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
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {filteredOrders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
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
                            {getStatusBadge(order.status)}
                            {getApprovalBadge(order.approvalStatus)}
                        </div>

                        <div className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                        </div>

                        <div className="flex flex-col gap-2 pt-2 border-t">
                            {order.txHash && (
                                <a
                                    href={`https://stellar.expert/explorer/testnet/tx/${order.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 text-sm"
                                >
                                    <span>View Payment TX</span>
                                    <FiExternalLink />
                                </a>
                            )}
                            {order.refundTxHash && (
                                <a
                                    href={`https://stellar.expert/explorer/testnet/tx/${order.refundTxHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-600 hover:text-purple-800 flex items-center space-x-1 text-sm"
                                >
                                    <span>View Refund TX</span>
                                    <FiExternalLink />
                                </a>
                            )}
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
                <div className="text-center text-gray-500 py-12">
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
