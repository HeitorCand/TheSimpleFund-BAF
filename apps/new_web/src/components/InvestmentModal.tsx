import React, { useState } from 'react';
import toast from 'react-hot-toast';
import * as StellarSdk from 'stellar-sdk';
import { orderService } from '../services/api';
import { useWallet } from '../contexts/WalletContext';
import FiatWithXlmValue from './FiatWithXlmValue';

interface Fund {
  id: string;
  name: string;
  symbol?: string;
  price: number;
  consultor?: { publicKey?: string };
  fundWalletPublicKey?: string | null;
}
// Investment Modal with Wallet Integration
const InvestmentModal: React.FC<{ fund: Fund, onClose: () => void, onConfirm: () => void }> = ({ fund, onClose, onConfirm }) => {
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

            // Create order and get payment details
            const response = await orderService.create({
                fundId: fund.id,
                quantity,
                total,
                publicKey // Send wallet address to backend
            });

            const { order, payment } = response;

            if (!payment) {
                toast.error('Payment details not available');
                return;
            }

            const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
            
            // Determine token issuer: prefer consultor's wallet, fallback to fund wallet
            const issuerPublicKey = fund.consultor?.publicKey || fund.fundWalletPublicKey;
            
            if (!issuerPublicKey) {
                toast.error('Fund issuer not configured');
                return;
            }
            
            const code = (fund.symbol || 'FUND').substring(0, 12).toUpperCase();
            const fundAsset = new StellarSdk.Asset(code, issuerPublicKey);

            // Step 1: Create trustline for fund token (if not exists)
            // This allows the investor to receive the fund's custom token
            let toastId = toast.loading('Creating trustline for fund token...');
            
            try {
                const account = await server.loadAccount(publicKey);
                
                // Check if trustline already exists
                const existingTrustline = account.balances.find(
                    (b: any) => b.asset_code === fundAsset.code && b.asset_issuer === fundAsset.issuer
                );

                if (!existingTrustline) {
                    const trustlineTransaction = new StellarSdk.TransactionBuilder(account, {
                        fee: StellarSdk.BASE_FEE,
                        networkPassphrase: StellarSdk.Networks.TESTNET
                    })
                      .addOperation(StellarSdk.Operation.changeTrust({
                        asset: fundAsset,
                      }))
                      .addMemo(StellarSdk.Memo.text(`Trust ${code}`))
                      .setTimeout(180)
                      .build();

                    await signAndSubmitTransaction(trustlineTransaction.toXDR());
                    toast.dismiss(toastId);
                    toast.success('Trustline created successfully!');
                } else {
                    toast.dismiss(toastId);
                    toast.success('Trustline already exists!');
                }
            } catch (trustError: any) {
                toast.dismiss(toastId);
                console.error('Trustline error:', trustError);
                toast.error('Failed to create trustline: ' + (trustError.message || 'Unknown error'));
                return;
            }

            // Step 2: Make payment for investment
            toastId = toast.loading('Processing payment...');
            
            const account = await server.loadAccount(publicKey);
            const transaction = new StellarSdk.TransactionBuilder(account, {
                fee: StellarSdk.BASE_FEE,
                networkPassphrase: StellarSdk.Networks.TESTNET
            })
              .addOperation(StellarSdk.Operation.payment({
                destination: payment.destination,
                asset: StellarSdk.Asset.native(),
                amount: payment.amount
              }))
              .addMemo(StellarSdk.Memo.text(payment.memo))
              .setTimeout(180)
              .build();

            // Sign and submit via wallet
            const txHash = await signAndSubmitTransaction(transaction.toXDR());
            
            toast.dismiss(toastId);

            // Complete the order with tx hash
            await orderService.complete(order.id, txHash);

            toast.success(`Investment successful! You will receive ${quantity} ${fund.symbol} tokens after approval.`);
            onConfirm();
            onClose();
        } catch (error: any) {
            console.error('Investment error:', error);
            toast.dismiss(); // Dismiss all toasts
            toast.error(error.message || 'Investment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 m-4">
                <h2 className="text-2xl font-bold mb-4">Invest in {fund.name}</h2>
                <div className="space-y-4">
                    <p>Price per token: <FiatWithXlmValue amountUsd={fund.price} /></p>
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)} 
                        placeholder="Amount to invest (USD)" 
                        className="w-full p-3 border rounded-lg"
                    />
                    {amount && (
                        <div className="text-sm space-y-1">
                            <p>You will receive approx. {Math.floor(parseFloat(amount) / fund.price)} {fund.symbol || 'TOKEN'} tokens.</p>
                            <p className="text-gray-600">
                                Investment: <FiatWithXlmValue amountUsd={parseFloat(amount)} />
                            </p>
                        </div>
                    )}
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={onClose} className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button onClick={handleInvest} disabled={loading || !amount} className="px-6 py-2 text-white bg-primary rounded-lg hover:bg-primary/90 disabled:bg-primary/50">
                        {loading ? 'Processing...' : 'Confirm Investment'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default InvestmentModal;
