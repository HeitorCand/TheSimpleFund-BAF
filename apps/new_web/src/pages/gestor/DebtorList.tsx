import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { sacadoService } from '../../services/api';
import { getErrorMessage } from '../../utils/errorHandler';
import { useAuth } from '../../contexts/useAuth';
import { Link, Navigate } from 'react-router-dom';

interface Debtor {
  id: string;
  name: string;
  document: string;
  status: string;
  fund?: {
    id: string;
    name: string;
  };
}

const DebtorList: React.FC = () => {
    const [debtors, setDebtors] = useState<Debtor[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const role = user?.role as string | undefined;

    if (role === 'CONSULTOR') {
        return <Navigate to="/dashboard" replace />;
    }
    if (role && role !== 'GESTOR') {
        return <p className="p-6 text-gray-600">Access restricted.</p>;
    }

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await sacadoService.list();
            setDebtors(response?.sacados || []);
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
            const status = action === 'approve' ? 'APPROVED' : 'REJECTED';
            await sacadoService.updateStatus(id, status);
            toast.dismiss();
            toast.success(`Debtor ${action}d successfully!`);
            loadData();
        } catch {
            toast.dismiss();
            toast.error('Error processing approval.');
        }
    };

    if (loading) return <div className="text-center p-8">Loading debtors...</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-soft">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Manage Debtors</h2>
                {user?.role === 'CONSULTOR' && (
                    <Link
                        to="/dashboard/debtors/new"
                        className="px-3 py-2 text-sm text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
                    >
                        + Create Debtor
                    </Link>
                )}
            </div>
            <div className="space-y-4">
                {debtors.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No debtors found.</p>
                ) : (
                    debtors.map((item) => (
                        <div key={item.id} className="border-b last:border-b-0 pb-4 last:pb-0 flex flex-col sm:flex-row justify-between sm:items-center">
                            <div>
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-sm text-gray-500">{item.document}</p>
                                <p className="text-sm text-gray-600"><span className="font-medium">Fund:</span> {item.fund?.name || 'N/A'}</p>
                                <p className="text-sm text-gray-500">Status: {item.status}</p>
                            </div>
                            <div className="flex space-x-2 mt-2 sm:mt-0">
                                {item.status === 'PENDING' && (
                                    <>
                                        <button onClick={() => handleApprove(item.id, 'approve')} className="px-3 py-1 text-sm text-white bg-green-500 rounded-md hover:bg-green-600">Approve</button>
                                        <button onClick={() => handleApprove(item.id, 'reject')} className="px-3 py-1 text-sm text-white bg-red-500 rounded-md hover:bg-red-600">Reject</button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DebtorList;
