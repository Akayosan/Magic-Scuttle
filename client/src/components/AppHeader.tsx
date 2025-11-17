import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Moon, Sun, Wallet, ChevronDown, LogOut, Copy, ExternalLink } from "lucide-react";
import { useTheme } from "@/contexts/ThemeProvider";
import { useWallet } from "@/contexts/WalletContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export function AppHeader() {
  const { theme, toggleTheme } = useTheme();
  const { walletState, connectWallet, disconnectWallet, switchToSepolia } = useWallet();
  const { toast } = useToast();

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = () => {
    if (walletState.address) {
      navigator.clipboard.writeText(walletState.address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const openEtherscan = () => {
    if (walletState.address) {
      window.open(`https://sepolia.etherscan.io/address/${walletState.address}`, "_blank");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-6">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
        
        <div className="flex-1" />

        {!walletState.isCorrectNetwork && walletState.isConnected && (
          <Badge 
            variant="destructive" 
            className="cursor-pointer hover-elevate"
            onClick={switchToSepolia}
            data-testid="badge-wrong-network"
          >
            Wrong Network - Click to Switch
          </Badge>
        )}

        {walletState.isCorrectNetwork && (
          <Badge 
            variant="secondary" 
            className="gap-1.5 font-mono"
            data-testid="badge-network-status"
          >
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Sepolia Testnet
          </Badge>
        )}

        {walletState.isConnected ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="gap-2 font-mono"
                data-testid="button-wallet-menu"
              >
                <Wallet className="h-4 w-4" />
                {truncateAddress(walletState.address!)}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-mono text-xs">
                {walletState.address}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={copyAddress} data-testid="button-copy-address">
                <Copy className="mr-2 h-4 w-4" />
                Copy Address
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openEtherscan} data-testid="button-view-etherscan">
                <ExternalLink className="mr-2 h-4 w-4" />
                View on Etherscan
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={disconnectWallet} data-testid="button-disconnect">
                <LogOut className="mr-2 h-4 w-4" />
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            onClick={connectWallet} 
            className="gap-2"
            data-testid="button-connect-wallet"
          >
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          data-testid="button-theme-toggle"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
}
