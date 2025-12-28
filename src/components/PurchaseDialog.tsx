import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { callSupabaseFunction } from "@/lib/supabaseFunctions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Smartphone } from "lucide-react";

interface PurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deckId: string;
  deckName: string;
  deckDescription: string;
  price: number;
  cardCount: number;
}

export const PurchaseDialog = ({
  open,
  onOpenChange,
  deckId,
  deckName,
  deckDescription,
  price,
  cardCount,
}: PurchaseDialogProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { isLoaded, isSignedIn, getAuthToken } = useAuth();

  const handlePurchase = async () => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      toast({
        title: "Sign in required",
        description: "Please sign in to purchase decks",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setLoading(true);
    try {
      const token = await getAuthToken();

      if (!token) {
        throw new Error("Unable to retrieve authentication token");
      }

      const data = await callSupabaseFunction<{
        url?: string;
        reference?: string;
        error?: string;
      }>("create-paystack-payment", {
        body: {
          deckId,
          deckName,
          price,
        },
        authToken: token,
      });

      if (data?.url) {
        // Store payment method and reference in localStorage for verification
        if (data.reference) {
          localStorage.setItem("paystack_reference", data.reference);
        }
        // Redirect to payment page
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Purchase Deck
          </DialogTitle>
          <DialogDescription>
            Get instant access to {deckName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Deck Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-lg">{deckName}</h3>
            <p className="text-sm text-muted-foreground">{deckDescription}</p>
            <Badge variant="secondary">{cardCount} cards included</Badge>
          </div>

          {/* Payment Provider */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Payment Provider</p>
            <div className="flex items-center gap-3 border rounded-lg p-3 bg-muted/50">
              <Smartphone className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold">Paystack</p>
                <p className="text-sm text-muted-foreground">
                  Secure mobile money and card payments processed by Paystack.
                </p>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <span className="text-sm text-muted-foreground">Total Amount</span>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary block">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(price)}
              </span>
              <span className="text-sm text-muted-foreground">
                Charged in USD
              </span>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <p className="text-sm font-medium">What you&apos;ll get:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                ✓ Lifetime access to {cardCount} unique cards
              </li>
              <li className="flex items-center gap-2">
                ✓ Play offline anytime
              </li>
              <li className="flex items-center gap-2">
                ✓ Regular content updates
              </li>
              <li className="flex items-center gap-2">✓ Multiplayer support</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={handlePurchase}
              disabled={loading}
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  <Smartphone className="w-4 h-4" />
                  Continue to Payment
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Secure payment powered by Paystack
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
