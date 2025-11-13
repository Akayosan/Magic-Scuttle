import { useState } from "react";
import { BrowserProvider, parseEther } from "ethers";
import { getMarketplaceContract, CONTRACT_ADDRESSES, parseContractError } from "@/lib/contracts";

export interface ListingInfo {
  listingId: number;
  nftContract: string;
  tokenId: number;
  seller: string;
  price: string;
  isActive: boolean;
  createdAt: number;
}

export function useMarketplaceContract() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createListing = async (
    provider: BrowserProvider,
    nftContract: string,
    tokenId: number,
    price: string,
    marketplaceAddress?: string
  ): Promise<number | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const signer = await provider.getSigner();
      const marketplace = marketplaceAddress || CONTRACT_ADDRESSES.MARKETPLACE;
      const contract = getMarketplaceContract(marketplace, signer);

      const priceWei = parseEther(price);
      const tx = await contract.listNFT(nftContract, tokenId, priceWei);
      const receipt = await tx.wait();

      let listingId = null;
      if (receipt.status === 1) {
        const listEvent = receipt.logs.find(
          (log: any) => log.fragment?.name === "NFTListed"
        );
        listingId = listEvent ? Number(listEvent.args[0]) : null;
      }

      setIsLoading(false);
      return listingId;
    } catch (err: any) {
      const errorMsg = parseContractError(err);
      setError(errorMsg);
      setIsLoading(false);
      return null;
    }
  };

  const buyNFT = async (
    provider: BrowserProvider,
    listingId: number,
    price: string,
    marketplaceAddress?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const signer = await provider.getSigner();
      const marketplace = marketplaceAddress || CONTRACT_ADDRESSES.MARKETPLACE;
      const contract = getMarketplaceContract(marketplace, signer);

      const value = parseEther(price);
      const tx = await contract.buyNFT(listingId, { value });
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

  const makeOffer = async (
    provider: BrowserProvider,
    nftContract: string,
    tokenId: number,
    amount: string,
    expiresInHours: number,
    marketplaceAddress?: string
  ): Promise<number | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const signer = await provider.getSigner();
      const marketplace = marketplaceAddress || CONTRACT_ADDRESSES.MARKETPLACE;
      const contract = getMarketplaceContract(marketplace, signer);

      const value = parseEther(amount);
      const expiresAt = Math.floor(Date.now() / 1000) + expiresInHours * 3600;

      const tx = await contract.makeOffer(nftContract, tokenId, expiresAt, {
        value,
      });
      const receipt = await tx.wait();

      let offerId = null;
      if (receipt.status === 1) {
        const offerEvent = receipt.logs.find(
          (log: any) => log.fragment?.name === "OfferMade"
        );
        offerId = offerEvent ? Number(offerEvent.args[0]) : null;
      }

      setIsLoading(false);
      return offerId;
    } catch (err: any) {
      const errorMsg = parseContractError(err);
      setError(errorMsg);
      setIsLoading(false);
      return null;
    }
  };

  const acceptOffer = async (
    provider: BrowserProvider,
    offerId: number,
    marketplaceAddress?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const signer = await provider.getSigner();
      const marketplace = marketplaceAddress || CONTRACT_ADDRESSES.MARKETPLACE;
      const contract = getMarketplaceContract(marketplace, signer);

      const tx = await contract.acceptOffer(offerId);
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

  const createAuction = async (
    provider: BrowserProvider,
    nftContract: string,
    tokenId: number,
    reservePrice: string,
    durationHours: number,
    marketplaceAddress?: string
  ): Promise<number | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const signer = await provider.getSigner();
      const marketplace = marketplaceAddress || CONTRACT_ADDRESSES.MARKETPLACE;
      const contract = getMarketplaceContract(marketplace, signer);

      const reservePriceWei = parseEther(reservePrice);
      const duration = durationHours * 3600;

      // Validate duration (contract requires 1 hour to 30 days)
      if (duration < 3600 || duration > 2592000) {
        throw new Error("Auction duration must be between 1 hour and 30 days");
      }

      const tx = await contract.createAuction(
        nftContract,
        tokenId,
        reservePriceWei,
        duration
      );
      const receipt = await tx.wait();

      let auctionId = null;
      if (receipt.status === 1) {
        const auctionEvent = receipt.logs.find(
          (log: any) => log.fragment?.name === "AuctionCreated"
        );
        auctionId = auctionEvent ? Number(auctionEvent.args[0]) : null;
      }

      setIsLoading(false);
      return auctionId;
    } catch (err: any) {
      const errorMsg = parseContractError(err);
      setError(errorMsg);
      setIsLoading(false);
      return null;
    }
  };

  const placeBid = async (
    provider: BrowserProvider,
    auctionId: number,
    amount: string,
    marketplaceAddress?: string
  ): Promise<{ auctionId: number; bidder: string; amount: string } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const signer = await provider.getSigner();
      const marketplace = marketplaceAddress || CONTRACT_ADDRESSES.MARKETPLACE;
      const contract = getMarketplaceContract(marketplace, signer);

      const value = parseEther(amount);
      const tx = await contract.placeBid(auctionId, { value });
      const receipt = await tx.wait();

      let bidData = null;
      if (receipt.status === 1) {
        const bidEvent = receipt.logs.find(
          (log: any) => log.fragment?.name === "BidPlaced"
        );
        if (bidEvent) {
          bidData = {
            auctionId: Number(bidEvent.args[0]),
            bidder: bidEvent.args[1],
            amount: bidEvent.args[2].toString(),
          };
        }
      }

      setIsLoading(false);
      return bidData;
    } catch (err: any) {
      const errorMsg = parseContractError(err);
      setError(errorMsg);
      setIsLoading(false);
      return null;
    }
  };

  return {
    isLoading,
    error,
    createListing,
    buyNFT,
    makeOffer,
    acceptOffer,
    createAuction,
    placeBid,
  };
}
