import React, { useState, useEffect } from 'react';
import { FiStar, FiTrendingUp, FiShield, FiClock, FiDollarSign, FiChevronRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { getErrorMessage } from '../utils/errorHandler';
import api from '../services/api';
import { useFundInteraction } from '../hooks/useFundInteraction';

interface RecommendedFund {
    id: string;
    name: string;
    symbol: string;
    fundType: string;
    riskLevel: string;
    sector: string;
    durationMonths: number;
    minTicket: number;
    price: number;
    description: string;
    score: number;
    reason: string;
}

const RecommendedFunds: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { trackInteraction } = useFundInteraction();
    const [recommendations, setRecommendations] = useState<RecommendedFund[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!user?.id) return;

            try {
                setLoading(true);
                setError(null);
                const response = await api.get(`/recommended-funds?investorId=${user.id}`);
                setRecommendations(response.data || []);
            } catch (err) {
                const errorMsg = getErrorMessage(err);
                setError(errorMsg);
                console.error('Error fetching recommendations:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [user?.id]);

    const handleFundClick = async (fundId: string) => {
        await trackInteraction(fundId, 'CLICK');
        navigate(`/funds/${fundId}`);
    };

    const getRiskColor = (risk: string) => {
        switch (risk?.toUpperCase()) {
            case 'BAIXO':
                return 'text-green-600 bg-green-100';
            case 'MEDIO':
                return 'text-yellow-600 bg-yellow-100';
            case 'ALTO':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-soft">
                <div className="flex items-center space-x-2 mb-4">
                    <FiStar className="text-primary text-xl" />
                    <h2 className="text-xl font-bold text-gray-800">Recommended for You</h2>
                </div>
                <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-primary"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-soft">
                <div className="flex items-center space-x-2 mb-4">
                    <FiStar className="text-primary text-xl" />
                    <h2 className="text-xl font-bold text-gray-800">Recommended for You</h2>
                </div>
                <div className="text-center py-6">
                    <p className="text-gray-600">Unable to load recommendations at this time.</p>
                </div>
            </div>
        );
    }

    if (recommendations.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-soft">
                <div className="flex items-center space-x-2 mb-4">
                    <FiStar className="text-primary text-xl" />
                    <h2 className="text-xl font-bold text-gray-800">Recommended for You</h2>
                </div>
                <div className="text-center py-8">
                    <FiTrendingUp className="mx-auto text-5xl text-gray-300 mb-3" />
                    <p className="text-gray-600 mb-2">No recommendations available yet.</p>
                    <p className="text-sm text-gray-500">
                        Start exploring funds to get personalized recommendations based on your preferences.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-soft">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                    <FiStar className="text-primary text-xl" />
                    <h2 className="text-xl font-bold text-gray-800">Recommended for You</h2>
                </div>
                <span className="text-sm text-gray-500">
                    {recommendations.length} {recommendations.length === 1 ? 'fund' : 'funds'}
                </span>
            </div>

            <div className="space-y-4">
                {recommendations.map((fund) => (
                    <div
                        key={fund.id}
                        onClick={() => handleFundClick(fund.id)}
                        className="border border-gray-200 rounded-lg p-4 hover:border-primary hover:shadow-md transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary transition-colors">
                                        {fund.name}
                                    </h3>
                                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                        {fund.symbol}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2">{fund.description}</p>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                                <div className="flex items-center space-x-1 text-yellow-500">
                                    <FiStar className="fill-current" />
                                    <span className="text-sm font-semibold">{fund.score}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                            {fund.fundType && (
                                <span className="inline-flex items-center space-x-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    <FiTrendingUp className="text-xs" />
                                    <span>{fund.fundType}</span>
                                </span>
                            )}
                            {fund.riskLevel && (
                                <span className={`inline-flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded ${getRiskColor(fund.riskLevel)}`}>
                                    <FiShield className="text-xs" />
                                    <span>{fund.riskLevel}</span>
                                </span>
                            )}
                            {fund.sector && (
                                <span className="inline-flex items-center space-x-1 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                    <span>{fund.sector}</span>
                                </span>
                            )}
                            {fund.durationMonths && (
                                <span className="inline-flex items-center space-x-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                    <FiClock className="text-xs" />
                                    <span>{fund.durationMonths}m</span>
                                </span>
                            )}
                            {fund.minTicket && (
                                <span className="inline-flex items-center space-x-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                                    <FiDollarSign className="text-xs" />
                                    <span>Min: R${fund.minTicket.toLocaleString()}</span>
                                </span>
                            )}
                        </div>

                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3">
                            <p className="text-sm text-blue-800">
                                <span className="font-medium">Why recommended:</span> {fund.reason}
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="text-sm">
                                <span className="text-gray-500">Quota price: </span>
                                <span className="font-semibold text-gray-800">R${fund.price.toFixed(2)}</span>
                            </div>
                            <button className="inline-flex items-center space-x-1 text-sm font-medium text-primary group-hover:text-primary-dark transition-colors">
                                <span>View Details</span>
                                <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecommendedFunds;
