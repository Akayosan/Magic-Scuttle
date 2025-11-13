import { Coins, TrendingUp, Users, Wallet, Image, ShoppingBag, Sparkles } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useWallet } from "@/contexts/WalletContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function Dashboard() {
  const { walletState } = useWallet();

  if (!walletState.isConnected) {
    return (
      <div className="flex-1 flex items-center justify-center p-6" data-testid="view-connect-wallet">
        <Card className="max-w-md p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Wallet className="h-8 w-8 text-primary" data-testid="icon-wallet" />
            </div>
          </div>
          <h2 className="font-display text-2xl font-semibold" data-testid="text-connect-wallet-title">
            Connect Your Wallet
          </h2>
          <p className="text-muted-foreground" data-testid="text-connect-wallet-desc">
            Connect your wallet to start creating privacy-preserving tokens and presales using Zama fhEVM protocol.
          </p>
        </Card>
      </div>
    );
  }

  if (!walletState.isCorrectNetwork) {
    return (
      <div className="flex-1 flex items-center justify-center p-6" data-testid="view-wrong-network">
        <Card className="max-w-md p-8 text-center space-y-4">
          <h2 className="font-display text-2xl font-semibold text-destructive" data-testid="text-wrong-network-title">
            Wrong Network
          </h2>
          <p className="text-muted-foreground" data-testid="text-wrong-network-desc">
            Please switch to Sepolia testnet to use this application. Click the network badge in the header to switch.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6 space-y-8" data-testid="view-dashboard">
      <div>
        <h1 className="font-display text-3xl font-semibold mb-2" data-testid="text-dashboard-title">
          Dashboard
        </h1>
        <p className="text-muted-foreground" data-testid="text-dashboard-subtitle">
          Privacy-preserving token creation and presale platform powered by Zama fhEVM
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tokens"
          value="0"
          icon={Coins}
          description="Tokens you've created"
        />
        <StatCard
          title="Active Presales"
          value="0"
          icon={TrendingUp}
          description="Live fundraising campaigns"
        />
        <StatCard
          title="Total Raised"
          value="0 ETH"
          icon={Wallet}
          description="Across all presales"
        />
        <StatCard
          title="Contributors"
          value="0"
          icon={Users}
          description="Unique participants"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2" data-testid="section-quick-actions">
        <Card className="p-6 space-y-4" data-testid="card-create-token-cta">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <Coins className="h-6 w-6 text-primary" data-testid="icon-create-token" />
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold" data-testid="text-create-token-title">
                Create Token
              </h3>
              <p className="text-sm text-muted-foreground" data-testid="text-create-token-subtitle">
                Deploy a new token with encrypted parameters
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground" data-testid="text-create-token-desc">
            Use Zama fhEVM to create tokens with encrypted supply and balances. Perfect for privacy-preserving fundraising.
          </p>
          <Link href="/create-token">
            <Button className="w-full" data-testid="button-go-create-token">
              Create Your First Token
            </Button>
          </Link>
        </Card>

        <Card className="p-6 space-y-4" data-testid="card-create-presale-cta">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <TrendingUp className="h-6 w-6 text-primary" data-testid="icon-launch-presale" />
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold" data-testid="text-launch-presale-title">
                Launch Presale
              </h3>
              <p className="text-sm text-muted-foreground" data-testid="text-launch-presale-subtitle">
                Create a presale with encrypted contributions
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground" data-testid="text-launch-presale-desc">
            Launch a presale campaign with full privacy. Contributions can be encrypted for maximum confidentiality.
          </p>
          <Link href="/create-presale">
            <Button className="w-full" variant="outline" data-testid="button-go-create-presale">
              Launch a Presale
            </Button>
          </Link>
        </Card>
      </div>

      <div className="space-y-4" data-testid="section-nft-hero">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold" data-testid="text-nft-section-title">
              NFT Marketplace
            </h2>
            <p className="text-sm text-muted-foreground" data-testid="text-nft-section-subtitle">
              Discover, mint, and trade privacy-preserving NFTs with encrypted attributes
            </p>
          </div>
          <Link href="/nft/marketplace">
            <Button variant="outline" data-testid="button-explore-marketplace">
              Explore All
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3" data-testid="grid-nft-features">
          <Card className="hover-elevate transition-all cursor-pointer" data-testid="card-feature-collections">
            <Link href="/nft/collections" data-testid="link-nft-collections-hero">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-3">
                    <Image className="h-6 w-6 text-white" data-testid="icon-collections" />
                  </div>
                  <Badge variant="secondary" data-testid="badge-new">New</Badge>
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold mb-2" data-testid="text-collections-title">
                    NFT Collections
                  </h3>
                  <p className="text-sm text-muted-foreground" data-testid="text-collections-desc">
                    Browse curated collections with encrypted rarity traits and on-chain privacy
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span data-testid="text-collection-count">0 Collections</span>
                  <span>•</span>
                  <span data-testid="text-total-items">0 Items</span>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover-elevate transition-all cursor-pointer" data-testid="card-feature-marketplace">
            <Link href="/nft/marketplace" data-testid="link-nft-marketplace-hero">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 p-3">
                    <ShoppingBag className="h-6 w-6 text-white" data-testid="icon-marketplace" />
                  </div>
                  <Badge variant="secondary" data-testid="badge-live">Live</Badge>
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold mb-2" data-testid="text-marketplace-title">
                    Marketplace
                  </h3>
                  <p className="text-sm text-muted-foreground" data-testid="text-marketplace-desc">
                    Trade NFTs with encrypted prices, sealed-bid auctions, and private offers
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span data-testid="text-listing-count">0 Listings</span>
                  <span>•</span>
                  <span data-testid="text-floor-price">Floor: - ETH</span>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover-elevate transition-all cursor-pointer" data-testid="card-feature-mint">
            <Link href="/nft/mint" data-testid="link-nft-mint-hero">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-pink-500 to-orange-500 p-3">
                    <Sparkles className="h-6 w-6 text-white" data-testid="icon-mint" />
                  </div>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 border-0 text-white" data-testid="badge-create">
                    Create
                  </Badge>
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold mb-2" data-testid="text-mint-title">
                    Mint NFTs
                  </h3>
                  <p className="text-sm text-muted-foreground" data-testid="text-mint-desc">
                    Create unique NFTs with encrypted metadata and hidden rarity attributes
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span data-testid="text-mint-price">Mint from 0.001 ETH</span>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
