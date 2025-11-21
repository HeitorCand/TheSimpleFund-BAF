import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/useAuth';
import { stellarService } from '../../services/api';
import toast from 'react-hot-toast';
import { FiBriefcase } from 'react-icons/fi';

interface Balance {
    asset_type: string;
    asset_code?: string;
    balance: string;
}

const Portfolio: React.FC = () => {
    const { user } = useAuth();
    const [balances, setBalances] = useState<Balance[]>([]);
    const [loading, setLoading] = useState(false);

    const loadBalances = useCallback(async () => {
        if (!user?.stellar_public_key) {
            return;
        }
        setLoading(true);
        try {
            const response = await stellarService.getBalance(user.stellar_public_key);
            // Filter out the native XLM asset to only show fund tokens
            setBalances(response.balances.filter((b: Balance) => b.asset_type !== 'native') || []);
        } catch (error) {
            toast.error('Could not load portfolio balances.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [user?.stellar_public_key]);

    useEffect(() => {
        loadBalances();
    }, [loadBalances]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-soft">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
                <FiBriefcase className="mr-3" />
                My Portfolio (Asset Balances)
            </h2>
            
            {loading ? (
                <p className="text-center text-gray-500 py-8">Loading your balances...</p>
            ) : !user?.stellar_public_key ? (
                <p className="text-center text-gray-500 py-8">Please set up your Stellar Wallet to see your portfolio.</p>
            ) : balances.length === 0 ? (
                <p className="text-center text-gray-500 py-8">You do not own any fund tokens yet.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {balances.map((bal, index) => (
                        <div key={index} className="bg-gray-50 border border-gray-200 p-6 rounded-lg text-center">
                            <p className="text-sm text-gray-500">You own</p>
                            <p className="text-3xl font-bold text-primary my-2">{parseFloat(bal.balance).toLocaleString()}</p>
                            <p className="font-semibold text-lg text-gray-700">{bal.asset_code}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Portfolio;
