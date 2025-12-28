// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.78.0";
import { Webhook } from "https://esm.sh/svix@1.15.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

interface ClerkUser {
  id: string;
  email_addresses: Array<{ email_address: string; id: string }>;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
}

interface ClerkWebhookEvent {
  type: "user.created" | "user.updated" | "user.deleted";
  data: ClerkUser;
}

const getPrimaryEmail = (user: ClerkUser) => {
  return user.email_addresses?.[0]?.email_address?.toLowerCase() || null;
};

// Normalize errors so log payloads remain structured.
const normalizeError = (error: unknown) => {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }

  return { message: String(error) };
};

// Helper function to ensure user has a role assigned
const ensureUserRole = async (supabase: any, userId: string) => {
  try {
    // Check if user already has a role
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingRole) {
      console.log("✓ User already has role assigned:", userId);
      return;
    }

    // Assign default 'user' role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: userId,
        role: "user",
      });

    if (roleError) {
      // Check if it's a duplicate error (race condition)
      if (roleError.code === "23505") {
        console.log("✓ User role already exists (race condition):", userId);
      } else {
        console.error("Error assigning default role:", roleError);
      }
    } else {
      console.log("✓ Assigned default 'user' role to:", userId);
    }
  } catch (error) {
    console.error("Exception in ensureUserRole:", normalizeError(error));
  }
};

