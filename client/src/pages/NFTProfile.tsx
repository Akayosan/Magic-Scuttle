import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/hooks/useWallet";
import { NFTCard } from "@/components/NFTCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { NFTItem, NFTActivity } from "@shared/schema";

export default function NFTProfile() {
  const { address, isConnected } = useWallet();
  const { toast } = useToast();

  const { data: ownedNFTs, isLoading: loadingOwned } = useQuery<NFTItem[]>({
    queryKey: [`/api/nft/items/owner/${address}`],
    enabled: !!address,
  });

  const { data: activities, isLoading: loadingActivity } = useQuery<NFTActivity[]>({
    queryKey: [`/api/nft/activity/address/${address}`],
    enabled: !!address,
  });

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  if (!isConnected || !address) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-24 h-24 mx-auto mb-6 text-muted-foreground/50" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to view your NFT collection
          </p>
        </div>
      </div>
    );
  }

  const stats = {
    collected: ownedNFTs?.length || 0,
    activity: activities?.length || 0,
  };

  return (
    <div className="h-full overflow-auto">
      {/* Profile Header */}
      <div className="relative bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/20 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-start gap-6">
            <Avatar className="w-32 h-32 border-4 border-card shadow-lg">
              <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-secondary text-white">
                {address.slice(2, 4).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2" data-testid="heading-profile">My Profile</h1>
              <div className="flex items-center gap-2 mb-4">
                <code
                  className="text-sm font-mono bg-card/50 px-3 py-1.5 rounded-lg"
                  data-testid="text-address"
                >
                  {address.slice(0, 6)}...{address.slice(-4)}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyAddress}
                  data-testid="button-copy"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                >
                  <a
                    href={`https://sepolia.etherscan.io/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="link-etherscan"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>

              {/* Stats */}
              <div className="flex gap-8">
                <div>
                  <div className="text-2xl font-bold font-mono" data-testid="text-collected">
                    {stats.collected}
                  </div>
                  <div className="text-sm text-muted-foreground">Collected</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono" data-testid="text-activity-count">
                    {stats.activity}
                  </div>
                  <div className="text-sm text-muted-foreground">Activities</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="collected" className="w-full">
          <TabsList>
            <TabsTrigger value="collected" data-testid="tab-collected">
              Collected ({stats.collected})
            </TabsTrigger>
            <TabsTrigger value="activity" data-testid="tab-activity">
              Activity ({stats.activity})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collected" className="mt-6">
            {loadingOwned ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-96 bg-muted/50 animate-pulse rounded-xl"
                    data-testid="skeleton-nft"
                  />
                ))}
              </div>
            ) : ownedNFTs && ownedNFTs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {ownedNFTs.map((nft) => (
                  <Link key={nft.id} href={`/nft/${nft.contractAddress}/${nft.tokenId}`}>
                    <NFTCard nft={nft} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                  <Wallet className="w-12 h-12 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No NFTs Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start collecting NFTs from the marketplace
                </p>
                <Link href="/nft/marketplace">
                  <Button>Browse Marketplace</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            {loadingActivity ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 bg-muted/50 animate-pulse rounded-lg"
                  />
                ))}
              </div>
            ) : activities && activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 bg-card rounded-lg border border-card-border hover-elevate"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20" />
                      <div>
                        <div className="font-medium capitalize">{activity.activityType}</div>
                        <div className="text-sm text-muted-foreground">
                          Token #{activity.tokenId}
                        </div>
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
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold mb-2">No Activity</h3>
                <p className="text-muted-foreground">
                  Your NFT activity will appear here
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
