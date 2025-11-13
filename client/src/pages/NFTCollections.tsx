import { useQuery } from "@tanstack/react-query";
import { CollectionCard } from "@/components/CollectionCard";
import { Button } from "@/components/ui/button";
import { Plus, Search, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { NFTCollection } from "@shared/schema";
import { Link } from "wouter";

export default function NFTCollections() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: collections, isLoading } = useQuery<NFTCollection[]>({
    queryKey: ["/api/nft/collections"],
  });

  const filteredCollections = collections?.filter((collection) =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full overflow-auto">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/20 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" data-testid="heading-collections">
              NFT Collections
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover unique privacy-first NFT collections powered by fhEVM encryption
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg bg-card/50 backdrop-blur-sm border-border"
                data-testid="input-search"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total Collections</div>
              <div className="text-2xl font-bold font-mono" data-testid="text-total-collections">
                {collections?.length || 0}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total Volume</div>
              <div className="text-2xl font-bold font-mono bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {(collections?.reduce((sum, c) => sum + Number(c.volumeTraded || 0), 0) || 0).toFixed(2)} ETH
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total Items</div>
              <div className="text-2xl font-bold font-mono" data-testid="text-total-items">
                {collections?.reduce((sum, c) => sum + Number(c.totalSupply || 0), 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            All Collections
          </h2>
          <Link href="/nft/create-collection">
            <Button className="gap-2" data-testid="button-create-collection">
              <Plus className="w-4 h-4" />
              Create Collection
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-80 bg-muted/50 animate-pulse rounded-xl"
                data-testid="skeleton-collection"
              />
            ))}
          </div>
        ) : filteredCollections && filteredCollections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCollections.map((collection) => (
              <Link key={collection.id} href={`/nft/collections/${collection.id}`}>
                <CollectionCard collection={collection} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
              <Search className="w-12 h-12 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No collections found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? "Try a different search term" : "Be the first to create a collection"}
            </p>
            <Link href="/nft/create-collection">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Collection
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