const withEventContext = async (
  eventType: ClerkWebhookEvent["type"],
  userId: string,
  handler: () => Promise<Response>,
  context: Record<string, unknown> = {}
) => {
  const startedAt = Date.now();
  console.log(`[${eventType}] Handler start`, { userId, ...context });

  try {
    const response = await handler();
    console.log(`[${eventType}] Handler success`, {
      userId,
      durationMs: Date.now() - startedAt,
    });
    return response;
  } catch (error) {
    console.error(`[${eventType}] Handler error`, {
      userId,
      durationMs: Date.now() - startedAt,
      ...context,
      error: normalizeError(error),
    });
    throw error;
  }
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    const headers = new Headers(corsHeaders);
    const requestedHeaders = req.headers.get("Access-Control-Request-Headers");
    if (requestedHeaders) {
      headers.set("Access-Control-Allow-Headers", requestedHeaders);
    }
    return new Response(null, { headers, status: 204 });
  }

  let eventContext: Record<string, unknown> = {
    eventType: "unverified",
    userId: null,
  };

  try {

    // Get Clerk webhook secret
    const webhookSecret = Deno.env.get("CLERK_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("CLERK_WEBHOOK_SECRET is not configured");
      throw new Error("Webhook secret not configured");
    }

    // Validate webhook secret format
    if (!webhookSecret.startsWith("whsec_")) {
      console.error(
        "CLERK_WEBHOOK_SECRET has invalid format. Expected format: whsec_..."
      );
      throw new Error("Webhook secret has invalid format");
    }

    // Get Supabase credentials - try custom first, fall back to auto-injected
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("CUSTOM_SUPABASE_SERVICE_KEY") || 
                               Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Missing Supabase credentials:", {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey,
      });
      throw new Error("Supabase credentials not configured");
    }

    // Verify webhook signature using Svix
    const wh = new Webhook(webhookSecret);
    const payload = await req.text();
    const headers = {
      "svix-id": req.headers.get("svix-id") || "",
      "svix-timestamp": req.headers.get("svix-timestamp") || "",
      "svix-signature": req.headers.get("svix-signature") || "",
    };

    let evt: ClerkWebhookEvent;
    try {
      evt = wh.verify(payload, headers) as ClerkWebhookEvent;
    } catch (verifyError) {
      console.error("✗ Webhook verification failed:", {
        error: verifyError.message,
        headers: headers,
      });
      throw verifyError;
    }

    // Create Supabase client with service role key
    // Service role key bypasses RLS - webhooks need admin access to create/update profiles
    // RLS policies protect user access, not admin/webhook access
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const email = getPrimaryEmail(evt.data);
    const { id, username, image_url } = evt.data;
    eventContext = { eventType: evt.type, userId: id, email };

    const resolveExistingProfile = async () => {
      // Check if profile already exists with Clerk user ID
      const { data: existingProfile, error: profileLookupError } =
        await supabase.from("profiles").select("*").eq("id", id).maybeSingle();

      if (profileLookupError && profileLookupError.code !== "PGRST116") {
        console.error("Error looking up profile by id:", profileLookupError);
        throw profileLookupError;
      }

      return existingProfile ?? null;
    };

    // Handle user.created event
    if (evt.type === "user.created") {
      return withEventContext(
        evt.type,
        id,
        async () => {
          console.log("Creating or linking profile for Clerk user:", id);

          const existingProfile = await resolveExistingProfile();

          if (existingProfile) {
            console.log(
              "Profile already exists for Clerk user:",
              existingProfile.id
            );

            const updatePayload: Record<string, unknown> = {
              updated_at: new Date().toISOString(),
            };

            if (email) {
              updatePayload.email = email;
            }

            if (image_url) {
              updatePayload.avatar_url = image_url;
            }

            const { data, error } = await supabase
              .from("profiles")
              .update(updatePayload)
              .eq("id", id)
              .select()
              .single();

            if (error) {
              console.error("Error updating existing profile:", error);
              throw error;
            }

            console.log("Updated existing profile:", data.id);

            // Ensure user has default 'user' role
            await ensureUserRole(supabase, id);

            return new Response(
              JSON.stringify({ success: true, profile: data }),
              {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
              }
            );
          }

          // Check if a profile with this email/username already exists
          const profileUsername = username || email || id;
          const { data: existingByUsername } = await supabase
            .from("profiles")
            .select("id, username, email")
            .or(`email.eq.${email},username.eq.${profileUsername}`)
            .maybeSingle();

          if (existingByUsername) {
            // Profile exists with this email/username - update it
            console.log("Found existing profile by email/username, updating with Clerk ID");
            
            const { data, error } = await supabase
              .from("profiles")
              .update({
                id: id,
                avatar_url: image_url || existingByUsername.avatar_url,
              })
              .eq("id", existingByUsername.id)
              .select()
              .single();

            if (error) {
              console.error("✗ Error updating existing profile:", error);
              throw error;
            }

            console.log("✓ Successfully linked profile to Clerk user:", data.id);
            
            // Ensure user has default 'user' role
            await ensureUserRole(supabase, id);

            return new Response(
              JSON.stringify({ success: true, profile: data }),
              {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
              }
            );
          }

          // No existing profile - create new one
          const insertPayload = {
            id: id, // Use Clerk user ID as primary key
            username: profileUsername,
            email,
            avatar_url: image_url || null,
          };

          console.log("Attempting to insert profile:", insertPayload);
          const { data, error } = await supabase
            .from("profiles")
            .insert(insertPayload)
            .select()
            .single();

          if (error) {
            console.error("✗ Error creating new profile for Clerk user:", {
              error,
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint,
            });
            throw error;
          }

          console.log(
            "✓ Successfully created profile for Clerk user:",
            data.id
          );

          // Ensure user has default 'user' role
          await ensureUserRole(supabase, id);

          return new Response(
            JSON.stringify({ success: true, profile: data }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            }
          );
        },
        { email }
      );
    }

    // Handle user.updated event
    if (evt.type === "user.updated") {
      return withEventContext(
        evt.type,
        id,
        async () => {
          console.log("Updating profile for Clerk user:", id);

          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", id)
            .maybeSingle();

          if (profileError && profileError.code !== "PGRST116") {
            console.error("Error fetching profile for update:", profileError);
            throw profileError;
          }

          if (!profile) {
            console.warn(
              "No profile found for Clerk user on update. Attempting to create."
            );

            const insertPayload = {
              id: id, // Use Clerk user ID as primary key
              username: username || email || id,
              email,
              avatar_url: image_url || null,
            };

            const { data: createdProfile, error: createError } = await supabase
              .from("profiles")
              .insert(insertPayload)
              .select()
              .single();

            if (createError) {
              console.error(
                "Error creating profile during update fallback:",
                createError
              );
              throw createError;
            }

            // Ensure user has default 'user' role
            await ensureUserRole(supabase, id);

            return new Response(
              JSON.stringify({ success: true, profile: createdProfile }),
              {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
              }
            );
          }

          const updatePayload: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
          };

          if (username) {
            updatePayload.username = username;
          }

          if (image_url) {
            updatePayload.avatar_url = image_url;
          }

          if (email) {
            updatePayload.email = email;
          }

          const { data: updatedProfile, error: updateError } = await supabase
            .from("profiles")
            .update(updatePayload)
            .eq("id", profile.id)
            .select()
            .single();

          if (updateError) {
            console.error(
              "Error updating profile for Clerk user:",
              updateError
            );
            throw updateError;
          }

          console.log(
            "Successfully updated profile for Clerk user:",
            updatedProfile.id
          );

          return new Response(
            JSON.stringify({ success: true, profile: updatedProfile }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            }
          );
        },
        { email }
      );
    }

    // Handle user.deleted event
    if (evt.type === "user.deleted") {
      return withEventContext(evt.type, id, async () => {
        console.log("Deleting profile for Clerk user:", id);

        // Note: Due to RLS policies, we might need to handle this differently
        // For now, we'll log it but not delete to preserve data integrity
        console.log(
          "User deletion event received. Manual cleanup may be required for user:",
          id
        );

        return new Response(
          JSON.stringify({ success: true, message: "User deletion logged" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      });
    }

    // For other event types, just acknowledge
    return new Response(
      JSON.stringify({ received: true, event_type: evt.type }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("=== Webhook Error ===");
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      raw: error,
      eventContext,
    });

    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        error: message,
        details: "Check edge function logs for more information",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
