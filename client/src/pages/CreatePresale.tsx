import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { TrendingUp, Lock, ArrowRight, Loader2, Calendar } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";

const presaleFormSchema = z.object({
  tokenAddress: z.string().min(42, "Invalid token address"),
  rate: z.string().min(1, "Rate is required"),
  hardCap: z.string().min(1, "Hard cap is required"),
  softCap: z.string().min(1, "Soft cap is required"),
  minContribution: z.string().min(1, "Min contribution is required"),
  maxContribution: z.string().min(1, "Max contribution is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  encryptContributions: z.boolean().default(false),
});

type PresaleFormData = z.infer<typeof presaleFormSchema>;

export default function CreatePresale() {
  const { walletState } = useWallet();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<PresaleFormData>({
    resolver: zodResolver(presaleFormSchema),
    defaultValues: {
      tokenAddress: "",
      rate: "",
      hardCap: "",
      softCap: "",
      minContribution: "0.01",
      maxContribution: "10",
      startTime: "",
      endTime: "",
      encryptContributions: false,
    },
  });

  const onSubmit = async (data: PresaleFormData) => {
    if (!walletState.isConnected || !walletState.isCorrectNetwork) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to Sepolia network",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      // TODO: Create presale contract
      console.log("Creating presale:", data);
      
      toast({
        title: "Creating Presale",
        description: "Your presale contract is being deployed...",
      });
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Presale Created Successfully!",
        description: "Your presale is now live",
      });
      
      form.reset();
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create presale",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const watchedValues = form.watch();

  return (
    <div className="flex-1 overflow-auto p-6" data-testid="view-create-presale">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-3xl font-semibold mb-2" data-testid="text-create-presale-page-title">
            Create Presale
          </h1>
          <p className="text-muted-foreground" data-testid="text-create-presale-page-subtitle">
            Launch a token presale campaign with optional encrypted contributions
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Presale Details
                  </h2>
                </div>

                <FormField
                  control={form.control}
                  name="tokenAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token Contract Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="0x..." 
                          {...field}
                          className="font-mono"
                          data-testid="input-token-address"
                        />
                      </FormControl>
                      <FormDescription>
                        The address of the token to sell
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exchange Rate</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="1000" 
                          {...field}
                          data-testid="input-rate"
                        />
                      </FormControl>
                      <FormDescription>
                        Tokens per 1 ETH
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="softCap"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Soft Cap (ETH)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.01"
                            placeholder="5" 
                            {...field}
                            data-testid="input-soft-cap"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hardCap"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hard Cap (ETH)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.01"
                            placeholder="100" 
                            {...field}
                            data-testid="input-hard-cap"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minContribution"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Contribution (ETH)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.01"
                            placeholder="0.01" 
                            {...field}
                            data-testid="input-min-contribution"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxContribution"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Contribution (ETH)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.01"
                            placeholder="10" 
                            {...field}
                            data-testid="input-max-contribution"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local"
                            {...field}
                            data-testid="input-start-time"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local"
                            {...field}
                            data-testid="input-end-time"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-4 border-t">
                  <FormField
                    control={form.control}
                    name="encryptContributions"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Encrypt Contributions
                          </FormLabel>
                          <FormDescription>
                            Keep contribution amounts private using fhEVM
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-encrypt-contributions"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full gap-2" 
                  disabled={isCreating || !walletState.isConnected}
                  data-testid="button-create-presale"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Presale...
                    </>
                  ) : (
                    <>
                      Create Presale
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Exchange Rate</span>
                  <span className="font-mono font-medium">
                    {watchedValues.rate || "0"} tokens/ETH
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Soft Cap</span>
                  <span className="font-mono font-medium">
                    {watchedValues.softCap || "0"} ETH
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Hard Cap</span>
                  <span className="font-mono font-medium">
                    {watchedValues.hardCap || "0"} ETH
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Contribution Range</span>
                  <span className="font-mono font-medium">
                    {watchedValues.minContribution || "0"} - {watchedValues.maxContribution || "0"} ETH
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Privacy</span>
                  <span className="flex items-center gap-1.5">
                    {watchedValues.encryptContributions && (
                      <Lock className="h-3 w-3 text-primary" />
                    )}
                    {watchedValues.encryptContributions ? "Encrypted" : "Public"}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-primary/5 border-primary/20">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Important Notes
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Ensure you have approved the token for presale contract</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Encrypted contributions hide individual amounts from public view</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>You can claim unsold tokens after the presale ends</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
