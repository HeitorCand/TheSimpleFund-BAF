import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { orderService } from '../../services/api';

interface Order {
    id: string;
    fund: { name: string; symbol: string; };
    quantity: number;
    total: number;
    status: string;
    createdAt: string;
}

const OrderList: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

    const loadOrders = useCallback(async () => {
        setLoading(true);
        try {
            const response = await orderService.list();
            setOrders(response.orders || []);
        } catch (error) {
            toast.error('Failed to load orders.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    if (loading) return <div className="text-center p-8">Loading Orders...</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-soft">
            <h2 className="text-xl font-semibold mb-4">My Investment Orders</h2>
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
            {orders.length === 0 && !loading && <p className="text-center text-gray-500 py-8">You have no investment orders.</p>}
        </div>
    );
};

export default OrderList;
