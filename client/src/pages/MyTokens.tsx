import { useState } from "react";
import { TokenCard } from "@/components/TokenCard";
import { TokenDetailModal } from "@/components/TokenDetailModal";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Coins, Plus } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { Link } from "wouter";
import { Token } from "@shared/schema";

export default function MyTokens() {
  const { walletState } = useWallet();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Mock data - will be replaced with real data from contracts
  const tokens: Token[] = [];

  const filteredTokens = tokens.filter((token) => {
    return token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           token.symbol.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold mb-2" data-testid="text-my-tokens-title">
              My Tokens
            </h1>
            <p className="text-muted-foreground" data-testid="text-my-tokens-subtitle">
              Tokens you've created and deployed
            </p>
          </div>
          <Link href="/create-token">
            <Button className="gap-2" data-testid="button-create-new-token">
              <Plus className="h-4 w-4" />
              Create Token
            </Button>
          </Link>
        </div>

        <Card className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-tokens"
            />
          </div>
        </Card>

        {!walletState.isConnected ? (
          <Card className="p-12 text-center" data-testid="view-connect-wallet-tokens">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Coins className="h-8 w-8 text-primary" data-testid="icon-connect-wallet" />
              </div>
            </div>
            <h3 className="font-display text-xl font-semibold mb-2" data-testid="text-connect-wallet-title">
              Connect Your Wallet
            </h3>
            <p className="text-muted-foreground" data-testid="text-connect-wallet-desc">
              Connect your wallet to view your tokens
            </p>
          </Card>
        ) : filteredTokens.length === 0 ? (
          <Card className="p-12 text-center" data-testid="view-no-tokens">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-muted p-4">
                <Coins className="h-8 w-8 text-muted-foreground" data-testid="icon-no-tokens" />
              </div>
            </div>
            <h3 className="font-display text-xl font-semibold mb-2" data-testid="text-no-tokens-title">
              No Tokens Yet
            </h3>
            <p className="text-muted-foreground mb-4" data-testid="text-no-tokens-desc">
              {searchQuery ? "No tokens match your search" : "Create your first privacy-preserving token"}
            </p>
            {!searchQuery && (
              <Link href="/create-token">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Token
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTokens.map((token) => (
              <TokenCard
                key={token.id}
                token={token}
                onViewDetails={() => {
                  setSelectedToken(token);
                  setDetailModalOpen(true);
                }}
              />
            ))}
          </div>
        )}

        {selectedToken && (
          <TokenDetailModal
            open={detailModalOpen}
            onOpenChange={setDetailModalOpen}
            token={selectedToken}
          />
        )}
      </div>
    </div>
  );
}
