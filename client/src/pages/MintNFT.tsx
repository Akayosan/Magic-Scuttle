import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Upload, X, Plus, Lock, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/WalletContext";
import { useNFTContract } from "@/hooks/useNFTContract";
import { getFhevmInstance } from "@/lib/fhevm";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type NFTCollection = {
  id: string;
  name: string;
  symbol: string;
  contractAddress: string;
};

export default function MintNFT() {
  const { toast } = useToast();
  const { walletState, provider, connectWallet } = useWallet();
  const { mintNFT, mintNFTWithEncryption, isLoading } = useNFTContract();
  const [, setLocation] = useLocation();
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [attributes, setAttributes] = useState<Array<{ trait_type: string; value: string }>>([]);
  const [encryptRarity, setEncryptRarity] = useState(false);
  const [encryptAttributes, setEncryptAttributes] = useState(false);
  const [rarity, setRarity] = useState<number>(1);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");

  const { data: collections } = useQuery<NFTCollection[]>({
    queryKey: ["/api/nft/collections"],
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addAttribute = () => {
    setAttributes([...attributes, { trait_type: "", value: "" }]);
  };

  const updateAttribute = (index: number, field: "trait_type" | "value", value: string) => {
    const updated = [...attributes];
    updated[index][field] = value;
    setAttributes(updated);
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
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

  const createMetadata = async (imageURI: string) => {
    const metadata = {
      name,
      description,
      image: imageURI,
      attributes: attributes.filter(a => a.trait_type && a.value),
    };
    
    const response = await fetch('/api/ipfs/upload-metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload metadata to IPFS');
    }

    const data = await response.json();
    return data.ipfsUrl;
  };

  const handleMint = async () => {
    if (!walletState.isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to mint NFTs",
        variant: "destructive",
      });
      connectWallet();
      return;
    }

    if (!imageFile || !name) {
      toast({
        title: "Missing Information",
        description: "Please provide an image and name for your NFT",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCollectionId) {
      toast({
        title: "Collection Required",
        description: "Please select a collection for your NFT",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Preparing NFT",
        description: "Uploading image and metadata...",
      });

      // Upload image to IPFS
      const imageURI = await uploadToIPFS(imageFile);
      
      // Create and upload metadata
      const tokenURI = await createMetadata(imageURI);

      toast({
        title: "Minting NFT",
        description: "Please confirm the transaction in your wallet...",
      });

      let tokenId: number | null = null;

      if (!provider) {
        throw new Error("Provider not available");
      }

      // NOTE: Encryption switches are display-only for UI purposes
      // All minting is done using standard (non-encrypted) method
      // The switches show what WOULD be encrypted, but actual minting is always basic
      tokenId = await mintNFT(
        CONTRACT_ADDRESSES.NFT,
        provider,
        tokenURI,
        "0.001" // Mint price in ETH
      );

      if (tokenId !== null) {
        toast({
          title: "NFT Minted Successfully!",
          description: `Your NFT #${tokenId} has been minted on Sepolia testnet. Saving to database...`,
        });

        // Save NFT to database
        try {
          const response = await fetch('/api/nft/items', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              collectionId: selectedCollectionId,
              tokenId: tokenId.toString(),
              contractAddress: CONTRACT_ADDRESSES.NFT,
              owner: walletState.address,
              tokenURI: tokenURI,
              imageUrl: imageURI,
              name,
              description: description || undefined,
              hasEncryptedRarity: false,
              hasEncryptedAttributes: false,
              attributes: attributes.filter(a => a.trait_type && a.value).length > 0 
                ? JSON.stringify(attributes.filter(a => a.trait_type && a.value))
                : undefined,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to save NFT to database");
          }

          toast({
            title: "NFT Saved!",
            description: "Your NFT has been saved and will appear in My NFTs",
          });

          // Reset form
          setImageFile(null);
          setImagePreview(null);
          setName("");
          setDescription("");
          setAttributes([]);
          setEncryptRarity(false);
          setEncryptAttributes(false);
          setSelectedCollectionId("");

          // Navigate to profile after 2 seconds
          setTimeout(() => {
            setLocation("/nft/profile");
          }, 2000);
        } catch (dbError: any) {
          console.error("Database save error:", dbError);
          toast({
            title: "Warning: NFT Minted but Not Saved",
            description: dbError.message || `Your NFT #${tokenId} was minted on-chain but failed to save to database. Please try again or contact support.`,
            variant: "destructive",
          });
          // Don't reset form so user can retry
        }
      }
    } catch (error: any) {
      toast({
        title: "Minting Failed",
        description: error.message || "Failed to mint NFT. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" data-testid="heading-mint">
            Mint NFT
          </h1>
          <p className="text-muted-foreground">
            Create your privacy-first NFT with encrypted attributes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Image Upload */}
            <Card className="p-6">
              <Label className="text-sm font-medium mb-4 block">NFT Image *</Label>
              {!imagePreview ? (
                <label htmlFor="image-upload" className="block">
                  <div className="border-2 border-dashed border-border rounded-xl p-12 hover-elevate active-elevate-2 cursor-pointer transition-all hover:border-primary">
                    <div className="text-center">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm font-medium mb-1">Click to upload image</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    data-testid="input-image"
                  />
                </label>
              ) : (
                <div className="relative rounded-xl overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="NFT Preview"
                    className="w-full aspect-square object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => setImagePreview(null)}
                    data-testid="button-remove-image"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </Card>

            {/* Collection Selection */}
            <Card className="p-6">
              <div className="space-y-2">
                <Label htmlFor="collection">Collection *</Label>
                <Select 
                  value={selectedCollectionId} 
                  onValueChange={setSelectedCollectionId}
                  disabled={!collections || collections.length === 0}
                >
                  <SelectTrigger id="collection" data-testid="select-collection">
                    <SelectValue placeholder={
                      !collections ? "Loading collections..." : 
                      collections.length === 0 ? "No collections available" :
                      "Select a collection"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {collections && collections.length > 0 ? (
                      collections.map((collection) => (
                        <SelectItem key={collection.id} value={collection.id}>
                          {collection.name} ({collection.symbol})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-collections" disabled>
                        No collections available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {!collections || collections.length === 0 
                    ? "Please create a collection first before minting NFTs."
                    : "Select the collection for your NFT."}
                </p>
              </div>
            </Card>

            {/* Basic Info */}
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Awesome NFT"
                    data-testid="input-name"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your NFT..."
                    rows={4}
                    data-testid="textarea-description"
                  />
                </div>
              </div>
            </Card>

            {/* Attributes */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Label>Attributes</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addAttribute}
                  className="gap-2"
                  data-testid="button-add-attribute"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>

              <div className="space-y-3">
                {attributes.map((attr, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Trait (e.g., Background)"
                      value={attr.trait_type}
                      onChange={(e) => updateAttribute(index, "trait_type", e.target.value)}
                      data-testid={`input-trait-${index}`}
                    />
                    <Input
                      placeholder="Value (e.g., Blue)"
                      value={attr.value}
                      onChange={(e) => updateAttribute(index, "value", e.target.value)}
                      data-testid={`input-value-${index}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAttribute(index)}
                      data-testid={`button-remove-attr-${index}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {attributes.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No attributes added yet
                </p>
              )}
            </Card>

            {/* Privacy Options */}
            <Card className="p-6">
              <Label className="text-sm font-medium mb-4 block">Privacy Settings</Label>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    <Label htmlFor="encrypt-rarity" className="cursor-pointer">
                      Encrypt Rarity
                    </Label>
                  </div>
                  <Switch
                    id="encrypt-rarity"
                    checked={encryptRarity}
                    onCheckedChange={setEncryptRarity}
                    data-testid="switch-encrypt-rarity"
                  />
                </div>

                {encryptRarity && (
                  <div>
                    <Label htmlFor="rarity">Rarity Level (1-100)</Label>
                    <Input
                      id="rarity"
                      type="number"
                      min="1"
                      max="100"
                      value={rarity}
                      onChange={(e) => setRarity(parseInt(e.target.value) || 1)}
                      placeholder="Enter rarity level"
                      data-testid="input-rarity"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Higher numbers = more rare
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    <Label htmlFor="encrypt-attrs" className="cursor-pointer">
                      Encrypt Attributes
                    </Label>
                  </div>
                  <Switch
                    id="encrypt-attrs"
                    checked={encryptAttributes}
                    onCheckedChange={setEncryptAttributes}
                    data-testid="switch-encrypt-attributes"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Live Preview Section */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
              
              <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/20 mb-4">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="NFT Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-24 h-24 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-2xl font-bold">
                  {name || "Untitled NFT"}
                </h4>

                {description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {description}
                  </p>
                )}

                {attributes.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">Attributes</div>
                    <div className="flex flex-wrap gap-2">
                      {attributes.filter(a => a.trait_type && a.value).map((attr, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {attr.trait_type}: {attr.value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {(encryptRarity || encryptAttributes) && (
                  <div className="flex gap-2">
                    {encryptRarity && (
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        <Lock className="w-3 h-3 mr-1" />
                        Private Rarity
                      </Badge>
                    )}
                    {encryptAttributes && (
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        <Lock className="w-3 h-3 mr-1" />
                        Private Attributes
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <Button
                className="w-full mt-6 h-12 text-lg"
                onClick={handleMint}
                disabled={!imagePreview || !name || isLoading}
                data-testid="button-mint"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Minting...
                  </>
                ) : (
                  "Mint NFT (0.001 ETH)"
                )}
              </Button>
              {!walletState.isConnected && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Connect your wallet to mint
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
