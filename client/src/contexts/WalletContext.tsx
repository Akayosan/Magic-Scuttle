import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { BrowserProvider, Eip1193Provider } from "ethers";
import { WalletState, FHEVM_CONFIG } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface WalletContextType {
  walletState: WalletState;
  provider: BrowserProvider | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToSepolia: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isCorrectNetwork: false,
  });
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  const checkNetwork = (chainId: number) => {
    return chainId === FHEVM_CONFIG.chainId;
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to use this application",
        variant: "destructive",
      });
      return;
    }

    try {
      const browserProvider = new BrowserProvider(window.ethereum as Eip1193Provider);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      const network = await browserProvider.getNetwork();
      const chainId = Number(network.chainId);

      setProvider(browserProvider);
      setWalletState({
        address: accounts[0],
        chainId,
        isConnected: true,
        isCorrectNetwork: checkNetwork(chainId),
      });

      if (!checkNetwork(chainId)) {
        toast({
          title: "Wrong Network",
          description: "Please switch to Sepolia testnet",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  const disconnectWallet = () => {
    setWalletState({
      address: null,
      chainId: null,
      isConnected: false,
      isCorrectNetwork: false,
    });
    setProvider(null);
  };

  const switchToSepolia = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${FHEVM_CONFIG.chainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${FHEVM_CONFIG.chainId.toString(16)}`,
                chainName: "Sepolia Testnet",
                nativeCurrency: {
                  name: "Sepolia ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["https://eth-sepolia.public.blastapi.io"],
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
        } catch (addError: any) {
          toast({
            title: "Failed to Add Network",
            description: addError.message || "Could not add Sepolia network",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Failed to Switch Network",
          description: error.message || "Could not switch to Sepolia",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setWalletState((prev) => ({ ...prev, address: accounts[0] }));
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const chainId = parseInt(chainIdHex, 16);
      setWalletState((prev) => ({
        ...prev,
        chainId,
        isCorrectNetwork: checkNetwork(chainId),
      }));
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  return (
    <WalletContext.Provider
      value={{
        walletState,
        provider,
        connectWallet,
        disconnectWallet,
        switchToSepolia,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
