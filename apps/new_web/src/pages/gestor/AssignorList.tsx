import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { cedenteService } from '../../services/api';
import { getErrorMessage } from '../../utils/errorHandler';
import { useAuth } from '../../contexts/useAuth';
import { Link, Navigate } from 'react-router-dom';

interface Assignor {
  id: string;
  name: string;
  document: string;
  fantasyName?: string;
  cnae?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  beneficialOwners?: string;
  isPep?: boolean | null;
  revenueLast12m?: number | null;
  totalDebt?: number | null;
  mainBanks?: string;
  riskRating?: string;
  operationDescription?: string;
  creditPolicy?: string;
  guarantees?: string;
  status: string;
  fund?: {
    id: string;
    name: string;
  };
}

const AssignorList: React.FC = () => {
    const [assignors, setAssignors] = useState<Assignor[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<Assignor | null>(null);
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
            const response = await cedenteService.list();
            setAssignors(response?.cedentes || []);
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
            await cedenteService.updateStatus(id, status);
            toast.dismiss();
            toast.success(`Assignor ${action}d successfully!`);
            loadData();
            setSelected(null);
        } catch {
            toast.dismiss();
            toast.error('Error processing approval.');
        }
    };

    if (loading) return <div className="text-center p-8">Loading assignors...</div>;

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-soft">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Manage Assignors</h2>
                    {user?.role === 'CONSULTOR' && (
                        <Link
                            to="/dashboard/assignors/new"
                            className="px-3 py-2 text-sm text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
                        >
                            + Create Assignor
                        </Link>
                    )}
                </div>
                <div className="space-y-4">
                    {assignors.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No assignors found.</p>
                    ) : (
                        assignors.map((item) => (
                            <div key={item.id} className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-lg text-gray-900">{item.name}</p>
                                    <p className="text-sm text-gray-600">Fund: {item.fund?.name || 'N/A'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                        item.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                        item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {item.status}
                                    </span>
                                    <button
                                        onClick={() => setSelected(item)}
                                        className="px-3 py-1.5 text-sm text-primary border border-primary rounded-md hover:bg-primary/10 transition-colors"
                                    >
                                        More info
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 m-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">{selected.name}</h3>
                                <p className="text-sm text-gray-600">Document: {selected.document}</p>
                                <p className="text-sm text-gray-600">Fund: {selected.fund?.name || 'N/A'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                    selected.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                    selected.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {selected.status}
                                </span>
                                <button
                                    onClick={() => setSelected(null)}
                                    className="text-sm text-gray-600 hover:underline"
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm text-gray-700">
                            <Info label="Trade name" value={selected.fantasyName} />
                            <Info label="CNAE" value={selected.cnae} />
                            <Info label="Email" value={selected.email} />
                            <Info label="Phone" value={selected.phone} />
                            <Info label="Website" value={selected.website} />
                            <Info label="Address" value={selected.address} />
                            <Info label="City" value={selected.city} />
                            <Info label="State" value={selected.state} />
                            <Info label="Country" value={selected.country} />
                            <Info label="Postal code" value={selected.postalCode} />
                            <Info label="Beneficial owners" value={selected.beneficialOwners} />
                            <Info label="PEP" value={selected.isPep !== null && selected.isPep !== undefined ? (selected.isPep ? 'Yes' : 'No') : undefined} />
                            <Info label="Revenue last 12m" value={selected.revenueLast12m ? `$${selected.revenueLast12m.toLocaleString()}` : undefined} />
                            <Info label="Total debt" value={selected.totalDebt ? `$${selected.totalDebt.toLocaleString()}` : undefined} />
                            <Info label="Main banks" value={selected.mainBanks} />
                            <Info label="Risk rating" value={selected.riskRating} />
                            <Info label="Operation description" value={selected.operationDescription} />
                            <Info label="Credit policy" value={selected.creditPolicy} />
                            <Info label="Guarantees" value={selected.guarantees} />
                        </div>

                        {selected.status === 'PENDING' && (
                            <div className="flex gap-2 justify-end mt-4">
                                <button
                                    onClick={() => selected && handleApprove(selected.id, 'approve')}
                                    className="px-4 py-2 text-sm text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => selected && handleApprove(selected.id, 'reject')}
                                    className="px-4 py-2 text-sm text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

const Info: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => (
    <div>
        <p className="text-xs uppercase text-gray-500 font-semibold">{label}</p>
        <p className="text-sm text-gray-800">{value ?? 'N/A'}</p>
    </div>
);

export default AssignorList;
