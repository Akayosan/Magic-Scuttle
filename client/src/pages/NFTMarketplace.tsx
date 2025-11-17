import { useQuery } from "@tanstack/react-query";
import { NFTCard } from "@/components/NFTCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Filter, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import type { NFTItem, NFTListing } from "@shared/schema";
import { Link } from "wouter";

export default function NFTMarketplace() {
  const [showFilters, setShowFilters] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [onlyEncrypted, setOnlyEncrypted] = useState(false);

  const { data: listings, isLoading } = useQuery<NFTListing[]>({
    queryKey: ["/api/nft/listings"],
  });

  const { data: nfts } = useQuery<NFTItem[]>({
    queryKey: ["/api/nft/items"],
    enabled: !!listings,
  });

  // Create a map of NFTs by ID for quick lookup
  const nftsMap = new Map(nfts?.map(nft => [nft.id, nft]) || []);

  const RARITY_MAP: Record<number, string> = {
    0: "Common",
    1: "Uncommon",
    2: "Rare",
    3: "Epic",
    4: "Legendary",
  };

  // Filter listings based on criteria
  const filteredListings = listings?.filter((listing) => {
    if (!listing.isActive) return false;
    
    const nft = nftsMap.get(listing.nftId);
    if (!nft) return false;

    const price = parseFloat(listing.price || "0");
    if (price < priceRange[0] || price > priceRange[1]) return false;

    const rarityName = nft.revealedRarity !== null && nft.revealedRarity !== undefined
      ? RARITY_MAP[nft.revealedRarity]
      : null;
    if (selectedRarities.length > 0 && rarityName && !selectedRarities.includes(rarityName)) {
      return false;
    }

    if (onlyEncrypted && !nft.hasEncryptedRarity) return false;

    return true;
  });

  const rarities = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];

  return (
    <div className="h-full flex">
      {/* Filters Sidebar */}
      {showFilters && (
        <div className="w-80 border-r border-border bg-card/30 backdrop-blur-sm p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" />
              Filters
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFilters(false)}
              data-testid="button-close-filters"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Price Range */}
          <div className="mb-8">
            <Label className="text-sm font-medium mb-4 block">Price Range (ETH)</Label>
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              min={0}
              max={100}
              step={1}
              className="mb-4"
              data-testid="slider-price"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="font-mono">{priceRange[0]} ETH</span>
              <span className="font-mono">{priceRange[1]} ETH</span>
            </div>
          </div>

          {/* Rarity Filter */}
          <div className="mb-8">
            <Label className="text-sm font-medium mb-4 block">Rarity</Label>
            <div className="space-y-3">
              {rarities.map((rarity) => (
                <div key={rarity} className="flex items-center gap-2">
                  <Checkbox
                    id={`rarity-${rarity}`}
                    checked={selectedRarities.includes(rarity)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedRarities([...selectedRarities, rarity]);
                      } else {
                        setSelectedRarities(selectedRarities.filter(r => r !== rarity));
                      }
                    }}
                    data-testid={`checkbox-rarity-${rarity.toLowerCase()}`}
                  />
                  <Label htmlFor={`rarity-${rarity}`} className="cursor-pointer">
                    {rarity}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Filter */}
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <Checkbox
                id="encrypted"
                checked={onlyEncrypted}
                onCheckedChange={(checked) => setOnlyEncrypted(checked as boolean)}
                data-testid="checkbox-encrypted"
              />
              <Label htmlFor="encrypted" className="cursor-pointer">
                Only Encrypted NFTs
              </Label>
            </div>
          </div>

          {/* Clear Filters */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setPriceRange([0, 100]);
              setSelectedRarities([]);
              setOnlyEncrypted(false);
            }}
            data-testid="button-clear-filters"
          >
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" data-testid="heading-marketplace">
                NFT Marketplace
              </h1>
              <p className="text-sm text-muted-foreground">
                {filteredListings?.length || 0} NFTs available
              </p>
            </div>
            {!showFilters && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setShowFilters(true)}
                data-testid="button-show-filters"
              >
                <Filter className="w-4 h-4" />
                Show Filters
              </Button>
            )}
          </div>
        </div>

        {/* NFT Grid */}
        <div className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-96 bg-muted/50 animate-pulse rounded-xl"
                  data-testid="skeleton-nft"
                />
              ))}
            </div>
          ) : filteredListings && filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.map((listing) => {
                const nft = nftsMap.get(listing.nftId);
                if (!nft) return null;
                
                return (
                  <Link key={listing.id} href={`/nft/${nft.contractAddress}/${nft.tokenId}`}>
                    <NFTCard nft={nft} listing={{ price: listing.price }} />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                <Filter className="w-12 h-12 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No NFTs found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or check back later
              </p>
              <Button
                onClick={() => {
                  setPriceRange([0, 100]);
                  setSelectedRarities([]);
                  setOnlyEncrypted(false);
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
