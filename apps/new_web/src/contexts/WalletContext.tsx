import React, { createContext, useContext, useState, useEffect } from 'react';
import { StellarWalletsKit, WalletNetwork, allowAllModules } from '@creit.tech/stellar-wallets-kit';
import type { ISupportedWallet } from '@creit.tech/stellar-wallets-kit';

interface WalletContextType {
  kit: StellarWalletsKit | null;
  publicKey: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
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

  return (
    <WalletContext.Provider value={{ kit, publicKey, isConnected, connect, disconnect }}>
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
