import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { userService } from '../../services/api';
import type { User } from '../../contexts/AuthContext';
import { getErrorMessage } from '../../utils/errorHandler';

const ConsultorList: React.FC = () => {
    const [consultores, setConsultores] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await userService.getConsultores();
            setConsultores(response?.consultores || []);
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
            await userService.approveUser(id, status);
            toast.dismiss();
            toast.success(`Consultant ${action}d successfully!`);
            loadData();
        } catch {
            toast.dismiss();
            toast.error('Error processing approval.');
        }
    };

    if (loading) return <div className="text-center p-8 text-white">Loading consultants...</div>;

    return (
        <div className="p-6 rounded-lg shadow-lg bg-dark-200">
            <h2 className="text-xl font-semibold mb-4 text-white">Manage Consultants</h2>
            <div className="space-y-4">
                {consultores.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">No consultants found.</p>
                ) : (
                    consultores.map((item) => (
                        <div key={item.id} className="bg-dark-200 border-b border-gray-700 last:border-b-0 pb-4 last:pb-0 flex flex-col sm:flex-row justify-between sm:items-center rounded-lg p-4">
                            <div>
                                <p className="font-semibold text-white">{item.email}</p>
                                <p className="text-sm text-gray-300">Status: {item.status}</p>
                            </div>
                            <div className="flex space-x-2 mt-2 sm:mt-0">
                                {item.status === 'PENDING' && (
                                    <>
                                        <button onClick={() => handleApprove(item.id, 'approve')} className="px-3 py-1 text-sm text-white bg-primary rounded-md hover:bg-primary/90">Approve</button>
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

export default ConsultorList;
