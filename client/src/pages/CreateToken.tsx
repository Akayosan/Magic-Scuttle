import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Coins, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";

const tokenFormSchema = z.object({
  name: z.string().min(1, "Token name is required").max(50, "Name too long"),
  symbol: z.string().min(1, "Symbol is required").max(10, "Symbol too long").toUpperCase(),
  totalSupply: z.string().min(1, "Total supply is required"),
  decimals: z.coerce.number().min(0).max(18).default(18),
  encryptSupply: z.boolean().default(false),
});

type TokenFormData = z.infer<typeof tokenFormSchema>;

export default function CreateToken() {
  const { walletState } = useWallet();
  const { toast } = useToast();
  const [isDeploying, setIsDeploying] = useState(false);

  const form = useForm<TokenFormData>({
    resolver: zodResolver(tokenFormSchema),
    defaultValues: {
      name: "",
      symbol: "",
      totalSupply: "",
      decimals: 18,
      encryptSupply: false,
    },
  });

  const onSubmit = async (data: TokenFormData) => {
    if (!walletState.isConnected || !walletState.isCorrectNetwork) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to Sepolia network",
        variant: "destructive",
      });
      return;
    }

    setIsDeploying(true);
    try {
      // TODO: Deploy token contract
      console.log("Deploying token:", data);
      
      toast({
        title: "Deployment In Progress",
        description: "Your token contract is being deployed...",
      });
      
      // Simulate deployment
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Token Created Successfully!",
        description: `${data.name} (${data.symbol}) has been deployed`,
      });
      
      form.reset();
    } catch (error: any) {
      toast({
        title: "Deployment Failed",
        description: error.message || "Failed to deploy token contract",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const watchedValues = form.watch();

  return (
    <div className="flex-1 overflow-auto p-6" data-testid="view-create-token">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-3xl font-semibold mb-2" data-testid="text-create-token-page-title">
            Create Token
          </h1>
          <p className="text-muted-foreground" data-testid="text-create-token-page-subtitle">
            Deploy a new ERC20 token with optional encrypted parameters using Zama fhEVM
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    Token Information
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Basic details about your token
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="My Token" 
                          {...field}
                          data-testid="input-token-name"
                        />
                      </FormControl>
                      <FormDescription>
                        The full name of your token
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="symbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token Symbol</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="MTK" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          data-testid="input-token-symbol"
                        />
                      </FormControl>
                      <FormDescription>
                        A short identifier (e.g., ETH, BTC)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalSupply"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Supply</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1000000" 
                          {...field}
                          data-testid="input-token-supply"
                        />
                      </FormControl>
                      <FormDescription>
                        Total number of tokens to create
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="decimals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Decimals</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          data-testid="input-token-decimals"
                        />
                      </FormControl>
                      <FormDescription>
                        Number of decimal places (18 is standard)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4 border-t">
                  <FormField
                    control={form.control}
                    name="encryptSupply"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Encrypt Total Supply
                          </FormLabel>
                          <FormDescription>
                            Hide the total supply using fhEVM encryption
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-encrypt-supply"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full gap-2" 
                  disabled={isDeploying || !walletState.isConnected}
                  data-testid="button-create-token"
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deploying Contract...
                    </>
                  ) : (
                    <>
                      Create Token
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Preview</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Coins className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-display text-xl font-semibold">
                      {watchedValues.name || "Token Name"}
                    </p>
                    <p className="font-mono text-sm text-muted-foreground">
                      {watchedValues.symbol || "SYMBOL"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Supply</span>
                    <span className="font-mono font-medium">
                      {watchedValues.encryptSupply
                        ? "••••••••"
                        : (watchedValues.totalSupply || "0")} {watchedValues.symbol || "SYMBOL"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Decimals</span>
                    <span className="font-mono font-medium">{watchedValues.decimals}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Privacy</span>
                    <span className="flex items-center gap-1.5">
                      {watchedValues.encryptSupply && (
                        <Lock className="h-3 w-3 text-primary" />
                      )}
                      {watchedValues.encryptSupply ? "Encrypted" : "Public"}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-primary/5 border-primary/20">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Privacy Features
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Encrypted supply keeps total token amount private</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Powered by Zama fhEVM homomorphic encryption</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Full ERC20 compatibility with privacy layer</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
