import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Presale } from "@shared/schema";
import { Lock, Loader2 } from "lucide-react";

interface ParticipateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presale: Presale;
  onParticipate: (amount: string, encrypted: boolean) => Promise<void>;
}

const participateSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  encryptContribution: z.boolean().default(false),
});

type ParticipateFormData = z.infer<typeof participateSchema>;

export function ParticipateModal({
  open,
  onOpenChange,
  presale,
  onParticipate,
}: ParticipateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ParticipateFormData>({
    resolver: zodResolver(participateSchema),
    defaultValues: {
      amount: "",
      encryptContribution: false,
    },
  });

  const onSubmit = async (data: ParticipateFormData) => {
    setIsSubmitting(true);
    try {
      await onParticipate(data.amount, data.encryptContribution);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Participation failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedAmount = form.watch("amount");
  const tokensToReceive = watchedAmount
    ? (Number(watchedAmount) * Number(presale.rate)).toLocaleString()
    : "0";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" data-testid="modal-participate">
        <DialogHeader>
          <DialogTitle className="text-2xl" data-testid="text-modal-title">
            Participate in {presale.tokenName} Presale
          </DialogTitle>
          <DialogDescription data-testid="text-modal-description">
            Contribute ETH to receive {presale.tokenSymbol} tokens
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel data-testid="label-contribution-amount">Contribution Amount (ETH)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.1"
                        {...field}
                        className="pr-16 font-mono"
                        data-testid="input-contribution-amount"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                        ETH
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription data-testid="text-contribution-range">
                    Min: {Number(presale.minContribution) / 1e18} ETH, Max:{" "}
                    {Number(presale.maxContribution) / 1e18} ETH
                  </FormDescription>
                  <FormMessage data-testid="error-contribution-amount" />
                </FormItem>
              )}
            />

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Exchange Rate</span>
                <span className="font-mono font-medium" data-testid="text-exchange-rate">
                  {presale.rate} {presale.tokenSymbol}/ETH
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">You will receive</span>
                <span className="font-mono font-medium" data-testid="text-tokens-to-receive">
                  {tokensToReceive} {presale.tokenSymbol}
                </span>
              </div>
            </div>

            {presale.isEncrypted && (
              <FormField
                control={form.control}
                name="encryptContribution"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-2" data-testid="label-encrypt-contribution">
                        <Lock className="h-4 w-4" />
                        Encrypt My Contribution
                      </FormLabel>
                      <FormDescription data-testid="text-encrypt-description">
                        Hide your contribution amount using fhEVM
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-encrypt-contribution"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={isSubmitting}
                data-testid="button-cancel-participate"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 gap-2"
                disabled={isSubmitting}
                data-testid="button-confirm-participate"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Participate"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
