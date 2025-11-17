import { useState } from "react";
import { BrowserProvider, parseUnits, formatUnits } from "ethers";
import { getTokenContract, parseContractError } from "@/lib/contracts";
import { createEncryptedInput } from "@/lib/fhevm";
import type { FhevmInstance } from "fhevmjs";

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  isSupplyEncrypted: boolean;
  owner: string;
}

export function useTokenContract() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get token information
   */
  const getTokenInfo = async (
    tokenAddress: string,
    provider: BrowserProvider
  ): Promise<TokenInfo | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const contract = getTokenContract(tokenAddress, provider);

      const [name, symbol, decimals, totalSupply, isSupplyEncrypted, owner] = 
        await Promise.all([
          contract.name(),
          contract.symbol(),
          contract.decimals(),
          contract.totalSupply(),
          contract.isSupplyEncrypted(),
          contract.owner(),
        ]);

      setIsLoading(false);
      return {
        address: tokenAddress,
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: totalSupply.toString(),
        isSupplyEncrypted,
        owner,
      };
    } catch (err: any) {
      const errorMsg = parseContractError(err);
      setError(errorMsg);
      setIsLoading(false);
      return null;
    }
  };

  /**
   * Transfer tokens (encrypted)
   */
  const transfer = async (
    tokenAddress: string,
    provider: BrowserProvider,
    fhevmInstance: FhevmInstance,
    recipientAddress: string,
    amount: string,
    decimals: number
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      const contract = getTokenContract(tokenAddress, signer);

      // Parse amount to wei
      const amountWei = parseUnits(amount, decimals);

      // Create encrypted input
      const encryptedInput = await createEncryptedInput(
        fhevmInstance,
        tokenAddress,
        signerAddress
      );
      encryptedInput.add128(amountWei);
      const { handles, inputProof } = encryptedInput.encrypt();

      // Send transaction
      const tx = await contract.transfer(
        recipientAddress,
        handles[0],
        inputProof
      );

      await tx.wait();
      setIsLoading(false);
      return true;
    } catch (err: any) {
      const errorMsg = parseContractError(err);
      setError(errorMsg);
      setIsLoading(false);
      return false;
    }
  };

  /**
   * Approve spender (encrypted)
   */
  const approve = async (
    tokenAddress: string,
    provider: BrowserProvider,
    fhevmInstance: FhevmInstance,
    spenderAddress: string,
    amount: string,
    decimals: number
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      const contract = getTokenContract(tokenAddress, signer);

      // Parse amount to wei
      const amountWei = parseUnits(amount, decimals);

      // Create encrypted input
      const encryptedInput = await createEncryptedInput(
        fhevmInstance,
        tokenAddress,
        signerAddress
      );
      encryptedInput.add128(amountWei);
      const { handles, inputProof } = encryptedInput.encrypt();

      // Send transaction
      const tx = await contract.approve(spenderAddress, handles[0], inputProof);
      await tx.wait();

      setIsLoading(false);
      return true;
    } catch (err: any) {
      const errorMsg = parseContractError(err);
      setError(errorMsg);
      setIsLoading(false);
      return false;
    }
  };

  /**
   * Request total supply decryption (owner only)
   */
  const requestSupplyDecryption = async (
    tokenAddress: string,
    provider: BrowserProvider
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const signer = await provider.getSigner();
      const contract = getTokenContract(tokenAddress, signer);

      const tx = await contract.requestTotalSupplyDecryption();
      await tx.wait();

      setIsLoading(false);
      return true;
    } catch (err: any) {
      const errorMsg = parseContractError(err);
      setError(errorMsg);
      setIsLoading(false);
      return false;
    }
  };

  return {
    isLoading,
    error,
    getTokenInfo,
    transfer,
    approve,
    requestSupplyDecryption,
  };
}
