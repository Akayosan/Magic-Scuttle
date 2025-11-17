import { useState, useEffect, useCallback } from "react";
import { BrowserProvider, Network } from "ethers";
import { getFhevmInstance, resetFhevmInstance } from "@/lib/fhevm";
import type { FhevmInstance } from "fhevmjs";

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  provider: BrowserProvider | null;
  fhevmInstance: FhevmInstance | null;
  error: string | null;
}

const SEPOLIA_CHAIN_ID = 11155111;
const SEPOLIA_CHAIN_HEX = "0xaa36a7";

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    chainId: null,
    provider: null,
    fhevmInstance: null,
    error: null,
  });

  // Check if wallet is already connected
  useEffect(() => {
    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setWalletState((prev) => ({
            ...prev,
            address: accounts[0],
            isConnected: true,
          }));
        }
      };

      const handleChainChanged = () => {
        // Reload the page when chain changes
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  const checkConnection = async () => {
    if (!window.ethereum) {
      setWalletState((prev) => ({
        ...prev,
        error: "MetaMask not installed",
      }));
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      
      if (accounts.length > 0) {
        const network = await provider.getNetwork();
        const address = accounts[0].address;
        const chainId = Number(network.chainId);

        // Initialize fhEVM if on Sepolia
        let fhevmInstance: FhevmInstance | null = null;
        if (chainId === SEPOLIA_CHAIN_ID) {
          try {
            fhevmInstance = await getFhevmInstance(provider);
          } catch (error) {
            console.warn("Failed to initialize fhEVM:", error);
          }
        }

        setWalletState({
          address,
          isConnected: true,
          isConnecting: false,
          chainId,
          provider,
          fhevmInstance,
          error: null,
        });
      }
    } catch (error) {
      console.error("Failed to check connection:", error);
    }
  };

  const connect = async () => {
    if (!window.ethereum) {
      setWalletState((prev) => ({
        ...prev,
        error: "MetaMask not installed. Please install MetaMask to continue.",
      }));
      return;
    }

    setWalletState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      // Initialize fhEVM if on Sepolia
      let fhevmInstance: FhevmInstance | null = null;
      if (chainId === SEPOLIA_CHAIN_ID) {
        try {
          fhevmInstance = await getFhevmInstance(provider);
        } catch (error) {
          console.warn("Failed to initialize fhEVM:", error);
        }
      }

      setWalletState({
        address: accounts[0],
        isConnected: true,
        isConnecting: false,
        chainId,
        provider,
        fhevmInstance,
        error: null,
      });
    } catch (error: any) {
      setWalletState((prev) => ({
        ...prev,
        isConnecting: false,
        error: error.message || "Failed to connect wallet",
      }));
    }
  };

  const disconnect = () => {
    resetFhevmInstance();
    setWalletState({
      address: null,
      isConnected: false,
      isConnecting: false,
      chainId: null,
      provider: null,
      fhevmInstance: null,
      error: null,
    });
  };

  const switchToSepolia = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_HEX }],
      });
    } catch (error: any) {
      // If chain doesn't exist, add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: SEPOLIA_CHAIN_HEX,
                chainName: "Sepolia Testnet",
                nativeCurrency: {
                  name: "Sepolia ETH",
                  symbol: "SEP",
                  decimals: 18,
                },
                rpcUrls: ["https://rpc.sepolia.org"],
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add Sepolia network:", addError);
        }
      }
    }
  };

  const isCorrectNetwork = walletState.chainId === SEPOLIA_CHAIN_ID;

  return {
    ...walletState,
    connect,
    disconnect,
    switchToSepolia,
    isCorrectNetwork,
    SEPOLIA_CHAIN_ID,
  };
}

// MetaMask types
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}
