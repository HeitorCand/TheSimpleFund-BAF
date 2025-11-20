import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { fundService } from '../services/api';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFundCreated: () => void;
}

const FundCreationModal: React.FC<ModalProps> = ({ isOpen, onClose, onFundCreated }) => {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [price, setPrice] = useState('');
  const [maxSupply, setMaxSupply] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fundService.create({
        name,
        symbol,
        description,
        targetAmount: parseFloat(targetAmount),
        price: parseFloat(price),
        maxSupply: parseInt(maxSupply),
      });
      toast.success('Fund created successfully! It is now pending manager approval.');
      onFundCreated();
      onClose();
    } catch (error) {
      toast.error('Failed to create fund.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-8 m-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create a New Fund</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form fields */}
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Fund Name" required className="w-full p-3 border rounded-lg" />
          <input type="text" value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="Token Symbol (e.g., FNDA)" required className="w-full p-3 border rounded-lg" />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" required className="w-full p-3 border rounded-lg" />
          <input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="Target Amount (BRL)" required className="w-full p-3 border rounded-lg" />
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price per Token (BRL)" required className="w-full p-3 border rounded-lg" />
          <input type="number" value={maxSupply} onChange={e => setMaxSupply(e.target.value)} placeholder="Max Token Supply" required className="w-full p-3 border rounded-lg" />
          
          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 text-white bg-primary rounded-lg hover:bg-primary/90 disabled:bg-primary/50">
              {loading ? 'Creating...' : 'Create Fund'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FundCreationModal;
