import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Token } from "@shared/schema";
import { Coins, Lock, ExternalLink, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TokenDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: Token;
}

export function TokenDetailModal({
  open,
  onOpenChange,
  token,
}: TokenDetailModalProps) {
  const { toast } = useToast();

  const formatSupply = (supply: string) => {
    const num = BigInt(supply);
    return (Number(num) / 1e18).toLocaleString();
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Address Copied",
      description: "Contract address copied to clipboard",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="modal-token-detail">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Coins className="h-6 w-6 text-primary" data-testid="icon-token" />
            </div>
            <div>
              <DialogTitle className="text-2xl" data-testid="text-token-modal-name">
                {token.name}
              </DialogTitle>
              <DialogDescription className="font-mono" data-testid="text-token-modal-symbol">
                {token.symbol}
              </DialogDescription>
            </div>
            {token.isSupplyEncrypted && (
              <Badge variant="secondary" className="gap-1.5 ml-auto" data-testid="badge-encrypted">
                <Lock className="h-3 w-3" />
                Encrypted
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground" data-testid="text-token-info-label">
              Token Information
            </h3>
            <div className="grid gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Supply</span>
                <span className="font-mono font-medium" data-testid="text-token-modal-supply">
                  {token.isSupplyEncrypted
                    ? "••••••••"
                    : formatSupply(token.totalSupply)}{" "}
                  {token.symbol}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Decimals</span>
                <span className="font-mono font-medium" data-testid="text-token-modal-decimals">
                  {token.decimals}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span className="font-mono font-medium" data-testid="text-token-modal-created">
                  {new Date(token.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground" data-testid="text-contract-info-label">
              Contract Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Contract Address</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono bg-muted px-3 py-2 rounded" data-testid="text-token-modal-address">
                    {token.contractAddress}
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyAddress(token.contractAddress)}
                    data-testid="button-copy-address-modal"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Creator Address</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono bg-muted px-3 py-2 rounded" data-testid="text-token-modal-creator">
                    {token.creator}
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyAddress(token.creator)}
                    data-testid="button-copy-creator-modal"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() =>
                window.open(
                  `https://sepolia.etherscan.io/token/${token.contractAddress}`,
                  "_blank"
                )
              }
              data-testid="button-view-etherscan-modal"
            >
              View on Etherscan
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button onClick={() => onOpenChange(false)} className="flex-1" data-testid="button-close-token-modal">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
