import { useState } from "react";
import { PresaleCard } from "@/components/PresaleCard";
import { ParticipateModal } from "@/components/ParticipateModal";
import { TransactionModal } from "@/components/TransactionModal";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, TrendingUp } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { Presale, TransactionStatus } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function ActivePresales() {
  const { walletState } = useWallet();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedPresale, setSelectedPresale] = useState<Presale | null>(null);
  const [participateModalOpen, setParticipateModalOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<TransactionStatus>("idle");
  const [txHash, setTxHash] = useState<string>();
  const [txError, setTxError] = useState<string>();

  // Mock data - will be replaced with real data from contracts
  const presales: Presale[] = [];

  const handleParticipate = async (amount: string, encrypted: boolean) => {
    setTxStatus("pending");
    setParticipateModalOpen(false);
    
    try {
      // TODO: Implement actual participation logic with smart contract
      console.log("Participating:", { amount, encrypted });
      
      setTxStatus("confirming");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTxStatus("success");
      setTxHash("0x" + "1".repeat(64)); // Mock tx hash
      
      toast({
        title: "Participation Successful",
        description: `You've contributed ${amount} ETH to the presale`,
      });
    } catch (error: any) {
      setTxStatus("error");
      setTxError(error.message || "Transaction failed");
      toast({
        title: "Participation Failed",
        description: error.message || "Failed to participate in presale",
        variant: "destructive",
      });
    }
  };

  const filteredPresales = presales.filter((presale) => {
    const matchesSearch = presale.tokenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         presale.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || 
                         (filterStatus === "active" && presale.isActive) ||
                         (filterStatus === "ended" && !presale.isActive);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-3xl font-semibold mb-2" data-testid="text-presales-title">
            Active Presales
          </h1>
          <p className="text-muted-foreground" data-testid="text-presales-subtitle">
            Browse and participate in ongoing token presales
          </p>
        </div>

        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by token name or symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-presales"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48" data-testid="select-filter-status">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" data-testid="option-filter-all">All Presales</SelectItem>
                <SelectItem value="active" data-testid="option-filter-active">Active Only</SelectItem>
                <SelectItem value="ended" data-testid="option-filter-ended">Ended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {!walletState.isConnected ? (
          <Card className="p-12 text-center" data-testid="view-connect-wallet-presales">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-4">
                <TrendingUp className="h-8 w-8 text-primary" data-testid="icon-connect-wallet" />
              </div>
            </div>
            <h3 className="font-display text-xl font-semibold mb-2" data-testid="text-connect-wallet-title">
              Connect Your Wallet
            </h3>
            <p className="text-muted-foreground" data-testid="text-connect-wallet-desc">
              Connect your wallet to view and participate in presales
            </p>
          </Card>
        ) : filteredPresales.length === 0 ? (
          <Card className="p-12 text-center" data-testid="view-no-presales">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-muted p-4">
                <TrendingUp className="h-8 w-8 text-muted-foreground" data-testid="icon-no-presales" />
              </div>
            </div>
            <h3 className="font-display text-xl font-semibold mb-2" data-testid="text-no-presales-title">
              No Presales Found
            </h3>
            <p className="text-muted-foreground mb-4" data-testid="text-no-presales-desc">
              {searchQuery ? "Try adjusting your search criteria" : "Be the first to launch a presale!"}
            </p>
            {!searchQuery && (
              <Link href="/create-presale">
                <Button data-testid="button-create-first-presale">
                  Create Presale
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPresales.map((presale) => (
              <PresaleCard
                key={presale.id}
                presale={presale}
                onParticipate={() => {
                  setSelectedPresale(presale);
                  setParticipateModalOpen(true);
                }}
                onViewDetails={() => {
                  // TODO: Navigate to presale details
                }}
              />
            ))}
          </div>
        )}

        {selectedPresale && (
          <ParticipateModal
            open={participateModalOpen}
            onOpenChange={setParticipateModalOpen}
            presale={selectedPresale}
            onParticipate={handleParticipate}
          />
        )}

        <TransactionModal
          open={txStatus !== "idle"}
          onOpenChange={() => setTxStatus("idle")}
          status={txStatus}
          hash={txHash}
          error={txError}
        />
      </div>
    </div>
  );
}
