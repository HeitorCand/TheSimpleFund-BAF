import React, { createContext, useContext, useState, useEffect } from 'react';
import { StellarWalletsKit, WalletNetwork, allowAllModules } from '@creit.tech/stellar-wallets-kit';
import type { ISupportedWallet } from '@creit.tech/stellar-wallets-kit';
import * as StellarSdk from 'stellar-sdk';

interface WalletContextType {
  kit: StellarWalletsKit | null;
  publicKey: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  signAndSubmitTransaction: (xdr: string) => Promise<string>;
  getBalance: () => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [kit, setKit] = useState<StellarWalletsKit | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initKit = new StellarWalletsKit({
      network: WalletNetwork.TESTNET,
      selectedWalletId: 'freighter',
      modules: allowAllModules(),
    });
    setKit(initKit);

    // Check if already connected
    const savedPublicKey = localStorage.getItem('stellarPublicKey');
    if (savedPublicKey) {
      setPublicKey(savedPublicKey);
      setIsConnected(true);
    }
  }, []);

  const connect = async () => {
    if (!kit) return;

    try {
      await kit.openModal({
        onWalletSelected: async (option: ISupportedWallet) => {
          kit.setWallet(option.id);
          const { address } = await kit.getAddress();
          setPublicKey(address);
          setIsConnected(true);
          localStorage.setItem('stellarPublicKey', address);
        },
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnect = () => {
    setPublicKey(null);
    setIsConnected(false);
    localStorage.removeItem('stellarPublicKey');
  };

  const signAndSubmitTransaction = async (xdr: string): Promise<string> => {
    if (!kit || !publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      const { signedTxXdr } = await kit.signTransaction(xdr, {
        address: publicKey,
        networkPassphrase: WalletNetwork.TESTNET,
      });

      // Submit to Stellar network
      const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
      const transaction = StellarSdk.TransactionBuilder.fromXDR(signedTxXdr, WalletNetwork.TESTNET);
      const result = await server.submitTransaction(transaction as StellarSdk.Transaction);

      return result.hash;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  };

  const getBalance = async (): Promise<string> => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
      const account = await server.loadAccount(publicKey);
      const xlmBalance = account.balances.find((b: any) => b.asset_type === 'native');
      return xlmBalance ? xlmBalance.balance : '0';
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw error;
    }
  };

  return (
    <WalletContext.Provider value={{ kit, publicKey, isConnected, connect, disconnect, signAndSubmitTransaction, getBalance }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
