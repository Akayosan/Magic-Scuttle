import { Card } from "@/components/ui/card";
import { Image as ImageIcon } from "lucide-react";
import type { NFTCollection } from "@shared/schema";
import { ipfsToHttp } from "@/lib/ipfs";

interface CollectionCardProps {
  collection: NFTCollection;
  onClick?: () => void;
}

export function CollectionCard({ collection, onClick }: CollectionCardProps) {
  return (
    <Card
      className="group overflow-hidden rounded-xl border-card-border hover-elevate active-elevate-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20"
      onClick={onClick}
      data-testid={`card-collection-${collection.id}`}
    >
      {/* Collection Banner */}
      <div className="h-32 relative overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/20">
        {collection.bannerUrl ? (
          <img
            src={ipfsToHttp(collection.bannerUrl)}
            alt={`${collection.name} banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
      </div>
      
      {/* Collection Avatar (overlapping banner) */}
      <div className="relative px-4 -mt-10 mb-3">
        <div className="w-20 h-20 rounded-xl border-4 border-card bg-card overflow-hidden shadow-lg">
          {collection.imageUrl ? (
            <img
              src={ipfsToHttp(collection.imageUrl)}
              alt={collection.name}
              className="w-full h-full object-cover"
              data-testid={`img-collection-${collection.id}`}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {collection.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="px-4 pb-4">
        <div className="flex items-start justify-between mb-2">
          <h3
            className="font-semibold text-xl group-hover:text-primary transition-colors"
            data-testid={`text-collection-name-${collection.id}`}
          >
            {collection.name}
          </h3>
        </div>
        
        {collection.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {collection.description}
          </p>
        )}
        
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Floor</div>
            <div
              className="font-mono text-sm font-semibold"
              data-testid={`text-floor-${collection.id}`}
            >
              {collection.floorPrice || "—"} ETH
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Volume</div>
            <div
              className="font-mono text-sm font-semibold"
              data-testid={`text-volume-${collection.id}`}
            >
              {collection.volume ? `${collection.volume} ETH` : "—"}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Items</div>
            <div
              className="font-mono text-sm font-semibold"
              data-testid={`text-items-${collection.id}`}
            >
              {collection.totalSupply || 0}
            </div>
          </div>
        </div>
        
        {/* Royalty Info */}
        {collection.royaltyBasisPoints && collection.royaltyBasisPoints > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Creator Royalty</span>
              <span className="font-medium">{(collection.royaltyBasisPoints / 100).toFixed(2)}%</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
