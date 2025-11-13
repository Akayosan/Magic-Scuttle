import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { NFTCard } from "@/components/NFTCard";
import type { NFTCollection, NFTItem } from "@shared/schema";
import { Image, TrendingUp, Users, Lock, ExternalLink } from "lucide-react";

export default function CollectionDetail() {
  const [, params] = useRoute("/nft/collections/:id");
  const collectionId = params?.id;

  if (!collectionId) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Collection not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: collection, isLoading: collectionLoading } = useQuery<NFTCollection>({
    queryKey: [`/api/nft/collections/${collectionId}`],
    enabled: !!collectionId,
  });

  const { data: items, isLoading: itemsLoading } = useQuery<NFTItem[]>({
    queryKey: [`/api/nft/items/collection/${collectionId}`],
    enabled: !!collectionId,
  });

  if (collectionLoading || itemsLoading) {
    return (
      <div className="h-full overflow-y-auto p-8 space-y-8">
        <Skeleton className="h-64 w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <p className="text-muted-foreground">Collection not found</p>
            <Button variant="outline" onClick={() => window.history.back()} data-testid="button-go-back">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div
        className="relative h-64 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20"
        style={{
          backgroundImage: collection.bannerUrl ? `url(${collection.bannerUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <div className="px-8 -mt-16 relative">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
          <div className="relative">
            {collection.imageUrl ? (
              <img
                src={collection.imageUrl}
                alt={collection.name}
                className="w-32 h-32 rounded-lg border-4 border-background object-cover shadow-xl"
              />
            ) : (
              <div className="w-32 h-32 rounded-lg border-4 border-background bg-card flex items-center justify-center shadow-xl">
                <Image className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-4xl font-bold font-display mb-2" data-testid="text-collection-name">
                {collection.name}
              </h1>
              {collection.description && (
                <p className="text-muted-foreground max-w-2xl" data-testid="text-collection-description">
                  {collection.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-4">
              <Card>
                <CardHeader className="p-4 space-y-1">
                  <div className="text-sm text-muted-foreground">Floor Price</div>
                  <div className="text-xl font-bold font-mono bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {collection.floorPrice || "0"} ETH
                  </div>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="p-4 space-y-1">
                  <div className="text-sm text-muted-foreground">Total Volume</div>
                  <div className="text-xl font-bold font-mono">
                    {collection.volume || "0"} ETH
                  </div>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="p-4 space-y-1">
                  <div className="text-sm text-muted-foreground">Items</div>
                  <div className="text-xl font-bold font-mono" data-testid="text-total-supply">
                    {collection.totalSupply || 0}
                  </div>
                </CardHeader>
              </Card>

              {collection.royaltyBasisPoints && collection.royaltyBasisPoints > 0 && (
                <Card>
                  <CardHeader className="p-4 space-y-1">
                    <div className="text-sm text-muted-foreground">Royalty</div>
                    <div className="text-xl font-bold font-mono">
                      {(collection.royaltyBasisPoints / 100).toFixed(2)}%
                    </div>
                  </CardHeader>
                </Card>
              )}
            </div>

            <div className="flex gap-2">
              {collection.contractAddress && (
                <Button variant="outline" size="sm" asChild data-testid="button-view-contract">
                  <a
                    href={`https://sepolia.etherscan.io/address/${collection.contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Etherscan
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Items ({items?.length || 0})</h2>
          </div>

          {!items || items.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center space-y-4">
                <Image className="w-16 h-16 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-semibold">No items yet</p>
                  <p className="text-sm text-muted-foreground">
                    Items from this collection will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
              {items.map((item) => (
                <NFTCard
                  key={item.id}
                  nft={item}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
