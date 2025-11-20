import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { cedenteService, sacadoService } from '../services/api';
import { FiArrowLeft, FiPlus } from 'react-icons/fi';
import { getErrorMessage } from '../utils/errorHandler';

// --- Type Definitions ---
interface Fund {
    id: string;
    name: string;
}
interface Cedente {
    id: string;
    name: string;
    document: string;
    status: string;
    fund?: {
        id: string;
        name: string;
    };
}
interface Sacado {
    id: string;
    name: string;
    document: string;
    status: string;
    fund?: {
        id: string;
        name: string;
    };
}
interface FundManagementProps {
    fund: Fund;
    onBack: () => void;
}

type Tab = 'assignors' | 'debtors';

// --- Main Component ---
const FundManagement: React.FC<FundManagementProps> = ({ fund, onBack }) => {
    const [activeTab, setActiveTab] = useState<Tab>('assignors');
    const [cedentes, setCedentes] = useState<Cedente[]>([]);
    const [sacados, setSacados] = useState<Sacado[]>([]);
    const [loading, setLoading] = useState(false);
    const [isFormOpen, setFormOpen] = useState(false);

    // Data Loading
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const service = activeTab === 'assignors' ? cedenteService : sacadoService;
            const response = await service.listByFund(fund.id);
            if (activeTab === 'assignors') {
                setCedentes(response?.cedentes || []);
            } else {
                setSacados(response?.sacados || []);
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, [activeTab, fund.id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCreation = () => {
        setFormOpen(false);
        loadData();
    }

    return (
        <>
            {isFormOpen && (
                <CreationForm 
                    fundId={fund.id}
                    type={activeTab}
                    onClose={() => setFormOpen(false)}
                    onCreated={handleCreation}
                />
            )}
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200">
                        <FiArrowLeft />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Manage: {fund.name}</h1>
                </div>

                {/* Tabs & Add Button */}
                <div className="flex justify-between items-center border-b">
                    <nav className="flex space-x-4">
                        <TabButton name="Assignors" active={activeTab === 'assignors'} onClick={() => setActiveTab('assignors')} />
                        <TabButton name="Debtors" active={activeTab === 'debtors'} onClick={() => setActiveTab('debtors')} />
                    </nav>
                    <button onClick={() => setFormOpen(true)} className="flex items-center px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary/90">
                        <FiPlus className="mr-2" />
                        Add {activeTab === 'assignors' ? 'Assignor' : 'Debtor'}
                    </button>
                </div>

                {/* Table */}
                {loading ? <p>Loading...</p> : <DataTable data={activeTab === 'assignors' ? cedentes : sacados} />}
            </div>
        </>
    );
};


// --- Sub-components ---

const TabButton: React.FC<{ name: string, active: boolean, onClick: () => void }> = ({ name, active, onClick }) => (
    <button onClick={onClick} className={`py-3 px-1 border-b-2 font-medium text-sm ${active ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
        {name}
    </button>
);

const DataTable: React.FC<{ data: (Cedente | Sacado)[] }> = ({ data }) => {
    if (data.length === 0) return <p className="text-center text-gray-500 py-8">No items found.</p>;
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Fund</th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(item => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="py-4 px-6">{item.name}</td>
                            <td className="py-4 px-6">{item.document}</td>
                            <td className="py-4 px-6">
                                <span className="text-sm font-medium text-gray-700">
                                    {item.fund?.name || 'N/A'}
                                </span>
                            </td>
                            <td className="py-4 px-6">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {item.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const CreationForm: React.FC<{ fundId: string, type: Tab, onClose: () => void, onCreated: () => void }> = ({ fundId, type, onClose, onCreated }) => {
    const [name, setName] = useState('');
    const [document, setDocument] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const service = type === 'assignors' ? cedenteService : sacadoService;
            await service.create({ name, document, fundId });
            toast.success(`${type === 'assignors' ? 'Assignor' : 'Debtor'} created successfully!`);
            onCreated();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4">
                <h2 className="text-xl font-bold mb-4">Add New {type === 'assignors' ? 'Assignor' : 'Debtor'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name" required className="w-full p-2 border rounded-lg" />
                    <input type="text" value={document} onChange={e => setDocument(e.target.value)} placeholder="Document (CPF/CNPJ)" required className="w-full p-2 border rounded-lg" />
                    <div className="flex justify-end space-x-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 text-white bg-primary rounded-lg disabled:bg-primary/50">
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FundManagement;
