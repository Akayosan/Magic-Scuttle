import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/AppHeader";
import { WalletProvider } from "@/contexts/WalletContext";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import CreateToken from "@/pages/CreateToken";
import CreatePresale from "@/pages/CreatePresale";
import ActivePresales from "@/pages/ActivePresales";
import MyTokens from "@/pages/MyTokens";
import NFTCollections from "@/pages/NFTCollections";
import CollectionDetail from "@/pages/CollectionDetail";
import NFTMarketplace from "@/pages/NFTMarketplace";
import MintNFT from "@/pages/MintNFT";
import NFTDetail from "@/pages/NFTDetail";
import NFTProfile from "@/pages/NFTProfile";
import NFTActivity from "@/pages/NFTActivity";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/create-token" component={CreateToken} />
      <Route path="/create-presale" component={CreatePresale} />
      <Route path="/presales" component={ActivePresales} />
      <Route path="/my-tokens" component={MyTokens} />
      <Route path="/nft/collections" component={NFTCollections} />
      <Route path="/nft/collections/:id" component={CollectionDetail} />
      <Route path="/nft/marketplace" component={NFTMarketplace} />
      <Route path="/nft/mint" component={MintNFT} />
      <Route path="/nft/:address/:tokenId" component={NFTDetail} />
      <Route path="/nft/profile" component={NFTProfile} />
      <Route path="/nft/activity" component={NFTActivity} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <WalletProvider>
          <TooltipProvider>
            <SidebarProvider style={style as React.CSSProperties}>
              <div className="flex h-screen w-full">
                <AppSidebar />
                <div className="flex flex-col flex-1">
                  <AppHeader />
                  <main className="flex-1 overflow-hidden">
                    <Router />
                  </main>
                </div>
              </div>
            </SidebarProvider>
            <Toaster />
          </TooltipProvider>
        </WalletProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
