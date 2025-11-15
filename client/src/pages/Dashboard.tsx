import { Coins, TrendingUp, Users, Wallet, Image, ShoppingBag, Sparkles, Shield, Lock, Zap, Rocket, Star, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useWallet } from "@/contexts/WalletContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';
import { ipfsToHttp } from "@/lib/ipfs";

export default function Dashboard() {
  const { walletState } = useWallet();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  
  // Fetch real data from backend
  const { data: tokens } = useQuery({ 
    queryKey: ['/api/tokens'],
    enabled: walletState.isConnected
  });
  
  const { data: presales } = useQuery({ 
    queryKey: ['/api/presales'],
    enabled: walletState.isConnected
  });
  
  const { data: nftCollections } = useQuery({ 
    queryKey: ['/api/nft/collections'],
    enabled: walletState.isConnected
  });
  
  const { data: nftItems } = useQuery({ 
    queryKey: ['/api/nft/items'],
    enabled: walletState.isConnected
  });
  
  const tokenCount = tokens?.length || 0;
  const presaleCount = presales?.length || 0;
  const activePresaleCount = presales?.filter((p: any) => {
    const now = Date.now();
    return p.startTime <= now && p.endTime >= now;
  }).length || 0;
  const collectionCount = nftCollections?.length || 0;
  const nftItemCount = nftItems?.length || 0;

  // Featured NFTs - top 3 most recent with valid data
  const featuredNFTs = (nftItems || [])
    .filter((nft: any) => 
      nft && nft.contractAddress && nft.tokenId !== undefined && nft.tokenId !== null
    )
    .slice(0, 3);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    
    emblaApi.on('init', onSelect);
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    
    // Force reInit to trigger event handlers and set initial state
    emblaApi.reInit();
  }, [emblaApi, onSelect]);

  // Update navigation state when featured NFTs change
  useEffect(() => {
    if (emblaApi && featuredNFTs.length > 0) {
      emblaApi.reInit();
    }
  }, [emblaApi, featuredNFTs.length]);

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
    <div className="flex-1 overflow-auto" data-testid="view-dashboard">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/10 to-background border-b">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="relative px-6 py-12 md:py-16">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 border-0 text-white mb-2" data-testid="badge-fhevm">
              <Shield className="w-3 h-3 mr-1" />
              Powered by Zama fhEVM v0.9
            </Badge>
            <h1 className="font-display text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent" data-testid="text-hero-title">
              Scuttle
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-hero-subtitle">
              Platform DeFi Terenkripsi Penuh untuk Token, Presale, dan NFT dengan Privasi Blockchain
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background/50 backdrop-blur border">
                <Lock className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Privasi FHE</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background/50 backdrop-blur border">
                <Zap className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium">Sepolia Testnet</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background/50 backdrop-blur border">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Smart Contract Teraudit</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured NFTs Showcase */}
      {featuredNFTs.length > 0 && (
        <div className="border-b bg-gradient-to-b from-background/50 to-background">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-3xl font-bold mb-2" data-testid="text-featured-nfts-title">
                  NFT Unggulan
                </h2>
                <p className="text-muted-foreground" data-testid="text-featured-nfts-subtitle">
                  Jelajahi koleksi NFT teratas dengan atribut terenkripsi
                </p>
              </div>
              <Link href="/nft/marketplace">
                <Button variant="outline" className="gap-2" data-testid="button-view-all-nfts">
                  Lihat Semua
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="relative">
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-6">
                  {featuredNFTs.map((nft: any) => (
                    <div key={nft.id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%]" data-testid={`featured-nft-${nft.id}`}>
                      <Card className="overflow-hidden hover-elevate transition-all group cursor-pointer border-primary/20">
                        <Link href={`/nft/${nft.contractAddress}/${nft.tokenId}`}>
                          <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                            {nft.imageUrl ? (
                              <img 
                                src={ipfsToHttp(nft.imageUrl)}
                                alt={nft.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                data-testid={`img-nft-${nft.id}`}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Sparkles className="w-16 h-16 text-muted-foreground/20" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            {nft.hasEncryptedRarity && (
                              <Badge className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 border-0 text-white">
                                <Lock className="w-3 h-3 mr-1" />
                                Encrypted
                              </Badge>
                            )}
                          </div>
                          <CardContent className="p-5">
                            <div className="space-y-3">
                              <div>
                                <h3 className="font-display text-xl font-semibold mb-1 truncate" data-testid={`text-nft-name-${nft.id}`}>
                                  {nft.name}
                                </h3>
                                <p className="text-sm text-muted-foreground truncate" data-testid={`text-nft-collection-${nft.id}`}>
                                  Token #{nft.tokenId}
                                </p>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t">
                                <div>
                                  <p className="text-xs text-muted-foreground">Owner</p>
                                  <p className="font-mono text-sm font-medium" data-testid={`text-nft-owner-${nft.id}`}>
                                    {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
                                  </p>
                                </div>
                                <Button size="sm" variant="outline" className="gap-1">
                                  <ArrowRight className="w-3 h-3" />
                                  Detail
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Link>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
              
              {featuredNFTs.length > 1 && emblaApi && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={scrollPrev}
                    disabled={!canScrollPrev}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 rounded-full bg-background/80 backdrop-blur shadow-lg border-primary/20 disabled:opacity-30"
                    data-testid="button-slider-prev"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={scrollNext}
                    disabled={!canScrollNext}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 rounded-full bg-background/80 backdrop-blur shadow-lg border-primary/20 disabled:opacity-30"
                    data-testid="button-slider-next"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="p-6 space-y-8">
        {/* Stats Overview */}
        <div>
          <h2 className="font-display text-2xl font-semibold mb-4" data-testid="text-stats-title">
            Statistik Platform
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Token"
              value={tokenCount.toString()}
              icon={Coins}
              description="Token yang Anda buat"
            />
            <StatCard
              title="Presale Aktif"
              value={activePresaleCount.toString()}
              icon={TrendingUp}
              description="Kampanye fundraising live"
            />
            <StatCard
              title="Koleksi NFT"
              value={collectionCount.toString()}
              icon={Image}
              description="Koleksi NFT unik"
            />
            <StatCard
              title="Total NFT"
              value={nftItemCount.toString()}
              icon={Sparkles}
              description="NFT yang di-mint"
            />
          </div>
        </div>

        {/* About Scuttle */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Rocket className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Tentang Scuttle</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Scuttle adalah platform DeFi terdepan yang mengintegrasikan teknologi Fully Homomorphic Encryption (FHE) 
              dari Zama untuk memberikan privasi maksimal dalam setiap transaksi blockchain. Platform kami memungkinkan 
              Anda untuk membuat token dengan supply terenkripsi, menjalankan presale dengan kontribusi pribadi, dan 
              minting NFT dengan atribut tersembunyi.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50 border">
                <Lock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Privasi Penuh</h4>
                  <p className="text-sm text-muted-foreground">Data sensitif dienkripsi on-chain menggunakan fhEVM</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50 border">
                <Shield className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Keamanan Tinggi</h4>
                  <p className="text-sm text-muted-foreground">Smart contract teraudit dengan mekanisme escrow</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50 border">
                <Zap className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Transaksi Cepat</h4>
                  <p className="text-sm text-muted-foreground">Berjalan di Sepolia testnet dengan biaya rendah</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
    </div>
  );
}
