// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { ClerkAuthError, requireClerkUserId } from "../_shared/clerk-auth.ts";
import { getUserProfile } from "../_shared/user-helpers.ts";
import { createRequestLogger } from "../_shared/logger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  const requestId = typeof crypto?.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const log = createRequestLogger({
    function: "verify-paystack-payment",
    requestId,
    method: req.method,
  });

  log.info("Incoming Paystack verification request", {
    method: req.method,
    url: req.url,
  });
  if (req.method === "OPTIONS") {
    const headers = new Headers(corsHeaders);
    const requestedHeaders = req.headers.get("Access-Control-Request-Headers");
    if (requestedHeaders) {
      headers.set("Access-Control-Allow-Headers", requestedHeaders);
    }
    log.debug("Handled OPTIONS preflight", { requestId });
    return new Response(null, { headers, status: 204 });
  }

  // Get Supabase credentials - try custom first, fall back to auto-injected
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = (Deno.env.get("CUSTOM_SUPABASE_SERVICE_KEY") || 
                              Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) ?? "";

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const clerkUserId = await requireClerkUserId(req);
    log.info("Verifying payment for user", { clerkUserId });
    const profile = await getUserProfile(clerkUserId);

    if (!profile) {
      log.error("Profile not found for authenticated user", { clerkUserId });
      throw new Error("Profile not found for authenticated Clerk user");
    }

    const { reference } = await req.json();

    if (!reference) {
      log.warn("Missing payment reference in request body");
      throw new Error("Payment reference is required");
    }

    // Verify transaction with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${Deno.env.get("PAYSTACK_SECRET_KEY")}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json();
      log.error("Paystack verification request failed", { error: errorData });
      throw new Error(errorData.message || "Failed to verify payment");
    }

    const verifyData = await verifyResponse.json();
    const transaction = verifyData.data;

    log.info("Paystack transaction verified", {
      status: transaction.status,
      reference: transaction.reference,
      amount: transaction.amount,
    });

    if (transaction.status !== "success") {
      log.warn("Paystack transaction not successful", {
        status: transaction.status,
      });
      throw new Error("Payment was not successful");
    }

    // Extract metadata
    const metadata = transaction.metadata ?? {};
    const deckId = metadata.deck_id;
    const deckName = metadata.deck_name;
    const metadataProfileId = metadata.profile_id ?? metadata.user_id;
    const metadataClerkUserId = metadata.clerk_user_id;

    if (!deckId) {
      log.error("Deck ID missing in transaction metadata", { metadata });
      throw new Error("Deck ID not found in transaction metadata");
    }

    if (!metadataProfileId) {
      log.error("Profile ID missing in transaction metadata", { metadata });
      throw new Error("Profile identifier missing from transaction metadata");
    }

    if (metadataProfileId !== profile.id) {
      log.error("Transaction metadata does not match profile", {
        metadataProfileId,
        profileId: profile.id,
      });
      throw new Error(
        "Payment transaction does not belong to the authenticated user"
      );
    }

    if (metadataClerkUserId && metadataClerkUserId !== clerkUserId) {
      log.error("Transaction metadata does not match Clerk user", {
        metadataClerkUserId,
        clerkUserId,
      });
      throw new Error(
        "Payment transaction does not belong to the authenticated Clerk user"
      );
    }

    log.info("Processing verified payment", { deckId, deckName });

    // Convert amount back from cents to KES
    const amountKES = transaction.amount / 100;

    // Check if purchase already exists (use admin client)
    const { data: existingPurchase } = await supabaseAdmin
      .from("purchases")
      .select("id")
      .eq("user_id", profile.id)
      .eq("deck_id", deckId)
      .maybeSingle();

    if (existingPurchase) {
      log.info("Purchase already exists; skipping creation", {
        deckId,
        clerkUserId,
      });
      return new Response(
        JSON.stringify({
          success: true,
          deckId,
          deckName,
          message: "Purchase already recorded",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Create purchase record (use admin client to bypass RLS since we already verified auth)
    const { error: purchaseError } = await supabaseAdmin
      .from("purchases")
      .insert({
        user_id: profile.id,
        deck_id: deckId,
        amount: amountKES,
        payment_method: "paystack",
      });

    if (purchaseError) {
      log.error("Error creating purchase record", { error: purchaseError });
      throw new Error("Failed to record purchase");
    }

    log.info("Purchase recorded successfully", {
      deckId,
      clerkUserId,
      amountKES,
    });

    return new Response(
      JSON.stringify({
        success: true,
        deckId,
        deckName,
        message: "Payment verified and purchase recorded",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    log.error("Error verifying Paystack payment", { error });
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    const status = error instanceof ClerkAuthError ? 401 : 500;
    log.warn("Returning Paystack verification error", {
      status,
      errorMessage,
    });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status,
    });
  }
});
