import { createClient } from "https://esm.sh/@supabase/supabase-js@2.78.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { deckId } = await req.json();

    if (!deckId) {
      return new Response(
        JSON.stringify({ error: 'deckId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Supabase credentials - try custom first, fall back to auto-injected
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = (Deno.env.get("CUSTOM_SUPABASE_SERVICE_KEY") || 
                                Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials are not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First get current plays count
    const { data: deck, error: fetchError } = await supabase
      .from('decks')
      .select('plays')
      .eq('id', deckId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching deck:', fetchError);
      throw fetchError;
    }

    // Increment plays count
    const { error: updateError } = await supabase
      .from('decks')
      .update({ plays: (deck.plays || 0) + 1 })
      .eq('id', deckId);

    if (updateError) {
      console.error('❌ Error updating plays:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error incrementing deck plays:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
