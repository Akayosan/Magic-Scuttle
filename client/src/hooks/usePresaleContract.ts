import { useState } from "react";
import { BrowserProvider, parseEther, formatEther } from "ethers";
import { getPresaleContract, parseContractError } from "@/lib/contracts";
import { createEncryptedInput } from "@/lib/fhevm";
import type { FhevmInstance } from "fhevmjs";

export interface PresaleInfo {
  address: string;
  tokenAddress: string;
  owner: string;
  rate: string;
  hardCap: string;
  softCap: string;
  minContribution: string;
  maxContribution: string;
  startTime: number;
  endTime: number;
  isEncrypted: boolean;
  totalRaised: string;
  totalContributors: number;
  isActive: boolean;
  softCapReached: boolean;
  finalized: boolean;
}

export function usePresaleContract() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get presale information
   */
  const getPresaleInfo = async (
    presaleAddress: string,
    provider: BrowserProvider
  ): Promise<PresaleInfo | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const contract = getPresaleContract(presaleAddress, provider);

      const [
        tokenAddress,
        owner,
        rate,
        hardCap,
        softCap,
        minContribution,
        maxContribution,
        startTime,
        endTime,
        isEncrypted,
        presaleInfoData,
      ] = await Promise.all([
        contract.tokenAddress(),
        contract.owner(),
        contract.rate(),
        contract.hardCap(),
        contract.softCap(),
        contract.minContribution(),
        contract.maxContribution(),
        contract.startTime(),
        contract.endTime(),
        contract.isEncrypted(),
        contract.getPresaleInfo(),
      ]);

      setIsLoading(false);
      return {
        address: presaleAddress,
        tokenAddress,
        owner,
        rate: rate.toString(),
        hardCap: hardCap.toString(),
        softCap: softCap.toString(),
        minContribution: minContribution.toString(),
        maxContribution: maxContribution.toString(),
        startTime: Number(startTime),
        endTime: Number(endTime),
        isEncrypted,
        totalRaised: presaleInfoData[0].toString(),
        totalContributors: Number(presaleInfoData[1]),
        isActive: presaleInfoData[2],
        softCapReached: presaleInfoData[3],
        finalized: presaleInfoData[4],
      };
    } catch (err: any) {
      const errorMsg = parseContractError(err);
      setError(errorMsg);
      setIsLoading(false);
      return null;
    }
  };

  /**
   * Contribute to presale (public contribution)
   */
  const contribute = async (
    presaleAddress: string,
    provider: BrowserProvider,
    amountEth: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const signer = await provider.getSigner();
      const contract = getPresaleContract(presaleAddress, signer);

      const value = parseEther(amountEth);
      const tx = await contract.contribute({ value });
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
   * Contribute to presale (encrypted contribution)
   */
  const contributeEncrypted = async (
    presaleAddress: string,
    provider: BrowserProvider,
    fhevmInstance: FhevmInstance,
    amountEth: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      const contract = getPresaleContract(presaleAddress, signer);

      const value = parseEther(amountEth);

      // Create encrypted input
      const encryptedInput = await createEncryptedInput(
        fhevmInstance,
        presaleAddress,
        signerAddress
      );
      encryptedInput.add128(value);
      const { handles, inputProof } = encryptedInput.encrypt();

      // Send transaction
      const tx = await contract.contributeEncrypted(handles[0], inputProof, {
        value,
      });
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
   * Finalize presale (owner only)
   */
  const finalize = async (
    presaleAddress: string,
    provider: BrowserProvider
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const signer = await provider.getSigner();
      const contract = getPresaleContract(presaleAddress, signer);

      const tx = await contract.finalize();
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
   * Claim tokens after successful presale
   */
  const claimTokens = async (
    presaleAddress: string,
    provider: BrowserProvider
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const signer = await provider.getSigner();
      const contract = getPresaleContract(presaleAddress, signer);

      const tx = await contract.claimTokens();
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
   * Claim refund if soft cap not reached
   */
  const claimRefund = async (
    presaleAddress: string,
    provider: BrowserProvider
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const signer = await provider.getSigner();
      const contract = getPresaleContract(presaleAddress, signer);

      const tx = await contract.claimRefund();
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
    getPresaleInfo,
    contribute,
    contributeEncrypted,
    finalize,
    claimTokens,
    claimRefund,
  };
}
