import { Coins, TrendingUp, Users, Wallet } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useWallet } from "@/contexts/WalletContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    </div>
  );
}
