import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { orderService } from '../../services/api';
import toast from 'react-hot-toast';
import { FiBriefcase, FiExternalLink, FiCheckCircle } from 'react-icons/fi';
import { getErrorMessage } from '../../utils/errorHandler';
import FiatWithXlmValue from '../../components/FiatWithXlmValue';

interface Order {
    id: string;
    quantity: number;
    total: number;
    price: number;
    status: string;
    approvalStatus: string;
    txHash?: string;
    refundTxHash?: string;
    createdAt: string;
    fund: {
        name: string;
        symbol: string;
    };
}

const Portfolio: React.FC = () => {
    const { publicKey, isConnected, connect } = useWallet();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

    const loadOrders = useCallback(async () => {
        setLoading(true);
        try {
            const response = await orderService.list();
            const approvedOrders = (response.orders || []).filter((o: Order) => 
                o.status === 'COMPLETED' && o.approvalStatus === 'APPROVED'
            );
            setOrders(approvedOrders);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const totalInvested = orders.reduce((sum, order) => sum + order.total, 0);
    const totalQuotas = orders.reduce((sum, order) => sum + order.quantity, 0);

    const groupedOrders = orders.reduce((acc, order) => {
        const symbol = order.fund.symbol;
        if (!acc[symbol]) {
            acc[symbol] = {
                symbol,
                name: order.fund.name,
                totalQuantity: 0,
                totalValue: 0,
                orders: []
            };
        }
        acc[symbol].totalQuantity += order.quantity;
        acc[symbol].totalValue += order.total;
        acc[symbol].orders.push(order);
        return acc;
    }, {} as Record<string, any>);

    if (!isConnected) {
        return (
            <div className="bg-white/[0.04] border border-white/[0.12] backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.45)] text-center">
                <FiBriefcase className="mx-auto text-6xl text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
                <p className="text-gray-600 mb-6">Please connect your Stellar wallet to view your portfolio.</p>
                <button
                    onClick={connect}
                    className="px-6 py-3 text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                >
                    Connect Wallet
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white/[0.04] border border-white/[0.12] backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold flex items-center">
                        <FiBriefcase className="mr-3" />
                        My Portfolio
                    </h2>
                    {publicKey && (
                        <a
                            href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                            <span>View on Stellar Expert</span>
                            <FiExternalLink />
                        </a>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-primary"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                        <FiBriefcase className="mx-auto text-6xl text-gray-300 mb-4" />
                        <p className="text-lg">You haven't completed any investments yet.</p>
                        <p className="text-sm mt-2">Start investing in the Marketplace!</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            <div className="bg-white/[0.04] border border-white/[0.12] backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
                                <p className="text-sm text-green-700">Total Invested</p>
                                <p className="text-2xl font-bold text-green-900">
                                    <FiatWithXlmValue amountUsd={totalInvested} />
                                </p>
                            </div>
                            <div className="bg-white/[0.04] border border-white/[0.12] backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
                                <p className="text-sm text-blue-700">Total Quotas</p>
                                <p className="text-2xl font-bold text-blue-900">{totalQuotas.toLocaleString()}</p>
                            </div>
                            <div className="bg-white/[0.04] border border-white/[0.12] backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
                                <p className="text-sm text-purple-700">Funds Invested</p>
                                <p className="text-2xl font-bold text-purple-900">{Object.keys(groupedOrders).length}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Your Holdings</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.values(groupedOrders).map((group: any) => (
                                    <div key={group.symbol} className="bg-white/[0.04] border border-white/[0.12] backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h4 className="font-bold text-lg">{group.name}</h4>
                                                <p className="text-sm text-gray-500">{group.symbol}</p>
                                            </div>
                                            <FiCheckCircle className="text-green-500 text-xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Total Quotas:</span>
                                                <span className="font-semibold">{group.totalQuantity.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Total Value:</span>
                                                <span className="font-semibold">
                                                    <FiatWithXlmValue amountUsd={group.totalValue} />
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Orders:</span>
                                                <span className="font-semibold">{group.orders.length}</span>
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t">
                                            {group.orders.map((order: Order) => (
                                                <div key={order.id} className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                                    {order.txHash && (
                                                        <a
                                                            href={`https://stellar.expert/explorer/testnet/tx/${order.txHash}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                                                        >
                                                            <span>TX</span>
                                                            <FiExternalLink />
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Portfolio;
