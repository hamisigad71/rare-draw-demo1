// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ClerkAuthError, requireClerkUserId } from "../_shared/clerk-auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
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

    const {
      deckId,
      deckName,
      deckTheme,
      deckDescription,
      cardsToGenerate = 50,
    } = await req.json();

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const openAiModel = Deno.env.get("OPENAI_MODEL") ?? "gpt-4.1-mini";

    // Get Supabase credentials - try custom first, fall back to auto-injected
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase credentials are not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", clerkUserId)
      .maybeSingle();

    if (profileError) {
      console.error(
        "Error verifying Clerk profile before card generation:",
        profileError
      );
      throw profileError;
    }

    if (!profile) {
      return new Response(
        JSON.stringify({
          error: "You do not have permission to generate cards.",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate 50 cards using AI with simplified prompt
    const today = new Date().toISOString().split("T")[0];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: openAiModel,
        temperature: 0.85,
        top_p: 0.9,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "card_collection",
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                cards: {
                  type: "array",
                  minItems: cardsToGenerate,
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["action_type", "description"],
                    properties: {
                      action_type: {
                        type: "string",
                        enum: ["truth", "dare"],
                      },
                      description: {
                        type: "string",
                        minLength: 8,
                        maxLength: 280,
                      },
                      suggester_nickname: {
                        type: "string",
                        description:
                          "Optional player nickname who originally suggested this prompt.",
                        minLength: 1,
                        maxLength: 64,
                      },
                      inspiration: {
                        type: "string",
                        description:
                          "Brief note about the cultural or conversational insight that inspired the prompt.",
                      },
                    },
                  },
                },
              },
              required: ["cards"],
            },
          },
        },
        messages: [
          {
            role: "system",
            content:
              "You are an award-winning conversation designer who creates culturally relevant, emotionally intelligent truth-or-dare prompts. Always respond with strict JSON.",
          },
          {
            role: "user",
            content: `Date: ${today}
Deck name: ${deckName}
Theme: ${deckTheme}
Description: ${deckDescription ?? ""}
Cards requested: ${cardsToGenerate}

Generate an even mix of truth and dare cards tailored to the theme.
- Prioritize fresh, trending cultural touchpoints and global conversations from the past year.
- Blend lighthearted dares with thoughtful truth questions that invite meaningful dialogue.
- Avoid duplicate ideas. Each title must be unique.
- Truth prompts must dig deeper than small talk and encourage vulnerability.
- Dare prompts must remain safe for hybrid virtual/physical play while still adventurous.
- Include optional 'inspiration' notes that cite the trend, pop-culture moment, or human insight informing each card.

Return a JSON object matching the provided schema.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("OpenAI raw response:", data);
      throw new Error("No content in AI response");
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (initialParseError) {
      console.warn("Primary JSON parse failed, attempting cleanup.");
      const sanitized = content
        .replace(/^```(?:json)?\s*/gi, "")
        .replace(/\s*```$/g, "");

      try {
        parsed = JSON.parse(sanitized);
      } catch (fallbackError) {
        console.error("JSON parse error:", fallbackError);
        console.error("Failed to parse:", sanitized);
        throw new Error(
          `Failed to parse AI response as JSON: ${
            fallbackError instanceof Error
              ? fallbackError.message
              : "Unknown error"
          }`
        );
      }
    }

    const cards = Array.isArray(parsed) ? parsed : parsed?.cards;

    if (!Array.isArray(cards)) {
      console.error("Unexpected JSON structure:", parsed);
      throw new Error("AI response is missing a cards array");
    }

    const targetTruth = Math.ceil(cardsToGenerate / 2);
    const targetDare = Math.floor(cardsToGenerate / 2);
    let truthCount = 0;
    let dareCount = 0;

    const normalizedCards = [] as Array<{
      action_type: "truth" | "dare";
      description: string;
      suggester_nickname?: string | null;
    }>;

    for (const card of cards) {
      if (!card || !card.description) {
        continue;
      }

      let actionType =
        typeof card.action_type === "string"
          ? card.action_type.toLowerCase()
          : "";

      if (actionType !== "truth" && actionType !== "dare") {
        actionType = truthCount <= dareCount ? "truth" : "dare";
      }

      if (
        actionType === "truth" &&
        truthCount >= targetTruth &&
        dareCount < targetDare
      ) {
        actionType = "dare";
      } else if (
        actionType === "dare" &&
        dareCount >= targetDare &&
        truthCount < targetTruth
      ) {
        actionType = "truth";
      }

      normalizedCards.push({
        action_type: actionType,
        description: String(card.description).trim(),
        suggester_nickname:
          typeof card.suggester_nickname === "string"
            ? card.suggester_nickname.trim().slice(0, 64)
            : null,
      });

      if (actionType === "truth") {
        truthCount++;
      } else {
        dareCount++;
      }

      if (normalizedCards.length >= cardsToGenerate) {
        break;
      }
    }

    if (!normalizedCards.length) {
      throw new Error("AI response did not contain any usable cards");
    }

    const finalCards = normalizedCards.slice(0, cardsToGenerate);

    // Insert cards into database
    const cardsToInsert = finalCards.map((card, index) => ({
      deck_id: deckId,
      action_type: card.action_type,
      description: card.description,
      suggester_nickname: card.suggester_nickname ?? null,
      order_index: index,
    }));

    const { error: insertError } = await supabase
      .from("cards")
      .insert(cardsToInsert);

    if (insertError) {
      console.error("Insert error:", insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        cardsGenerated: cards.length,
        deckName,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (error instanceof ClerkAuthError) {
      console.warn("Clerk authentication failed:", message);
      console.warn(
        "This could mean: 1) Token expired 2) Invalid token 3) Clerk configuration issue"
      );
      return new Response(
        JSON.stringify({
          error:
            "Authentication failed. Please try signing out and signing back in.",
          details: message,
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.error("Error in generate-deck-cards:", error);
    return new Response(
      JSON.stringify({
        error: message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
