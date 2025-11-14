import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Tag, Clock, Lock, ExternalLink, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { NFTItem, NFTListing, NFTBid, NFTActivity } from "@shared/schema";

export default function NFTDetail() {
  const [, params] = useRoute("/nft/:address/:tokenId");
  const address = params?.address;
  const tokenId = params?.tokenId;
  const { address: walletAddress, isConnected } = useWallet();
  const { toast } = useToast();
  const [showListDialog, setShowListDialog] = useState(false);
  const [listPrice, setListPrice] = useState("");

  if (!address || !tokenId) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card>
          <div className="p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold">Invalid NFT</h2>
            <p className="text-muted-foreground">Missing address or token ID</p>
            <Link href="/nft/marketplace">
              <Button data-testid="button-back-to-marketplace">Back to Marketplace</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const { data: nft, isLoading } = useQuery<NFTItem>({
    queryKey: [`/api/nft/items/${address}/${tokenId}`],
    enabled: !!address && !!tokenId,
  });

  const { data: listings } = useQuery<NFTListing[]>({
    queryKey: [`/api/nft/listings/token/${address}/${tokenId}`],
    enabled: !!address && !!tokenId,
  });

  const { data: bids } = useQuery<NFTBid[]>({
    queryKey: [`/api/nft/bids/token/${address}/${tokenId}`],
    enabled: !!address && !!tokenId,
  });

  const { data: activities } = useQuery<NFTActivity[]>({
    queryKey: [`/api/nft/activity/token/${address}/${tokenId}`],
    enabled: !!address && !!tokenId,
  });

  const activeListing = listings?.find(l => l.isActive);
  const activeBids = bids?.filter(b => b.isActive) || [];
  
  const isOwner = isConnected && walletAddress && nft?.owner.toLowerCase() === walletAddress.toLowerCase();

  const createListingMutation = useMutation({
    mutationFn: async (price: string) => {
      if (!isConnected || !walletAddress) {
        throw new Error("Please connect your wallet to list NFT");
      }
      if (!nft) {
        throw new Error("NFT not found");
      }
      if (!address || !tokenId) {
        throw new Error("Invalid NFT address or token ID");
      }
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        throw new Error("Invalid price");
      }
      
      return apiRequest("POST", "/api/nft/listings", {
        nftId: nft.id,
        contractAddress: address,
        tokenId: tokenId,
        seller: walletAddress,
        price: price,
        listingType: "fixed_price",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/nft/listings/token/${address}/${tokenId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/nft/listings"] });
      toast({
        title: "NFT Listed Successfully",
        description: `Your NFT is now listed for ${listPrice} ETH`,
      });
      setShowListDialog(false);
      setListPrice("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to List NFT",
        description: error.message || "There was an error listing your NFT",
        variant: "destructive",
      });
    },
  });

  const cancelListingMutation = useMutation({
    mutationFn: async (listingId: string) => {
      if (!isConnected || !walletAddress) {
        throw new Error("Please connect your wallet to cancel listing");
      }
      if (!isOwner) {
        throw new Error("Only the owner can cancel this listing");
      }
      return apiRequest("DELETE", `/api/nft/listings/${listingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/nft/listings/token/${address}/${tokenId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/nft/listings"] });
      toast({
        title: "Listing Cancelled",
        description: "Your NFT has been removed from the marketplace",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Cancel Listing",
        description: error.message || "There was an error cancelling the listing",
        variant: "destructive",
      });
    },
  });

  const handleListNFT = () => {
    if (!listPrice || parseFloat(listPrice) <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price greater than 0",
        variant: "destructive",
      });
      return;
    }
    createListingMutation.mutate(listPrice);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted animate-pulse" />
          <p className="text-muted-foreground">Loading NFT...</p>
        </div>
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">NFT Not Found</h2>
          <p className="text-muted-foreground mb-6">This NFT doesn't exist or has been removed</p>
          <Link href="/nft/marketplace">
            <Button>Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Link href="/nft/marketplace">
          <Button variant="ghost" className="mb-6 gap-2" data-testid="button-back">
            <ChevronLeft className="w-4 h-4" />
            Back to Marketplace
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <Card className="p-6 rounded-2xl overflow-hidden">
              <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/20 relative group">
                {nft.imageUrl ? (
                  <img
                    src={nft.imageUrl}
                    alt={nft.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    data-testid="img-nft"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl text-muted-foreground">NFT</span>
                  </div>
                )}

                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {nft.revealedRarity !== null && nft.revealedRarity !== undefined && (
                    <Badge
                      className="backdrop-blur-sm"
                      data-testid="badge-rarity"
                    >
                      Rarity Level {nft.revealedRarity}
                    </Badge>
                  )}
                  {nft.hasEncryptedRarity && (
                    <Badge className="bg-primary/90 backdrop-blur-sm">
                      <Lock className="w-3 h-3 mr-1" />
                      Private
                    </Badge>
                  )}
                </div>
              </div>

              {/* Collection Info */}
              <div className="mt-6 flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback>C</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-xs text-muted-foreground">Collection</div>
                  <div className="font-medium">Collection Name</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Title & Price */}
            <div>
              <h1
                className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                data-testid="text-nft-name"
              >
                {nft.name}
              </h1>
              {nft.description && (
                <p className="text-muted-foreground">{nft.description}</p>
              )}
            </div>

            {/* Owner */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Owned by</div>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">{nft.owner.slice(2, 4)}</AvatarFallback>
                    </Avatar>
                    <code
                      className="text-sm font-mono"
                      data-testid="text-owner"
                    >
                      {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
                    </code>
                  </div>
                </div>

                {activeListing && activeListing.price && (
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground mb-1">Current Price</div>
                    <div
                      className="text-3xl font-bold font-mono bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                      data-testid="text-price"
                    >
                      {activeListing.price} ETH
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Action Buttons */}
            {activeListing ? (
              isOwner ? (
                <div className="flex gap-4">
                  <Button 
                    variant="destructive" 
                    className="flex-1 h-12 text-lg gap-2" 
                    onClick={() => cancelListingMutation.mutate(activeListing.id)}
                    disabled={cancelListingMutation.isPending}
                    data-testid="button-cancel-listing"
                  >
                    <Tag className="w-5 h-5" />
                    {cancelListingMutation.isPending ? "Cancelling..." : "Cancel Listing"}
                  </Button>
                </div>
              ) : (
                <div className="flex gap-4">
                  <Button 
                    className="flex-1 h-12 text-lg gap-2" 
                    disabled={!isConnected}
                    data-testid="button-buy"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {isConnected ? "Buy Now" : "Connect Wallet to Buy"}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 h-12 text-lg gap-2" 
                    disabled={!isConnected}
                    data-testid="button-offer"
                  >
                    <Tag className="w-5 h-5" />
                    Make Offer
                  </Button>
                </div>
              )
            ) : isOwner ? (
              <Button 
                className="w-full h-12 text-lg gap-2" 
                onClick={() => setShowListDialog(true)}
                disabled={!isConnected}
                data-testid="button-list-for-sale"
              >
                <Tag className="w-5 h-5" />
                List for Sale
              </Button>
            ) : !isConnected ? (
              <Button 
                className="w-full h-12 text-lg gap-2" 
                disabled
                data-testid="button-connect-wallet"
              >
                Connect Wallet to Trade
              </Button>
            ) : null}

            {/* Tabs */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details" data-testid="tab-details">Details</TabsTrigger>
                <TabsTrigger value="attributes" data-testid="tab-attributes">Attributes</TabsTrigger>
                <TabsTrigger value="activity" data-testid="tab-activity">Activity</TabsTrigger>
                <TabsTrigger value="bids" data-testid="tab-bids">
                  Bids {activeBids.length > 0 && `(${activeBids.length})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-6">
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contract Address</span>
                      <code className="text-sm font-mono flex items-center gap-2">
                        {nft.contractAddress.slice(0, 6)}...{nft.contractAddress.slice(-4)}
                        <ExternalLink className="w-3 h-3" />
                      </code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Token ID</span>
                      <code className="text-sm font-mono">{nft.tokenId}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Token Standard</span>
                      <span>ERC-721</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Blockchain</span>
                      <span>Sepolia Testnet</span>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="attributes" className="mt-6">
                <Card className="p-6">
                  {(() => {
                    try {
                      const attrs = nft.attributes ? JSON.parse(nft.attributes) : null;
                      return attrs && Array.isArray(attrs) && attrs.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                          {attrs.map((attr: any, i: number) => (
                            <div key={i} className="p-4 bg-muted/50 rounded-lg">
                              <div className="text-xs text-muted-foreground mb-1">{attr.trait_type || 'Attribute'}</div>
                              <div className="font-medium">{attr.value || attr}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">No attributes</p>
                      );
                    } catch {
                      return <p className="text-center text-muted-foreground py-8">No attributes</p>;
                    }
                  })()}
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="mt-6">
                <Card className="p-6">
                  {activities && activities.length > 0 ? (
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                          <div>
                            <div className="font-medium capitalize">{activity.activityType}</div>
                            <div className="text-sm text-muted-foreground">
                              {activity.from && `From ${activity.from.slice(0, 6)}...${activity.from.slice(-4)}`}
                              {activity.to && ` to ${activity.to.slice(0, 6)}...${activity.to.slice(-4)}`}
                            </div>
                          </div>
                          <div className="text-right">
                            {activity.price && (
                              <div className="font-mono font-medium">{activity.price} ETH</div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No activity yet</p>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="bids" className="mt-6">
                <Card className="p-6">
                  {activeBids.length > 0 ? (
                    <div className="space-y-4">
                      {activeBids.map((bid) => (
                        <div key={bid.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback>{bid.bidder.slice(2, 4)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <code className="text-sm font-mono">
                                {bid.bidder.slice(0, 6)}...{bid.bidder.slice(-4)}
                              </code>
                              <div className="text-xs text-muted-foreground">
                                {new Date(bid.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold text-lg">{bid.amount} ETH</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No active bids</p>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* List for Sale Dialog */}
      <Dialog open={showListDialog} onOpenChange={setShowListDialog}>
        <DialogContent data-testid="dialog-list-nft">
          <DialogHeader>
            <DialogTitle>List NFT for Sale</DialogTitle>
            <DialogDescription>
              Set a price for your NFT. Buyers will be able to purchase it instantly at this price.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (ETH)</Label>
              <Input
                id="price"
                type="number"
                step="0.001"
                min="0"
                placeholder="0.05"
                value={listPrice}
                onChange={(e) => setListPrice(e.target.value)}
                data-testid="input-list-price"
              />
              <p className="text-xs text-muted-foreground">
                Enter the price in ETH that you want to sell this NFT for
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowListDialog(false)}
              disabled={createListingMutation.isPending}
              data-testid="button-cancel-dialog"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleListNFT}
              disabled={createListingMutation.isPending || !listPrice || !isConnected}
              data-testid="button-submit-listing"
            >
              {createListingMutation.isPending ? "Listing..." : "List NFT"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
