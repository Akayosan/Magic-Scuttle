import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { TransactionStatus } from "@shared/schema";

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: TransactionStatus;
  hash?: string;
  error?: string;
  title?: string;
  description?: string;
}

export function TransactionModal({
  open,
  onOpenChange,
  status,
  hash,
  error,
  title = "Transaction",
  description,
}: TransactionModalProps) {
  const getStatusContent = () => {
    switch (status) {
      case "pending":
        return {
          icon: <Loader2 className="h-12 w-12 text-primary animate-spin" />,
          title: "Waiting for Confirmation",
          description: "Please confirm the transaction in your wallet",
        };
      case "confirming":
        return {
          icon: <Loader2 className="h-12 w-12 text-primary animate-spin" />,
          title: "Processing Transaction",
          description: "Your transaction is being processed on the blockchain...",
        };
      case "success":
        return {
          icon: <CheckCircle2 className="h-12 w-12 text-green-500" />,
          title: "Transaction Successful",
          description: "Your transaction has been confirmed on the blockchain",
        };
      case "error":
        return {
          icon: <XCircle className="h-12 w-12 text-destructive" />,
          title: "Transaction Failed",
          description: error || "Something went wrong with your transaction",
        };
      default:
        return {
          icon: null,
          title,
          description,
        };
    }
  };

  const content = getStatusContent();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="modal-transaction">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            {content.icon}
          </div>
          <DialogTitle className="text-center text-2xl" data-testid="text-transaction-title">
            {content.title}
          </DialogTitle>
          <DialogDescription className="text-center" data-testid="text-transaction-description">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        {hash && (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-xs text-muted-foreground mb-2">Transaction Hash</p>
              <p className="font-mono text-xs break-all" data-testid="text-transaction-hash">
                {hash}
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() =>
                window.open(`https://sepolia.etherscan.io/tx/${hash}`, "_blank")
              }
              data-testid="button-view-on-etherscan"
            >
              View on Etherscan
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        )}

        {status === "success" && (
          <Button onClick={() => onOpenChange(false)} className="w-full" data-testid="button-close-modal">
            Close
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
