import React, { useState } from 'react';
import toast from 'react-hot-toast';
import * as StellarSdk from 'stellar-sdk';
import { orderService } from '../services/api';
import { useWallet } from '../contexts/WalletContext';

interface Fund {
  id: string;
  name: string;
  symbol: string;
  price: number;
}

interface Props {
  fund: Fund;
  onClose: () => void;
  onConfirm: () => void;
}

const InvestmentModal: React.FC<Props> = ({ fund, onClose, onConfirm }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { publicKey, isConnected, connect, signAndSubmitTransaction } = useWallet();

  const handleInvest = async () => {
    if (!isConnected || !publicKey) {
      toast.error('Please connect your wallet first');
      await connect();
      return;
    }

    setLoading(true);
    try {
      const quantity = parseFloat(amount) / fund.price;
      const total = parseFloat(amount);

      const response = await orderService.create({
        fundId: fund.id,
        quantity,
        total,
      });

      const { order, payment } = response;
      if (!payment) {
        toast.error('Payment details not available');
        return;
      }

      const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
      const account = await server.loadAccount(publicKey);

      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: payment.destination,
            asset: StellarSdk.Asset.native(),
            amount: payment.amount,
          })
        )
        .addMemo(StellarSdk.Memo.text(payment.memo))
        .setTimeout(180)
        .build();

      const txHash = await signAndSubmitTransaction(transaction.toXDR());
      await orderService.complete(order.id, txHash);

      toast.success('Investment successful! Transaction: ' + txHash.substring(0, 8) + '...');
      onConfirm();
      onClose();
    } catch (error: any) {
      console.error('Investment error:', error);
      toast.error(error?.message || 'Investment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 m-4">
        <h2 className="text-2xl font-bold mb-4">Invest in {fund.name}</h2>
        <div className="space-y-4">
          <p>Price per token: ${fund.price}</p>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount to invest (USD)"
            className="w-full p-3 border rounded-lg"
          />
          {amount && (
            <p className="text-sm">
              You will receive approx. {Math.floor(parseFloat(amount) / fund.price)} {fund.symbol} tokens.
            </p>
          )}
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button onClick={onClose} className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
            Cancel
          </button>
          <button
            onClick={handleInvest}
            disabled={loading || !amount}
            className="px-6 py-2 text-white bg-primary rounded-lg hover:bg-primary/90 disabled:bg-primary/50"
          >
            {loading ? 'Processing...' : 'Confirm Investment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvestmentModal;
