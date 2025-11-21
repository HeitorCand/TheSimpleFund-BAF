import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { orderService } from '../services/api';
import { FiDollarSign, FiList } from 'react-icons/fi';
import { useAuth } from '../contexts/useAuth';

interface Order {
    id: string;
    total: number;
}

const InvestidorDashboard: React.FC = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

    const loadOrders = useCallback(async () => {
        setLoading(true);
        try {
            const response = await orderService.list();
            setOrders(response.orders || []);
        } catch (error) {
            toast.error('Failed to load summary data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const totalInvested = orders.reduce((sum, order) => sum + order.total, 0);

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

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <StatCard 
                    icon={<FiDollarSign />} 
                    title="Total Invested" 
                    value={`${totalInvested.toLocaleString()}`} 
                    color="green" 
                />
                <StatCard 
                    icon={<FiList />} 
                    title="Total Orders" 
                    value={orders.length} 
                    color="blue" 
                />
            </div>

            {/* We could add a chart here in the future */}
        </div>
    );
};

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: number | string; color: string }> = ({ icon, title, value, color }) => (
    <div className="p-6 bg-white rounded-lg shadow-soft flex items-center space-x-4">
      <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
);

export default InvestidorDashboard;