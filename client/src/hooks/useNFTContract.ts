import { useState } from "react";
import { BrowserProvider, parseEther, formatUnits } from "ethers";
import { getNFTContract, CONTRACT_ADDRESSES, parseContractError } from "@/lib/contracts";
import { createEncryptedInput } from "@/lib/fhevm";
import type { FhevmInstance } from "fhevmjs";

export interface NFTContractInfo {
  address: string;
  name: string;
  symbol: string;
  totalSupply: number;
  maxSupply: number;
  mintPrice: string;
  publicMintEnabled: boolean;
}

export function useNFTContract() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getNFTInfo = async (
    nftAddress: string,
    provider: BrowserProvider
  ): Promise<NFTContractInfo | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const contract = getNFTContract(nftAddress, provider);

      const [name, symbol, totalSupply, maxSupply, mintPrice, publicMintEnabled] =
        await Promise.all([
          contract.name(),
          contract.symbol(),
          contract.totalSupply(),
          contract.maxSupply(),
          contract.mintPrice(),
          contract.publicMintEnabled(),
        ]);

      setIsLoading(false);
      return {
        address: nftAddress,
        name,
        symbol,
        totalSupply: Number(totalSupply),
        maxSupply: Number(maxSupply),
        mintPrice: mintPrice.toString(),
        publicMintEnabled,
      };
    } catch (err: any) {
      const errorMsg = parseContractError(err);
      setError(errorMsg);
      setIsLoading(false);
      return null;
    }
  };

  const mintNFT = async (
    nftAddress: string,
    provider: BrowserProvider,
    tokenURI: string,
    paymentAmount: string
  ): Promise<number | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const signer = await provider.getSigner();
      const contract = getNFTContract(nftAddress, signer);

      const value = parseEther(paymentAmount);
      const tx = await contract.mint(tokenURI, { value });
      const receipt = await tx.wait();

      const mintEvent = receipt.logs.find(
        (log: any) => log.fragment?.name === "NFTMinted"
      );
      const tokenId = mintEvent ? Number(mintEvent.args[1]) : null;

      setIsLoading(false);
      return tokenId;
    } catch (err: any) {
      const errorMsg = parseContractError(err);
      setError(errorMsg);
      setIsLoading(false);
      return null;
    }
  };

  const mintNFTWithEncryption = async (
    nftAddress: string,
    provider: BrowserProvider,
    fhevmInstance: FhevmInstance,
    tokenURI: string,
    rarity: number,
    paymentAmount: string
  ): Promise<number | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      const contract = getNFTContract(nftAddress, signer);

      const encryptedInput = await createEncryptedInput(
        fhevmInstance,
        nftAddress,
        signerAddress
      );
      encryptedInput.add128(BigInt(rarity));
      const { handles, inputProof } = encryptedInput.encrypt();

      const value = parseEther(paymentAmount);
      const tx = await contract.mintWithEncryptedRarity(
        tokenURI,
        handles[0],
        inputProof,
        { value }
      );
      const receipt = await tx.wait();

      const mintEvent = receipt.logs.find(
        (log: any) => log.fragment?.name === "NFTMinted"
      );
      const tokenId = mintEvent ? Number(mintEvent.args[1]) : null;

      setIsLoading(false);
      return tokenId;
    } catch (err: any) {
      const errorMsg = parseContractError(err);
      setError(errorMsg);
      setIsLoading(false);
      return null;
    }
  };

  const requestRarityReveal = async (
    nftAddress: string,
    provider: BrowserProvider,
    tokenId: number
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const signer = await provider.getSigner();
      const contract = getNFTContract(nftAddress, signer);

      const tx = await contract.requestRarityReveal(tokenId);
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

  const approveMarketplace = async (
    nftAddress: string,
    provider: BrowserProvider,
    marketplaceAddress?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const signer = await provider.getSigner();
      const contract = getNFTContract(nftAddress, signer);
      const marketplace = marketplaceAddress || CONTRACT_ADDRESSES.MARKETPLACE;

      const tx = await contract.setApprovalForAll(marketplace, true);
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
    getNFTInfo,
    mintNFT,
    mintNFTWithEncryption,
    requestRarityReveal,
    approveMarketplace,
  };
}
