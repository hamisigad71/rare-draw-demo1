import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Loader2, Play, Library } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { callSupabaseFunction } from "@/lib/supabaseFunctions";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [deckName, setDeckName] = useState<string | null>(null);
  const [verifiedDeckId, setVerifiedDeckId] = useState<string | null>(null);
  const { isLoaded, isSignedIn, getAuthToken } = useAuth();

  const reference = searchParams.get("reference");

  const verifyPaystackPayment = useCallback(
    async (ref: string) => {
      try {
        if (!ref) throw new Error("No payment reference found");

        const token = await getAuthToken();

        if (!token) {
          throw new Error("Unable to retrieve authentication token");
        }

        const data = await callSupabaseFunction<{
          success: boolean;
          deckName?: string;
          deckId?: string;
          message?: string;
        }>("verify-paystack-payment", {
          body: { reference: ref },
          authToken: token,
        });

        if (data.success) {
          setDeckName(data.deckName);
          setVerifiedDeckId(data.deckId);
          toast({
            title: "Purchase successful! 🎉",
            description: `${
              data.deckName || "The deck"
            } has been added to your library`,
          });
        } else {
          throw new Error(data.message || "Payment verification failed");
        }
      } catch (error: any) {
        toast({
          title: "Verification failed",
          description: error.message,
          variant: "destructive",
        });
        navigate("/marketplace");
      } finally {
        // Clean up localStorage
        localStorage.removeItem("paystack_reference");
        setVerifying(false);
      }
    },
    [getAuthToken, toast, navigate]
  );

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      toast({
        title: "Sign in required",
        description: "Please sign in again to complete verification",
        variant: "destructive",
      });
      setVerifying(false);
      navigate("/auth");
      return;
    }

    const storedReference = localStorage.getItem("paystack_reference");
    const refToVerify = reference || storedReference;

    if (!refToVerify) {
      toast({
        title: "Invalid session",
        description: "No payment session found",
        variant: "destructive",
      });
      setVerifying(false);
      navigate("/marketplace");
      return;
    }

    void verifyPaystackPayment(refToVerify);
  }, [isLoaded, isSignedIn, reference, verifyPaystackPayment, toast, navigate]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-12 pb-12">
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-6 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Verifying Payment...</h2>
            <p className="text-muted-foreground">
              Please wait while we confirm your purchase
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center animate-scale-in">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-20 h-20 text-green-500" />
          </div>
          <CardTitle className="text-3xl mb-2">Payment Successful!</CardTitle>
          <CardDescription className="text-lg">
            {deckName
              ? `${deckName} has been added to your library`
              : "Your deck is now available"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-4">
              Your payment has been processed successfully. You can now access
              your new deck from your library.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full gap-2"
                onClick={() => navigate(`/game?deck=${verifiedDeckId}`)}
                disabled={!verifiedDeckId}
              >
                <Play className="w-4 h-4" />
                Play Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full gap-2"
                onClick={() => navigate("/library")}
              >
                <Library className="w-4 h-4" />
                Go to Library
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={() => navigate("/marketplace")}
            className="w-full"
          >
            Browse More Decks
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
