import { useState } from 'react';
import toast from 'react-hot-toast';
import { orderService } from '../services/api';
import { useWallet } from '../contexts/WalletContext';
import { buildPaymentTransaction, buildTokenMintTransaction } from '../utils/stellar';
import { getErrorMessage } from '../utils/errorHandler';

interface Order {
  id: string;
  quantity: number;
  total: number;
  investor: {
    publicKey?: string;
  };
  fund: {
    name: string;
    symbol: string;
  };
}

export const useOrderApproval = (onSuccess: () => void) => {
  const { publicKey, isConnected, connect, signAndSubmitTransaction } = useWallet();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (order: Order) => {
    if (!isConnected || !publicKey) {
      toast.error('Please connect your wallet to approve investments');
      await connect();
      return;
    }

    setProcessingId(order.id);
    try {
      // Step 1: Request approval and get mint details
      const response = await orderService.approve(order.id, 'approve');

      if (response.requiresTokenMint && response.mintDetails) {
        let toastId = toast.loading('Step 1/2: Creating trustline for investor...');
        
        try {
          // Note: Investor should have created trustline during order creation
          // Token issuer must match the one used in trustline creation
          toast.dismiss(toastId);
          toastId = toast.loading('Sending fund tokens to investor...');

          // Verify that current wallet can send tokens (must be the issuer)
          const issuerPublicKey = response.mintDetails.issuerPublicKey;
          
          if (issuerPublicKey !== publicKey) {
            toast.error('You must be connected with the fund issuer wallet to approve this order');
            return;
          }

          // Step 2: Send the custom fund tokens to investor
          const transaction = await buildTokenMintTransaction({
            issuerPublicKey: publicKey, // Current wallet (token issuer)
            destination: response.mintDetails.destination,
            amount: response.mintDetails.amount,
            fundSymbol: response.mintDetails.fundSymbol,
          });

          const tokenMintTxHash = await signAndSubmitTransaction(transaction.toXDR());

          toast.dismiss(toastId);
          toast.success(`Fund tokens sent! Tx: ${tokenMintTxHash.substring(0, 8)}...`);

          // Step 4: Complete approval with token mint tx hash
          await orderService.approve(order.id, 'approve', undefined, tokenMintTxHash);
          
          toast.success(`Investment approved! ${response.mintDetails.amount} ${response.mintDetails.fundSymbol} tokens sent to investor!`);
          onSuccess();
        } catch (mintError: any) {
          toast.dismiss(toastId);
          console.error('Token distribution error:', mintError);
          
          // Check if error is about trustline
          if (mintError.message?.includes('op_no_trust')) {
            toast.error(`Investor needs to create trustline for ${response.mintDetails.fundSymbol} token first`);
          } else {
            toast.error(mintError.message || 'Failed to distribute tokens');
          }
        }
      } else {
        toast.success('Investment approved successfully!');
        onSuccess();
      }
    } catch (error: any) {
      console.error('Approval error:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (order: Order) => {
    if (!isConnected || !publicKey) {
      toast.error('Please connect your wallet to process refunds');
      await connect();
      return;
    }

    setProcessingId(order.id);
    try {
      // Step 1: Request rejection and get refund details
      const response = await orderService.approve(order.id, 'reject');

      if (response.requiresRefund && response.refundDetails) {
        const toastId = toast.loading('Processing refund...');

        try {
          // Step 2: Build and sign refund transaction
          const transaction = await buildPaymentTransaction({
            sourcePublicKey: publicKey,
            destination: response.refundDetails.destination,
            amount: response.refundDetails.amount,
            memo: response.refundDetails.memo,
          });

          const refundTxHash = await signAndSubmitTransaction(transaction.toXDR());

          toast.dismiss(toastId);
          toast.success(`Refund sent! Tx: ${refundTxHash.substring(0, 8)}...`);

          // Step 3: Complete rejection with refund tx hash
          await orderService.approve(order.id, 'reject', refundTxHash);
          
          toast.success('Investment rejected and refunded successfully!');
          onSuccess();
        } catch (refundError: any) {
          toast.dismiss(toastId);
          console.error('Refund error:', refundError);
          toast.error(refundError.message || 'Failed to process refund');
        }
      } else {
        toast.success('Investment rejected successfully!');
        onSuccess();
      }
    } catch (error: any) {
      console.error('Rejection error:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  };

  return {
    processingId,
    handleApprove,
    handleReject,
  };
};
