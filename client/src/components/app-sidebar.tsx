import { Coins, TrendingUp, Wallet, FileText, Image, ShoppingBag, Sparkles, User, Activity } from "lucide-react";
import { SiX } from "react-icons/si";
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
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const nftMenuItems = [
  {
    title: "Marketplace",
    url: "/nft/marketplace",
    icon: ShoppingBag,
  },
  {
    title: "Collections",
    url: "/nft/collections",
    icon: Image,
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

const tokenMenuItems = [
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

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-6">
        <div className="flex items-center gap-3">
          <img 
            src="/scuttle-logo.jpg" 
            alt="Scuttle" 
            className="h-10 w-10 rounded-lg object-cover"
          />
          <div>
            <h2 className="font-display text-lg font-semibold text-sidebar-foreground">
              Magic Scuttle
            </h2>
            <p className="text-xs text-muted-foreground">FHE NFT & DeFi Marketplace</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
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
        
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>Tokens & Presales</span>
            <Badge variant="secondary" className="text-xs">Soon</Badge>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tokenMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    disabled
                    className="opacity-50 cursor-not-allowed"
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
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <a
          href="https://x.com/Scuttlecorp"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover-elevate transition-colors"
          data-testid="link-twitter"
        >
          <SiX className="h-4 w-4" />
          <span>Follow us on X</span>
        </a>
      </SidebarFooter>
    </Sidebar>
  );
}
