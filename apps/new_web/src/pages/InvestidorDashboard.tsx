import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { orderService, fundService } from '../services/api';
import { FiDollarSign, FiList, FiClock, FiCheckCircle, FiBox, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '../contexts/useAuth';
import { getErrorMessage } from '../utils/errorHandler';

interface Order {
    id: string;
    total: number;
    quantity: number;
    status: string;
    fund?: {
        name: string;
        quotaPrice: number;
    };
}

interface Fund {
    id: string;
    name: string;
    status: string;
}

const InvestidorDashboard: React.FC = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [funds, setFunds] = useState<Fund[]>([]);
    const [loading, setLoading] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [ordersResponse, fundsResponse] = await Promise.all([
                orderService.list(),
                fundService.list()
            ]);
            setOrders(ordersResponse.orders || []);
            setFunds(fundsResponse.funds || []);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const pendingOrders = orders.filter(order => order.status === 'PENDING');
    const completedOrders = orders.filter(order => order.status === 'COMPLETED');
    const totalInvested = completedOrders.reduce((sum, order) => sum + order.total, 0);
    const totalPendingValue = pendingOrders.reduce((sum, order) => sum + order.total, 0);
    const totalQuotas = completedOrders.reduce((sum, order) => sum + order.quantity, 0);
    const availableFunds = funds.filter(fund => fund.status === 'APPROVED').length;

    if (user?.status !== 'APPROVED') {
        return (
            <div className="bg-white p-8 rounded-lg shadow-soft text-center">
                <h2 className="text-2xl font-bold mb-2">Awaiting Approval</h2>
                <p className="text-gray-600">Your account is currently {user?.status}. You'll get access once approved.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-soft">
                <h1 className="text-3xl font-bold text-gray-800">Welcome, Investor!</h1>
                <p className="mt-2 text-gray-600">Here is a summary of your investment activity.</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-primary"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <StatCard 
                            icon={<FiDollarSign />} 
                            title="Total Invested" 
                            value={`$${totalInvested.toLocaleString()}`} 
                            color="green" 
                        />
                        <StatCard 
                            icon={<FiCheckCircle />} 
                            title="Completed Orders" 
                            value={completedOrders.length} 
                            color="blue" 
                        />
                        <StatCard 
                            icon={<FiClock />} 
                            title="Pending Orders" 
                            value={pendingOrders.length}
                            subtitle={totalPendingValue > 0 ? `$${totalPendingValue.toLocaleString()}` : undefined}
                            color="yellow" 
                        />
                        <StatCard 
                            icon={<FiTrendingUp />} 
                            title="Total Quotas" 
                            value={totalQuotas} 
                            color="purple" 
                        />
                        <StatCard 
                            icon={<FiBox />} 
                            title="Available Funds" 
                            value={availableFunds} 
                            color="indigo" 
                        />
                        <StatCard 
                            icon={<FiList />} 
                            title="Total Orders" 
                            value={orders.length} 
                            color="gray" 
                        />
                    </div>

                    {pendingOrders.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                            <div className="flex items-start space-x-3">
                                <FiClock className="text-yellow-600 text-xl mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">Pending Orders</h3>
                                    <p className="text-yellow-700 text-sm mb-3">
                                        You have {pendingOrders.length} order{pendingOrders.length > 1 ? 's' : ''} awaiting approval with a total value of ${totalPendingValue.toLocaleString()}.
                                    </p>
                                    <div className="space-y-2">
                                        {pendingOrders.map(order => (
                                            <div key={order.id} className="bg-white rounded p-3 text-sm">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-gray-800">
                                                        {order.fund?.name || 'Fund'}
                                                    </span>
                                                    <span className="text-gray-600">
                                                        {order.quantity} quotas × ${order.fund?.quotaPrice || 0} = ${order.total.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: number | string; color: string; subtitle?: string }> = ({ icon, title, value, color, subtitle }) => {
    const colorClasses = {
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        purple: 'bg-purple-100 text-purple-600',
        indigo: 'bg-indigo-100 text-indigo-600',
        gray: 'bg-gray-100 text-gray-600',
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-soft flex items-center space-x-4">
            <div className={`p-3 rounded-full text-2xl ${colorClasses[color as keyof typeof colorClasses]}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
            </div>
        </div>
    );
};

export default InvestidorDashboard;
