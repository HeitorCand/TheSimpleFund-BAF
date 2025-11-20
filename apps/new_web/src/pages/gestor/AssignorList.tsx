import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { cedenteService } from '../../services/api';

interface Assignor {
  id: string;
  name: string;
  document: string;
  status: string;
}

const AssignorList: React.FC = () => {
    const [assignors, setAssignors] = useState<Assignor[]>([]);
    const [loading, setLoading] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await cedenteService.list();
            setAssignors(response?.cedentes || []);
        } catch (error) {
            toast.error('Error loading assignors.');
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
            await cedenteService.updateStatus(id, status);
            toast.dismiss();
            toast.success(`Assignor ${action}d successfully!`);
            loadData();
        } catch {
            toast.dismiss();
            toast.error('Error processing approval.');
        }
    };

    if (loading) return <div className="text-center p-8">Loading assignors...</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-soft">
            <h2 className="text-xl font-semibold mb-4">Manage Assignors</h2>
            <div className="space-y-4">
                {assignors.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No assignors found.</p>
                ) : (
                    assignors.map((item) => (
                        <div key={item.id} className="border-b last:border-b-0 pb-4 last:pb-0 flex flex-col sm:flex-row justify-between sm:items-center">
                            <div>
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-sm text-gray-500">{item.document}</p>
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

export default AssignorList;
