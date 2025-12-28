// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  ClerkAuthError,
  requireClerkUserId,
  getClerkUser,
} from "../_shared/clerk-auth.ts";
import { getUserProfile } from "../_shared/user-helpers.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    const headers = new Headers(corsHeaders);
    const requestedHeaders = req.headers.get("Access-Control-Request-Headers");
    if (requestedHeaders) {
      headers.set("Access-Control-Allow-Headers", requestedHeaders);
    }
    return new Response(null, { headers, status: 204 });
  }

  try {
    const clerkUserId = await requireClerkUserId(req);
    let profile = await getUserProfile(clerkUserId);

    // If profile doesn't exist, create it from Clerk data
    if (!profile) {
      console.log("Profile not found, creating from Clerk data...");
      const clerkUser = await getClerkUser(clerkUserId);
      
      if (!clerkUser) {
        throw new Error("Unable to fetch Clerk user data");
      }

      // Get Supabase credentials - try custom first, fall back to auto-injected
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseServiceKey = Deno.env.get("CUSTOM_SUPABASE_SERVICE_KEY") || 
                                 Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Missing Supabase configuration");
      }

      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.78.0");
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const email = clerkUser?.primaryEmailAddress?.emailAddress || 
                    clerkUser?.emailAddresses?.[0]?.emailAddress || null;
      
      const username = clerkUser.username || 
                      clerkUser.firstName || 
                      email?.split('@')[0] || 
                      `user_${clerkUserId.slice(0, 8)}`;

      // Insert new profile with Clerk user ID as the primary key
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: clerkUserId,
          username,
          email,
          avatar_url: clerkUser.imageUrl,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating profile:", insertError);
        throw new Error("Failed to create user profile");
      }

      profile = newProfile;
    }

    let email = profile.email;

    if (!email) {
      try {
        const clerkUser = await getClerkUser(clerkUserId);
        email =
          clerkUser?.primaryEmailAddress?.emailAddress ||
          clerkUser?.emailAddresses?.[0]?.emailAddress ||
          null;
      } catch (clerkError) {
        console.error("Unable to fetch Clerk user details:", clerkError);
      }
    }

    if (!email) {
      throw new Error("User email not available for payment session");
    }

    // Get request body
    const { deckId, deckName, price } = await req.json();

    // Convert USD to KES (approximate rate: 1 USD = 130 KES)
    const amountInKES = Math.round(price * 130);
    // Paystack expects amount in kobo (smallest currency unit)
    // For KES: 1 KES = 100 cents
    const amountInCents = amountInKES * 100;

    const siteUrl =
      Deno.env.get("SITE_URL") ??
      req.headers.get("origin") ??
      "http://localhost:3000";
    const normalizedSiteUrl = siteUrl.endsWith("/")
      ? siteUrl.slice(0, -1)
      : siteUrl;

    // Initialize Paystack transaction
    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("PAYSTACK_SECRET_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: amountInCents,
          currency: "KES",
          metadata: {
            deck_id: deckId,
            deck_name: deckName,
            profile_id: profile.id,
            clerk_user_id: clerkUserId,
            price_usd: price,
          },
          callback_url: `${normalizedSiteUrl}/payment-success`,
          channels: ["mobile_money", "card"], // Enable M-Pesa and card payments
        }),
      }
    );

    if (!paystackResponse.ok) {
      const errorData = await paystackResponse.json();
      console.error("Paystack error:", errorData);
      throw new Error(
        errorData.message || "Failed to initialize Paystack payment"
      );
    }

    const paystackData = await paystackResponse.json();

    return new Response(
      JSON.stringify({
        url: paystackData.data.authorization_url,
        reference: paystackData.data.reference,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in create-paystack-payment:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    const status = error instanceof ClerkAuthError ? 401 : 500;
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status,
    });
  }
});
