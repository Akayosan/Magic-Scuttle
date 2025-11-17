import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Lock, Eye, ExternalLink } from "lucide-react";
import { Token } from "@shared/schema";

interface TokenCardProps {
  token: Token;
  onViewDetails?: () => void;
}

export function TokenCard({ token, onViewDetails }: TokenCardProps) {
  const formatSupply = (supply: string) => {
    const num = BigInt(supply);
    return (Number(num) / 1e18).toLocaleString();
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className="hover-elevate transition-shadow" data-testid={`card-token-${token.id}`}>
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Coins className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold" data-testid="text-token-name">
                {token.name}
              </h3>
              <p className="font-mono text-sm text-muted-foreground" data-testid="text-token-symbol">
                {token.symbol}
              </p>
            </div>
          </div>
          {token.isSupplyEncrypted && (
            <Badge variant="secondary" className="gap-1.5">
              <Lock className="h-3 w-3" />
              Encrypted
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Supply</span>
            <span className="font-mono font-medium" data-testid="text-token-supply">
              {token.isSupplyEncrypted ? "••••••••" : formatSupply(token.totalSupply)} {token.symbol}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Contract</span>
            <a
              href={`https://sepolia.etherscan.io/address/${token.contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-primary hover:underline flex items-center gap-1"
              data-testid="link-token-contract"
            >
              {truncateAddress(token.contractAddress)}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Decimals</span>
            <span className="font-mono font-medium">{token.decimals}</span>
          </div>
        </div>
      </CardContent>

      {onViewDetails && (
        <CardFooter className="pt-4 border-t">
          <Button 
            variant="outline" 
            className="w-full gap-2" 
            onClick={onViewDetails}
            data-testid="button-view-token-details"
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
