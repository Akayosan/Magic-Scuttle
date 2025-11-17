import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import type { NFTItem, NFTListing } from "@shared/schema";
import { ipfsToHttp } from "@/lib/ipfs";

const RARITY_MAP: Record<number, string> = {
  0: "Common",
  1: "Uncommon",
  2: "Rare",
  3: "Epic",
  4: "Legendary",
};

interface NFTCardProps {
  nft: NFTItem;
  listing?: Pick<NFTListing, "price">;
  onClick?: () => void;
}

export function NFTCard({ nft, listing, onClick }: NFTCardProps) {
  const rarityName = nft.revealedRarity !== null && nft.revealedRarity !== undefined
    ? RARITY_MAP[nft.revealedRarity] || "Common"
    : null;

  return (
    <Card
      className="group overflow-hidden rounded-xl border-card-border hover-elevate active-elevate-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20"
      onClick={onClick}
      data-testid={`card-nft-${nft.id}`}
    >
      <div className="aspect-square relative overflow-hidden bg-muted">
        {nft.imageUrl ? (
          <img
            src={ipfsToHttp(nft.imageUrl)}
            alt={nft.name || `Token #${nft.tokenId}`}
            className="w-full h-full object-cover"
            data-testid={`img-nft-${nft.id}`}
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
              img.parentElement?.classList.add('flex', 'items-center', 'justify-center');
              if (img.parentElement) {
                img.parentElement.innerHTML = '<span class="text-4xl text-muted-foreground">NFT</span>';
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
            <span className="text-4xl text-muted-foreground">NFT</span>
          </div>
        )}
        
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
        
        {nft.hasEncryptedRarity && (
          <div className="absolute top-3 right-3">
            <Badge
              className="bg-primary/90 backdrop-blur-sm text-primary-foreground border-primary/50"
              data-testid={`badge-encrypted-${nft.id}`}
            >
              <Lock className="w-3 h-3 mr-1" />
              Private
            </Badge>
          </div>
        )}
        
        {rarityName && (
          <div className="absolute top-3 left-3">
            <Badge
              className={`backdrop-blur-sm ${getRarityStyles(rarityName)}`}
              data-testid={`badge-rarity-${nft.id}`}
            >
              {rarityName}
            </Badge>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3
          className="font-semibold text-lg mb-1 truncate group-hover:text-primary transition-colors"
          data-testid={`text-nft-name-${nft.id}`}
        >
          {nft.name || `#${nft.tokenId}`}
        </h3>
        
        {nft.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {nft.description}
          </p>
        )}
        
        {listing?.price ? (
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground">Price</span>
            <span
              className="font-mono text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              data-testid={`text-price-${nft.id}`}
            >
              {listing.price} ETH
            </span>
          </div>
        ) : nft.owner ? (
          <div className="text-xs text-muted-foreground">
            Owner: {nft.owner.substring(0, 6)}...{nft.owner.slice(-4)}
          </div>
        ) : null}
      </div>
    </Card>
  );
}

function getRarityStyles(rarity: string): string {
  switch (rarity.toLowerCase()) {
    case "legendary":
      return "bg-yellow-500/90 text-yellow-50 border-yellow-400/50 shadow-lg shadow-yellow-500/50";
    case "epic":
      return "bg-purple-500/90 text-purple-50 border-purple-400/50 shadow-lg shadow-purple-500/50";
    case "rare":
      return "bg-blue-500/90 text-blue-50 border-blue-400/50";
    case "uncommon":
      return "bg-green-500/90 text-green-50 border-green-400/50";
    default:
      return "bg-muted/90 text-muted-foreground border-muted";
  }
}
