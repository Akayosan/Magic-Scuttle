import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Upload, X, ArrowLeft, Loader2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/useWallet";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";

export default function CreateCollection() {
  const { toast } = useToast();
  const { address, isConnected } = useWallet();
  const [, setLocation] = useLocation();
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [royaltyRecipient, setRoyaltyRecipient] = useState("");
  const [royaltyPercent, setRoyaltyPercent] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'image') {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setBannerFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setBannerPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const uploadToIPFS = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/ipfs/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload to IPFS');
    }

    const data = await response.json();
    return data.ipfsUrl;
  };

  const createCollectionMutation = useMutation({
    mutationFn: async () => {
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet");
      }

      // Validate contract address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
        throw new Error("Invalid contract address format");
      }

      // Validate symbol (alphanumeric, 2-10 chars)
      if (!/^[A-Z0-9]{2,10}$/.test(symbol)) {
        throw new Error("Symbol must be 2-10 uppercase alphanumeric characters");
      }

      // Validate royalty percentage
      const royaltyNum = royaltyPercent ? parseFloat(royaltyPercent) : 0;
      if (isNaN(royaltyNum) || royaltyNum < 0 || royaltyNum > 10) {
        throw new Error("Royalty percentage must be between 0 and 10");
      }

      let imageUrl: string | null = null;
      let bannerUrl: string | null = null;

      if (imageFile) {
        toast({
          title: "Uploading Collection Image",
          description: "Uploading to IPFS...",
        });
        imageUrl = await uploadToIPFS(imageFile);
      }

      if (bannerFile) {
        toast({
          title: "Uploading Banner Image",
          description: "Uploading to IPFS...",
        });
        bannerUrl = await uploadToIPFS(bannerFile);
      }

      const royaltyBasisPoints = Math.round(royaltyNum * 100);

      return apiRequest("POST", "/api/nft/collections", {
        contractAddress,
        name,
        symbol,
        creator: address,
        description: description || undefined,
        imageUrl: imageUrl || undefined,
        bannerUrl: bannerUrl || undefined,
        royaltyRecipient: royaltyRecipient || undefined,
        royaltyBasisPoints,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nft/collections"] });
      toast({
        title: "Collection Created Successfully!",
        description: "Your NFT collection has been created",
      });
      setLocation("/nft/collections");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Collection",
        description: error.message || "There was an error creating your collection",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create a collection",
        variant: "destructive",
      });
      return;
    }

    if (!name || !symbol || !contractAddress) {
      toast({
        title: "Missing Information",
        description: "Please provide name, symbol, and contract address",
        variant: "destructive",
      });
      return;
    }

    // Validate contract address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
      toast({
        title: "Invalid Contract Address",
        description: "Please enter a valid Ethereum address (0x...)",
        variant: "destructive",
      });
      return;
    }

    // Validate symbol
    if (!/^[A-Z0-9]{2,10}$/.test(symbol)) {
      toast({
        title: "Invalid Symbol",
        description: "Symbol must be 2-10 uppercase alphanumeric characters",
        variant: "destructive",
      });
      return;
    }

    // Validate royalty if provided
    if (royaltyPercent) {
      const royaltyNum = parseFloat(royaltyPercent);
      if (isNaN(royaltyNum) || royaltyNum < 0 || royaltyNum > 10) {
        toast({
          title: "Invalid Royalty",
          description: "Royalty percentage must be between 0 and 10",
          variant: "destructive",
        });
        return;
      }
    }

    createCollectionMutation.mutate();
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/nft/collections">
            <Button variant="ghost" className="mb-4 gap-2" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
              Back to Collections
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" data-testid="heading-create-collection">
            Create NFT Collection
          </h1>
          <p className="text-muted-foreground">
            Set up your NFT collection with metadata and royalty settings
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Banner Image */}
          <Card className="p-6">
            <Label className="text-lg font-semibold mb-4 block">Banner Image (Optional)</Label>
            <div className="aspect-[3/1] w-full rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/20 relative border-2 border-dashed border-border">
              {bannerPreview ? (
                <>
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                    data-testid="img-banner-preview"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setBannerFile(null);
                      setBannerPreview(null);
                    }}
                    data-testid="button-remove-banner"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center h-full cursor-pointer">
                  <Upload className="w-12 h-12 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Upload Banner (16:9 recommended)</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'banner')}
                    data-testid="input-banner"
                  />
                </label>
              )}
            </div>
          </Card>

          {/* Logo & Basic Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Collection Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo */}
              <div>
                <Label className="mb-2 block">Logo Image (Optional)</Label>
                <div className="aspect-square w-full max-w-xs rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/20 relative border-2 border-dashed border-border">
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Logo preview"
                        className="w-full h-full object-cover"
                        data-testid="img-logo-preview"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        data-testid="button-remove-logo"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-full cursor-pointer">
                      <ImageIcon className="w-12 h-12 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Upload Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, 'image')}
                        data-testid="input-logo"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Collection Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My NFT Collection"
                    required
                    data-testid="input-name"
                  />
                </div>
                <div>
                  <Label htmlFor="symbol">Symbol *</Label>
                  <Input
                    id="symbol"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    placeholder="MNFT"
                    required
                    data-testid="input-symbol"
                  />
                </div>
                <div>
                  <Label htmlFor="contractAddress">Contract Address *</Label>
                  <Input
                    id="contractAddress"
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    placeholder="0x..."
                    required
                    data-testid="input-contract-address"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    The address of your deployed NFT contract
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your collection..."
                rows={4}
                data-testid="input-description"
              />
            </div>
          </Card>

          {/* Royalties */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Royalty Settings (Optional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="royaltyRecipient">Royalty Recipient Address</Label>
                <Input
                  id="royaltyRecipient"
                  value={royaltyRecipient}
                  onChange={(e) => setRoyaltyRecipient(e.target.value)}
                  placeholder="0x... (defaults to creator)"
                  data-testid="input-royalty-recipient"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Address that will receive royalties from secondary sales
                </p>
              </div>
              <div>
                <Label htmlFor="royaltyPercent">Royalty Percentage</Label>
                <Input
                  id="royaltyPercent"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={royaltyPercent}
                  onChange={(e) => setRoyaltyPercent(e.target.value)}
                  placeholder="2.5"
                  data-testid="input-royalty-percent"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Percentage of sales price (0-10%)
                </p>
              </div>
            </div>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Link href="/nft/collections" className="flex-1">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                disabled={createCollectionMutation.isPending}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              className="flex-1"
              disabled={createCollectionMutation.isPending || !name || !symbol || !contractAddress || !isConnected}
              data-testid="button-submit-collection"
            >
              {createCollectionMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Collection"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
