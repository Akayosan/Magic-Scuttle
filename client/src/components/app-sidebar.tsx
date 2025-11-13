import { Home, Coins, TrendingUp, Wallet, FileText, Image, ShoppingBag, Sparkles, User, Activity } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const tokenMenuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Create Token",
    url: "/create-token",
    icon: Coins,
  },
  {
    title: "Create Presale",
    url: "/create-presale",
    icon: TrendingUp,
  },
  {
    title: "Active Presales",
    url: "/presales",
    icon: FileText,
  },
  {
    title: "My Tokens",
    url: "/my-tokens",
    icon: Wallet,
  },
];

const nftMenuItems = [
  {
    title: "Collections",
    url: "/nft/collections",
    icon: Image,
  },
  {
    title: "Marketplace",
    url: "/nft/marketplace",
    icon: ShoppingBag,
  },
  {
    title: "Mint NFT",
    url: "/nft/mint",
    icon: Sparkles,
  },
  {
    title: "My NFTs",
    url: "/nft/profile",
    icon: User,
  },
  {
    title: "Activity",
    url: "/nft/activity",
    icon: Activity,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-6">
        <div className="flex items-center gap-3">
          <img 
            src="/scuttle-logo.jpg" 
            alt="Scuttle Social" 
            className="h-10 w-10 rounded-lg object-cover"
          />
          <div>
            <h2 className="font-display text-lg font-semibold text-sidebar-foreground">
              Scuttle Social
            </h2>
            <p className="text-xs text-muted-foreground">Privacy-First Presales</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Tokens & Presales</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tokenMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>NFT Marketplace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nftMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-nft-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
